// backend/src/routes/grants.ts
import { Router, Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

const router = Router();

function requireAuthOrSkip(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") return next();
  const auth = (req.headers.authorization || "").toLowerCase();
  if (!auth.startsWith("bearer ")) return res.status(401).json({ error: "Unauthorized" });
  return next();
}

/**
 * Very defensive scorer: works even if preferences or fields are missing.
 * Produces an integer 0..100.
 */
function computeMatchScore(grant: any, prefs: any): number {
  if (!prefs) return 0;

  // Pull fields safely
  const orgType = (prefs?.orgType ?? "").toString().toLowerCase();
  const sectors: string[] = Array.isArray(prefs?.sectors) ? prefs.sectors : [];
  const states: string[] = Array.isArray(prefs?.states) ? prefs.states : (prefs?.state ? [prefs.state] : []);
  const keywords: string[] = Array.isArray(prefs?.keywords) ? prefs.keywords : [];
  const minNeeded = Number.isFinite(prefs?.fundingMin) ? Number(prefs.fundingMin) : null;
  const maxNeeded = Number.isFinite(prefs?.fundingMax) ? Number(prefs.fundingMax) : null;

  const text = [
    grant?.title ?? "",
    grant?.summary ?? "",
    grant?.description ?? "",
    grant?.purpose ?? "",
  ]
    .join(" ")
    .toLowerCase();

  // Simple feature points (total weights sum to 1.0)
  let score = 0;
  let weightTotal = 0;

  // 1) Sector/tag overlap (0.35)
  if (sectors.length) {
    const hits = sectors.filter(s => s && text.includes(String(s).toLowerCase())).length;
    const sectorScore = Math.min(hits / Math.max(sectors.length, 1), 1);
    score += sectorScore * 0.35;
    weightTotal += 0.35;
  }

  // 2) Keyword overlap (0.30)
  if (keywords.length) {
    const hits = keywords.filter(k => k && text.includes(String(k).toLowerCase())).length;
    const kwScore = Math.min(hits / Math.max(keywords.length, 1), 1);
    score += kwScore * 0.30;
    weightTotal += 0.30;
  }

  // 3) Org type hint (0.15)
  if (orgType) {
    const orgHit =
      text.includes(orgType) ||
      (grant?.eligibility ?? "").toString().toLowerCase().includes(orgType);
    score += (orgHit ? 1 : 0) * 0.15;
    weightTotal += 0.15;
  }

  // 4) Location/state (0.10) — match if any preferred state appears in text or grant.state(s)
  const grantStates: string[] = Array.isArray(grant?.states) ? grant.states : (grant?.state ? [grant.state] : []);
  if (states.length) {
    const statesLower = states.map(s => String(s).toLowerCase());
    const grantStatesLower = grantStates.map(s => String(s).toLowerCase());
    const anyMatchInField = statesLower.some(s => grantStatesLower.includes(s));
    const anyMatchInText = statesLower.some(s => text.includes(s));
    score += (anyMatchInField || anyMatchInText ? 1 : 0) * 0.10;
    weightTotal += 0.10;
  }

  // 5) Funding range fit (0.10)
  const gMin = Number.isFinite(grant?.fundingMin) ? Number(grant.fundingMin) : null;
  const gMax = Number.isFinite(grant?.fundingMax) ? Number(grant.fundingMax) : null;
  if (minNeeded != null || maxNeeded != null) {
    // Heuristic: treat fit as overlap between [gMin,gMax] and [minNeeded,maxNeeded]
    const a1 = gMin ?? 0;
    const a2 = gMax ?? a1;
    const b1 = minNeeded ?? 0;
    const b2 = maxNeeded ?? b1;
    const overlap = Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
    const span = Math.max(a2 - a1, b2 - b1, 1);
    const fundScore = Math.min(overlap / span, 1);
    score += fundScore * 0.10;
    weightTotal += 0.10;
  }

  if (weightTotal === 0) return 0;
  return Math.round((score / weightTotal) * 100);
}

router.post("/internal/grants", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
    const q = (req.body?.q ?? "").toString().trim();
    const limit = Math.min(Math.max(Number(req.body?.limit ?? 24), 1), 100);
    const offset = Math.max(Number(req.body?.offset ?? 0), 0);

    const clerkId =
      (req.query?.clerkId as string) ||
      (req.body?.clerkId as string) ||
      (req.headers["x-clerk-id"] as string) ||
      "";

    const where: Prisma.GrantWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { summary: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [rows, count, prefs] = await Promise.all([
      prisma.grant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          agency: { select: { id: true, name: true, url: true } },
          // include states/tags if you have relations; keep optional
          // states: true, tags: true,
        },
      }),
      prisma.grant.count({ where }),
      clerkId
        ? prisma.preferences.findUnique({ where: { clerkId } }).catch(() => null)
        : Promise.resolve(null),
    ]);

    const items = rows.map((g) => {
      const matchScore = computeMatchScore(g, prefs);
      return {
        id: g.id,
        title: g.title,
        summary: g.summary || g.description?.slice(0, 280) || "",
        url: g.url || g.agency?.url || null,
        agency: g.agency?.name ?? null,
        deadline: g.deadline,
        currency: g.currency,
        fundingMin: g.fundingMin,
        fundingMax: g.fundingMax,
        matchScore,           // ✅ 0..100 integer
      };
    });

    return res.json({ ok: true, query: q, items, grants: items, count });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "server error in /internal/grants" });
  }
});

export default router;
