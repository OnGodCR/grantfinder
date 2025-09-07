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

/** ---------- tiny helpers ---------- */
function toTokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Recall-like content overlap:
 * (# of unique user tokens found in grant text) / (# of unique user tokens)
 * If userTokens is empty, return 0.
 */
function contentRecall(userTokens: string[], grantText: string): number {
  const u = unique(userTokens);
  if (u.length === 0) return 0;
  const text = ` ${grantText.toLowerCase()} `;
  let hits = 0;
  for (const t of u) {
    if (t.length < 3) continue; // ignore tiny words
    if (text.includes(` ${t} `) || text.includes(` ${t}`) || text.includes(`${t} `)) hits++;
  }
  return hits / u.length;
}

/** Normalize a 0..1 value safely to 0..100 integer */
function pct01(x: number): number {
  if (!isFinite(x) || isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 100;
  return Math.round(x * 100);
}

/**
 * Build a compact "profile" token set from preferences.
 * Adjust field names to your actual preferences schema if needed.
 */
function tokensFromPrefs(prefs: any): string[] {
  if (!prefs) return [];
  const fields: string[] = [];

  // Common preference fields — rename to match your DB:
  // strings
  if (prefs.orgType) fields.push(prefs.orgType);
  if (prefs.locationState) fields.push(prefs.locationState);
  if (prefs.locationCountry) fields.push(prefs.locationCountry);
  if (prefs.mission) fields.push(prefs.mission);

  // arrays
  if (Array.isArray(prefs.focusAreas)) fields.push(...prefs.focusAreas);
  if (Array.isArray(prefs.grantTypes)) fields.push(...prefs.grantTypes);
  if (Array.isArray(prefs.keywords)) fields.push(...prefs.keywords);

  // booleans as keywords
  if (prefs.isNonprofit) fields.push("nonprofit");
  if (prefs.isForProfit) fields.push("for-profit");
  if (prefs.isStartup) fields.push("startup");
  if (prefs.isResearch) fields.push("research");

  // numbers/budgets (coerce into coarse tokens)
  if (typeof prefs.budgetMin === "number") fields.push(`budgetmin_${Math.floor(prefs.budgetMin / 1000)}k`);
  if (typeof prefs.budgetMax === "number") fields.push(`budgetmax_${Math.floor(prefs.budgetMax / 1000)}k`);

  // free text
  if (prefs.goals) fields.push(prefs.goals);
  if (prefs.description) fields.push(prefs.description);

  // Flatten to tokens
  return unique(fields.flatMap(toTokens));
}

/**
 * Final score 0..100 using:
 *  - 70% content recall (profile tokens vs grant title+summary+description+agency)
 *  - 30% light heuristics (location/sector style hints if present)
 * Tweak weights as you wish.
 */
function computeScore(grant: any, profileTokens: string[]): number {
  const title = grant.title || "";
  const summary = grant.summary || "";
  const desc = grant.description || "";
  const agencyName = grant.agency?.name || "";
  const text = [title, summary, desc, agencyName].join(" ");

  const recall = contentRecall(profileTokens, text); // 0..1

  // Light heuristics (examples): boost if "nonprofit"/"startup" appears in grant text
  let heur = 0;
  const t = text.toLowerCase();
  const hasNonprofit = t.includes("nonprofit") || t.includes("non-profit");
  const hasStartup = t.includes("startup") || t.includes("start-up");
  const hasResearch = t.includes("research");
  const hints = [
    profileTokens.includes("nonprofit") && hasNonprofit,
    profileTokens.includes("startup") && hasStartup,
    profileTokens.includes("research") && hasResearch,
  ].filter(Boolean).length;
  if (hints > 0) {
    // each hint adds a small boost up to 0.3
    heur = Math.min(0.1 * hints, 0.3);
  }

  const score01 = 0.7 * recall + 0.3 * heur; // clamp handled by pct01
  return pct01(score01);
}

router.post("/internal/grants", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
    const q = (req.body?.q ?? "").toString().trim();
    const limit = Math.min(Math.max(Number(req.body?.limit ?? 24), 1), 100);
    const offset = Math.max(Number(req.body?.offset ?? 0), 0);
    const clerkId = (req.body?.clerkId ?? "").toString().trim() || null;

    const where: Prisma.GrantWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { summary: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    // Load preferences if we got a clerkId.
    // Adjust to your actual model/table name & unique constraint.
    let prefs: any = null;
    if (clerkId) {
      try {
        // Example: table name "Preference" with unique clerkId
        prefs = await prisma.preference.findUnique({
          where: { clerkId },
        });
      } catch (e) {
        // don't crash scoring if table is different/missing
        console.warn("preferences load failed for clerkId:", clerkId, e);
      }
    }

    const profileTokens = tokensFromPrefs(prefs);

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
      const score = computeScore(g, profileTokens);
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
        matchScore: score, // ✅ always 0..100
      };
    });

    return res.json({ ok: true, query: q, items, grants: items, count });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "server error in /internal/grants" });
  }
});

export default router;
