// backend/src/routes/grants.ts
import { Router, Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

const router = Router();

// Dev auth bypass
function requireAuthOrSkip(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") return next();
  const auth = (req.headers.authorization || "").toLowerCase();
  if (!auth.startsWith("bearer ")) return res.status(401).json({ error: "Unauthorized" });
  return next();
}

/** --- tiny helpers for scoring --- */
function toTokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  a.forEach((x) => { if (b.has(x)) inter++; });
  const union = a.size + b.size - inter;
  return union > 0 ? inter / union : 0;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/**
 * Compute a 0–100 match score using:
 * - 70%: Jaccard overlap between user's (keywords + researchAreas) tokens and grant (title + summary + description) tokens
 * - 30%: Preferred source match (agency name matches any preferredSources entry)
 */
function computeScore(
  userKeywords: string[],
  userAreas: string[],
  preferredSources: string[],
  grantText: string,
  grantAgencyName?: string | null
): number {
  const userSet = new Set<string>([...userKeywords, ...userAreas].flatMap(toTokens));
  const grantSet = new Set<string>(toTokens(grantText));

  const textSim = jaccard(userSet, grantSet); // 0..1

  let sourceBonus = 0;
  if (grantAgencyName) {
    const g = grantAgencyName.toLowerCase();
    const hit = (preferredSources || []).some((s) => g.includes(String(s || "").toLowerCase()));
    sourceBonus = hit ? 1 : 0; // 0 or 1
  }

  const score =
    0.7 * textSim +
    0.3 * sourceBonus;

  return Math.round(clamp01(score) * 100);
}

// POST /api/internal/grants
router.post("/internal/grants", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
    const q = (req.body?.q ?? "").toString().trim();
    const limit = Math.min(Math.max(Number(req.body?.limit ?? 24), 1), 100);
    const offset = Math.max(Number(req.body?.offset ?? 0), 0);
    const clerkId = (req.body?.clerkId ?? "").toString().trim() || null;

    // search condition
    const where: Prisma.GrantWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    // prefetch user profile (optional)
    let userKeywords: string[] = [];
    let userAreas: string[] = [];
    let preferredSources: string[] = [];

    if (clerkId) {
      const prof = await prisma.userProfile.findUnique({
        where: { clerkId },
        select: {
          keywords: true,
          researchAreas: true,
          preferredSources: true,
        },
      });
      if (prof) {
        userKeywords = prof.keywords || [];
        userAreas = prof.researchAreas || [];
        preferredSources = prof.preferredSources || [];
      }
    }

    const [rows, count] = await Promise.all([
      prisma.grant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          agency: { select: { id: true, name: true, url: true } },
        },
      }),
      prisma.grant.count({ where }),
    ]);

    const items = rows.map((g) => {
      const summary = g.summary || g.description?.slice(0, 280) || "";
      const grantText = [g.title, g.summary || "", g.description || ""].join(" ");
      const scorePercent = (userKeywords.length + userAreas.length) > 0 || preferredSources.length > 0
        ? computeScore(userKeywords, userAreas, preferredSources, grantText, g.agency?.name ?? null)
        : null; // null when we can't compute

      return {
        id: g.id,
        title: g.title,
        summary,
        url: g.url || g.agency?.url || null,
        agency: g.agency?.name || null,
        deadline: g.deadline,
        currency: g.currency,
        fundingMin: g.fundingMin,
        fundingMax: g.fundingMax,
        // 👇 new field the frontend can display as a percent
        scorePercent,
      };
    });

    return res.json({ ok: true, query: q, items, grants: items, count });
  } catch (err: any) {
    console.error("grants route error:", err?.stack || err?.message || err);
    return res.status(500).json({ ok: false, error: "server error in /internal/grants" });
  }
});

export default router;
