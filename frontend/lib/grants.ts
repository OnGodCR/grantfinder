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

/** ---------- prefs loader (dynamic) ---------- */
const DEFAULT_PREFS_MODELS = (process.env.PREFS_MODELS || "Preference,UserPreference,Profile,Me,UserPrefs,Settings")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

async function loadPrefsByClerkId(clerkId: string) {
  for (const name of DEFAULT_PREFS_MODELS) {
    const model = (prisma as any)[name];
    if (!model) continue;

    try {
      if (typeof model.findUnique === "function") {
        const found = await model.findUnique({ where: { clerkId } });
        if (found) return found;
      }
      if (typeof model.findFirst === "function") {
        const found = await model.findFirst({ where: { clerkId } });
        if (found) return found;
      }
    } catch {
      // ignore and try next model
    }
  }
  return null;
}

/** ---------- scoring helpers ---------- */
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

function contentRecall(userTokens: string[], grantText: string): number {
  const u = unique(userTokens);
  if (u.length === 0) return 0;
  const text = ` ${grantText.toLowerCase()} `;
  let hits = 0;
  for (const t of u) {
    if (t.length < 3) continue;
    if (text.includes(` ${t} `) || text.includes(` ${t}`) || text.includes(`${t} `)) hits++;
  }
  return hits / u.length;
}

function pct01(x: number): number {
  if (!isFinite(x) || isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 100;
  return Math.round(x * 100);
}

function tokensFromPrefs(prefs: any): string[] {
  if (!prefs) return [];
  const fields: string[] = [];

  const pushStr = (v?: any) => { if (typeof v === "string" && v.trim()) fields.push(v); };
  const pushArr = (v?: any) => { if (Array.isArray(v)) fields.push(...v.map(String)); };

  pushStr(prefs.orgType);
  pushStr(prefs.locationState);
  pushStr(prefs.locationCountry);
  pushStr(prefs.mission);
  pushStr(prefs.description);
  pushStr(prefs.goals);

  pushArr(prefs.focusAreas);
  pushArr(prefs.grantTypes);
  pushArr(prefs.keywords);
  pushArr(prefs.tags);

  if (prefs.isNonprofit) fields.push("nonprofit");
  if (prefs.isForProfit) fields.push("for-profit");
  if (prefs.isStartup) fields.push("startup");
  if (prefs.isResearch) fields.push("research");

  if (typeof prefs.budgetMin === "number") fields.push(`budgetmin_${Math.floor(prefs.budgetMin / 1000)}k`);
  if (typeof prefs.budgetMax === "number") fields.push(`budgetmax_${Math.floor(prefs.budgetMax / 1000)}k`);

  return unique(
    fields
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length >= 3)
  );
}

function computeScore(grant: any, profileTokens: string[]): number {
  const title = grant.title || "";
  const summary = grant.summary || "";
  const desc = grant.description || "";
  const agencyName = grant.agency?.name || "";
  const text = [title, summary, desc, agencyName].join(" ");

  const recall = contentRecall(profileTokens, text);

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

  if (hints > 0) heur = Math.min(0.1 * hints, 0.3);

  const score01 = 0.7 * recall + 0.3 * heur;
  return pct01(score01);
}

/** ---------- route ---------- */
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

    let prefs: any = null;
    if (clerkId) {
      prefs = await loadPrefsByClerkId(clerkId);
    }

    const profileTokens = tokensFromPrefs(prefs);

    const [rows, count] = await Promise.all([
      prisma.grant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          agency: { select: { id: true, name: true, url: true} },
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
        matchScore: score,
      };
    });

    return res.json({ ok: true, query: q, items, grants: items, count });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "server error in /internal/grants" });
  }
});

export default router;
