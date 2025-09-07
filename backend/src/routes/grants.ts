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

/** --------------------------
 *  Scoring helpers
 *  -------------------------*/
const STOP = new Set([
  "the","a","an","and","or","of","to","in","for","on","with","by","at","from","is","are","as","that","this","these","those","it","its","be","been","was","were","will","can","may","into","about","over","under","between","within","using","use"
]);

function tokenize(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w));
}

function fundingLevelToRange(level?: string): [number, number] | null {
  switch (level) {
    case "< $50K": return [0, 50_000];
    case "$50K–$250K": return [50_000, 250_000];
    case "$250K–$1M": return [250_000, 1_000_000];
    case "> $1M": return [1_000_000, Number.MAX_SAFE_INTEGER];
    default: return null;
  }
}

function fundingMatches(level: string | undefined, grantMin?: number | null, grantMax?: number | null): boolean {
  const r = fundingLevelToRange(level);
  if (!r) return false;
  const [lo, hi] = r;
  // Use grantMax if present, else grantMin. If neither, cannot check.
  const g = (typeof grantMax === "number" ? grantMax : (typeof grantMin === "number" ? grantMin : null));
  if (g == null) return false;
  return g >= lo && g <= hi;
}

/** Core scoring: 0..100
 * Weights:
 * - keyword token hit: 3 each
 * - research areas token hit: 2 each
 * - funding categories token hit: 1 each
 * - preferred source (agency) match: +6
 * - funding level match: +8
 * - deadline boost when user prefers deadlines & within 60d: +4
 * Then clamp to [0,100].
 */
function computeMatchScore(grant: any, profile: any | null): number {
  if (!profile) return 0;

  const text = [
    grant.title || "",
    grant.summary || "",
    grant.description || "",
    grant.purpose || "",
  ].join(" ");
  const gTokens = new Set(tokenize(text));

  const kw = (profile.keywords || []) as string[];
  const areas = (profile.researchAreas || []) as string[];
  const cats = (profile.fundingCategories || []) as string[];
  const preferred = (profile.preferredSources || []) as string[];

  let score = 0;

  // Token overlap
  for (const t of tokenize(kw.join(" "))) if (gTokens.has(t)) score += 3;
  for (const t of tokenize(areas.join(" "))) if (gTokens.has(t)) score += 2;
  for (const t of tokenize(cats.join(" "))) if (gTokens.has(t)) score += 1;

  // Preferred source (agency name contains any preferred source label)
  const agencyName = (grant.agency?.name || grant.source || "").toLowerCase();
  if (agencyName && preferred.some((p: string) => agencyName.includes(p.toLowerCase()))) {
    score += 6;
  }

  // Funding level
  if (fundingMatches(profile.fundingLevel, grant.fundingMin, grant.fundingMax)) {
    score += 8;
  }

  // Deadline boost (if user likes near-term deadlines)
  const d = grant.deadline ? new Date(grant.deadline) : null;
  if (profile.deadlineFirst && d) {
    const daysLeft = Math.ceil((+d - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0 && daysLeft <= 60) score += 4;
  }

  // Soft normalization: convert “raw” points to percentage-ish feel.
  // Cap at 100; small baseline so non-zero matches don’t look too tiny.
  return Math.max(0, Math.min(100, Math.round(score)));
}

router.post("/internal/grants", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
    const q = (req.body?.q ?? "").toString().trim();
    const limit = Math.min(Math.max(Number(req.body?.limit ?? 24), 1), 100);
    const offset = Math.max(Number(req.body?.offset ?? 0), 0);
    const clerkId = (req.body?.clerkId ?? "").toString().trim() || undefined;

    const where: Prisma.GrantWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { summary: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    // pull profile once for scoring
    const profile = clerkId
      ? await prisma.userProfile.findUnique({ where: { clerkId } })
      : null;

    const [rows, count] = await Promise.all([
      prisma.grant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: { agency: { select: { id: true, name: true, url: true } } },
      }),
      prisma.grant.count({ where }),
    ]);

    const items = rows.map((g) => {
      const matchScore = computeMatchScore(g, profile); // 0..100
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
        matchScore, // <-- add to payload
      };
    });

    return res.json({ ok: true, query: q, items, grants: items, count });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "server error in /internal/grants" });
  }
});

export default router;
