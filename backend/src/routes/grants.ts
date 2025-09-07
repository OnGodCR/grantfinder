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
        if (found) return { record: found, sourceModel: name };
      }
      if (typeof model.findFirst === "function") {
        const found = await model.findFirst({ where: { clerkId } });
        if (found) return { record: found, sourceModel: name };
      }
    } catch {
      // ignore and try next
    }
  }
  return { record: null, sourceModel: null };
}

/** ---------- token helpers ---------- */
function smartSplit(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.flatMap(smartSplit);
  if (typeof input === "string") {
    // try JSON array strings or comma / semicolon lists
    const trimmed = input.trim();
    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {}
    }
    return trimmed.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeTokens(arr: string[], minLen = 3): string[] {
  const words = arr
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter(w => w.length >= minLen);
  return Array.from(new Set(words));
}

function tokensFromPrefs(prefs: any): string[] {
  if (!prefs) return [];
  const bucket: string[] = [];

  const add = (v: any) => bucket.push(...smartSplit(v));
  const addStr = (v: any) => { if (typeof v === "string" && v.trim()) bucket.push(v); };

  // Common fields (adapt freely)
  addStr(prefs.orgType);
  addStr(prefs.locationState);
  addStr(prefs.locationCountry);
  addStr(prefs.mission);
  addStr(prefs.description);
  addStr(prefs.goals);

  add(prefs.focusAreas);
  add(prefs.grantTypes);
  add(prefs.keywords);
  add(prefs.tags);
  add(prefs.programAreas);

  if (prefs.isNonprofit) bucket.push("nonprofit");
  if (prefs.isForProfit) bucket.push("for-profit");
  if (prefs.isStartup) bucket.push("startup");
  if (prefs.isResearch) bucket.push("research");

  if (typeof prefs.budgetMin === "number") bucket.push(`budgetmin_${Math.floor(prefs.budgetMin / 1000)}k`);
  if (typeof prefs.budgetMax === "number") bucket.push(`budgetmax_${Math.floor(prefs.budgetMax / 1000)}k`);

  return normalizeTokens(bucket);
}

/** ---------- matching ---------- */
function grantText(grant: any): string {
  const title = grant.title || "";
  const summary = grant.summary || "";
  const desc = grant.description || "";
  const agencyName = grant.agency?.name || "";
  return [title, summary, desc, agencyName].join(" ").toLowerCase();
}

function contentRecall(userTokens: string[], text: string): number {
  const toks = Array.from(new Set(userTokens));
  if (toks.length === 0) return 0;
  if (!text) return 0;
  let hits = 0;
  for (const t of toks) {
    if (t.length < 3) continue;
    // word-boundary or substring fallback
    const re = new RegExp(`\\b${escapeRegex(t)}\\b`, "i");
    if (re.test(text) || text.includes(t)) hits++;
  }
  return hits / toks.length;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pct01(x: number): number {
  if (!isFinite(x) || isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 100;
  return Math.round(x * 100);
}

function computeScore(grant: any, profileTokens: string[]): number {
  const text = grantText(grant);
  const recall = contentRecall(profileTokens, text);

  // simple semantic hints
  let heur = 0;
  const hasNonprofit = /\bnon[-\s]?profit\b/i.test(text);
  const hasStartup = /\bstart[-\s]?up\b|\bstartup\b/i.test(text);
  const hasResearch = /\bresearch\b/i.test(text);

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
  const debug = process.env.DEBUG_SCORES === "1";

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

    // 1) Try DB preferences
    let prefsRecord: any = null;
    let prefsModel: string | null = null;
    if (clerkId) {
      const { record, sourceModel } = await loadPrefsByClerkId(clerkId);
      prefsRecord = record;
      prefsModel = sourceModel;
    }

    // 2) Fallbacks from request body (front-end can send any of these)
    const clientProvidedTokens = normalizeTokens(
      [
        ...(Array.isArray(req.body?.profileTokens) ? req.body.profileTokens : []),
        ...smartSplit(req.body?.keywords),
        ...smartSplit(req.body?.focusAreas),
        ...smartSplit(req.body?.grantTypes),
        ...smartSplit(req.body?.tags),
        ...(req.body?.orgType ? [String(req.body.orgType)] : []),
        ...(req.body?.mission ? [String(req.body.mission)] : []),
      ],
      2 // allow shorter tokens if needed
    );

    // 3) Last resort: use q as weak signal
    const qTokens = normalizeTokens([q], 3);

    // Build final profileTokens (DB -> client -> q)
    let profileTokens = tokensFromPrefs(prefsRecord);
    if (profileTokens.length === 0 && clientProvidedTokens.length > 0) {
      profileTokens = clientProvidedTokens;
    }
    if (profileTokens.length === 0 && qTokens.length > 0) {
      profileTokens = qTokens;
    }

    if (debug) {
      console.log("[scores] clerkId:", clerkId);
      console.log("[scores] prefsModel:", prefsModel);
      console.log("[scores] tokensFromPrefs:", tokensFromPrefs(prefsRecord));
      console.log("[scores] clientProvidedTokens:", clientProvidedTokens);
      console.log("[scores] qTokens:", qTokens);
      console.log("[scores] final profileTokens:", profileTokens);
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
      const score = computeScore(g, profileTokens);
      const base = {
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

      if (!debug) return base;
      return {
        ...base,
        __debug: {
          textSample: grantText(g).slice(0, 160),
        },
      };
    });

    return res.json({
      ok: true,
      query: q,
      items,
      grants: items,
      count,
      ...(debug ? { profileTokens, prefsModel } : {}),
    });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "server error in /internal/grants" });
  }
});

export default router;
