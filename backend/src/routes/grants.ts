// backend/src/routes/grants.ts
import { Router, Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { requireAuthOrSkip, requireInternalToken } from "../middleware/auth.js";
import axios from "axios";

const router = Router();

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
    } catch {}
  }
  return { record: null, sourceModel: null };
}

/**
 * Get or create User record from Clerk ID
 */
async function getOrCreateUser(clerkId: string): Promise<string | null> {
  if (!clerkId) return null;
  
  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: {
        clerkId,
        role: 'RESEARCHER',
      },
    });
    return user.id;
  } catch (error) {
    console.error(`Error getting/creating user for clerkId ${clerkId}:`, error);
    return null;
  }
}

/**
 * Save or update match scores for a user
 */
async function saveMatchScores(userId: string, grantScores: Array<{ grantId: string; score: number }>): Promise<void> {
  if (!userId || grantScores.length === 0) return;

  try {
    // Use Promise.allSettled to handle errors gracefully
    await Promise.allSettled(
      grantScores.map(async ({ grantId, score }) => {
        // Check if match already exists
        const existing = await prisma.match.findFirst({
          where: {
            userId,
            grantId,
          },
        });

        if (existing) {
          // Update existing match
          await prisma.match.update({
            where: { id: existing.id },
            data: {
              score,
              createdAt: new Date(), // Update timestamp
            },
          });
        } else {
          // Create new match
          await prisma.match.create({
            data: {
              userId,
              grantId,
              score,
            },
          });
        }
      })
    );
  } catch (error) {
    console.error(`Error saving match scores for userId ${userId}:`, error);
    // Don't throw - we want to continue even if saving fails
  }
}

/**
 * Get saved match scores for a user
 */
async function getSavedMatchScores(userId: string, grantIds: string[]): Promise<Map<string, number>> {
  if (!userId || grantIds.length === 0) return new Map();

  try {
    const matches = await prisma.match.findMany({
      where: {
        userId,
        grantId: { in: grantIds },
      },
      select: {
        grantId: true,
        score: true,
      },
    });

    const scoreMap = new Map<string, number>();
    matches.forEach((match) => {
      scoreMap.set(match.grantId, match.score);
    });

    return scoreMap;
  } catch (error) {
    console.error(`Error getting saved match scores for userId ${userId}:`, error);
    return new Map();
  }
}

/** ---------- token helpers ---------- */
function smartSplit(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.flatMap(smartSplit);
  if (typeof input === "string") {
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
  
  // Enhanced keyword matching with better scoring
  const keywordScore = calculateEnhancedKeywordMatch(text, profileTokens);
  
  // Funding amount scoring (if available)
  const fundingScore = calculateFundingScore(grant);
  
  // Deadline scoring
  const deadlineScore = calculateDeadlineScore(grant);
  
  // Agency scoring
  const agencyScore = calculateAgencyScore(grant, profileTokens);
  
  // Grant type scoring
  const typeScore = calculateTypeScore(grant, profileTokens);
  
  // Location scoring
  const locationScore = calculateLocationScore(grant, profileTokens);
  
  // Weighted final score (similar to frontend algorithm)
  const weights = {
    keywordMatch: 0.35,    // Increased weight for keywords
    fundingMatch: 0.20,
    deadlineMatch: 0.15,
    agencyMatch: 0.15,
    typeMatch: 0.10,
    locationMatch: 0.05,
  };
  
  const finalScore = 
    keywordScore * weights.keywordMatch +
    fundingScore * weights.fundingMatch +
    deadlineScore * weights.deadlineMatch +
    agencyScore * weights.agencyMatch +
    typeScore * weights.typeMatch +
    locationScore * weights.locationMatch;
  
  return Math.min(100, Math.max(0, Math.round(finalScore * 100)));
}

function calculateEnhancedKeywordMatch(text: string, profileTokens: string[]): number {
  if (profileTokens.length === 0) return 0.3; // Default decent score
  
  let totalScore = 0;
  let exactMatches = 0;
  let partialMatches = 0;
  
  for (const token of profileTokens) {
    if (token.length < 3) continue;
    
    // Exact word boundary match (higher weight)
    const exactRegex = new RegExp(`\\b${escapeRegex(token)}\\b`, 'i');
    if (exactRegex.test(text)) {
      exactMatches++;
      totalScore += 1.0;
    }
    // Partial match (lower weight)
    else if (text.includes(token.toLowerCase())) {
      partialMatches++;
      totalScore += 0.5;
    }
  }
  
  // Calculate base score
  const baseScore = totalScore / profileTokens.length;
  
  // Bonus for multiple exact matches
  const exactBonus = Math.min(exactMatches * 0.1, 0.3);
  
  // Ensure minimum score for any matches
  const finalScore = Math.max(baseScore + exactBonus, 0.2);
  
  return Math.min(finalScore, 1.0);
}

function calculateFundingScore(grant: any): number {
  if (!grant.fundingMin && !grant.fundingMax) return 0.7; // Unknown funding - good score
  
  // Simple scoring based on funding amount ranges
  const minFunding = grant.fundingMin || 0;
  const maxFunding = grant.fundingMax || minFunding;
  const avgFunding = (minFunding + maxFunding) / 2;
  
  // Score based on funding tiers
  if (avgFunding >= 1000000) return 1.0;      // $1M+ - excellent
  if (avgFunding >= 500000) return 0.9;       // $500K+ - very good
  if (avgFunding >= 100000) return 0.8;       // $100K+ - good
  if (avgFunding >= 50000) return 0.7;        // $50K+ - decent
  if (avgFunding >= 10000) return 0.6;        // $10K+ - okay
  return 0.5; // Lower amounts
}

function calculateDeadlineScore(grant: any): number {
  if (!grant.deadline) return 0.7; // Unknown deadline - good score
  
  const deadline = new Date(grant.deadline);
  const now = new Date();
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDeadline < 0) return 0.1; // Deadline passed
  
  // Scoring based on time remaining
  if (daysUntilDeadline >= 30 && daysUntilDeadline <= 90) return 1.0;  // Perfect timing
  if (daysUntilDeadline >= 14 && daysUntilDeadline < 30) return 0.9;  // Good timing
  if (daysUntilDeadline > 90) return 0.8;                              // Plenty of time
  if (daysUntilDeadline >= 7) return 0.6;                               // Tight but manageable
  return 0.3; // Very tight deadline
}

function calculateAgencyScore(grant: any, profileTokens: string[]): number {
  const agencyName = grant.agency?.name?.toLowerCase() || '';
  if (!agencyName) return 0.6; // Unknown agency - decent score
  
  // Check for exact agency matches in profile tokens
  for (const token of profileTokens) {
    if (agencyName.includes(token.toLowerCase()) || token.toLowerCase().includes(agencyName)) {
      return 1.0;
    }
  }
  
  // Check for common prestigious agencies
  const prestigiousAgencies = ['nsf', 'nih', 'darpa', 'doe', 'nasa', 'foundation', 'institute'];
  for (const agency of prestigiousAgencies) {
    if (agencyName.includes(agency)) {
      return 0.8;
    }
  }
  
  return 0.6; // Default decent score
}

function calculateTypeScore(grant: any, profileTokens: string[]): number {
  const grantType = `${grant.grantType || ''} ${grant.category || ''}`.toLowerCase();
  if (!grantType.trim()) return 0.6; // Unknown type - decent score
  
  // Check for type matches in profile tokens
  for (const token of profileTokens) {
    if (grantType.includes(token.toLowerCase())) {
      return 1.0;
    }
  }
  
  // Check for common grant types
  const commonTypes = ['research', 'fellowship', 'grant', 'funding', 'scholarship', 'award', 'project'];
  for (const type of commonTypes) {
    if (grantType.includes(type)) {
      return 0.7;
    }
  }
  
  return 0.5; // Default score
}

function calculateLocationScore(grant: any, profileTokens: string[]): number {
  const grantLocation = grant.location?.toLowerCase() || '';
  if (!grantLocation) return 0.7; // Unknown location - good score
  
  // Check for location matches in profile tokens
  for (const token of profileTokens) {
    if (grantLocation.includes(token.toLowerCase()) || token.toLowerCase().includes(grantLocation)) {
      return 1.0;
    }
  }
  
  // Check for remote/international opportunities
  if (grantLocation.includes('remote') || grantLocation.includes('international') || grantLocation.includes('global')) {
    return 0.8;
  }
  
  return 0.6; // Default decent score
}

/** =====================  INTERNAL: INSERT / UPSERT  ===================== */
router.post("/internal/grants", requireInternalToken, async (req: Request, res: Response) => {
  try {
    const data = req.body || {};
    if (!data.title || !data.source) {
      return res.status(400).json({ error: "Missing required fields: title, source" });
    }

    const grant = await prisma.grant.upsert({
      where: {
        source_sourceId: {
          source: data.source,
          sourceId: data.sourceId ?? data.url ?? "unknown",
        },
      },
      update: {
        title: data.title,
        description: data.description,
        url: data.url,
        deadline: data.deadline ? new Date(data.deadline) : null,
        fundingMin: data.fundingMin,
        fundingMax: data.fundingMax,
        currency: data.currency,
        eligibility: data.eligibility,
        summary: data.summary,
        aiTitle: data.aiTitle,
        aiSummary: data.aiSummary,
        updatedAt: new Date(),
      },
      create: {
        source: data.source,
        sourceId: data.sourceId ?? data.url ?? "unknown",
        url: data.url,
        title: data.title,
        description: data.description,
        deadline: data.deadline ? new Date(data.deadline) : null,
        fundingMin: data.fundingMin,
        fundingMax: data.fundingMax,
        currency: data.currency,
        eligibility: data.eligibility,
        summary: data.summary,
        aiTitle: data.aiTitle,
        aiSummary: data.aiSummary,
      },
    });

    return res.json({ ok: true, id: grant.id });
  } catch (err: any) {
    console.error("Grant insert failed", err);
    return res.status(500).json({ error: "Failed to insert grant" });
  }
});

/** =====================  PUBLIC: SIMPLE SEARCH/LIST  =====================
 * POST /api/grants  (auth optional via SKIP_AUTH)
 * Body: { q?: string, limit?: number, offset?: number }
 * Returns: { ok, count, items: [...] }
 */
router.post("/grants", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
    const q = (req.body?.q ?? "").toString().trim();
    const limit = Math.min(Math.max(Number(req.body?.limit ?? 1000), 1), 1000);
    const offset = Math.max(Number(req.body?.offset ?? 0), 0);

    const where: Prisma.GrantWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { summary: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

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

    const items = rows.map((g) => ({
      id: g.id,
      title: g.title,
      summary: g.summary || g.description?.slice(0, 280) || "",
      url: g.url || g.agency?.url || null,
      agency: g.agency?.name ?? null,
      deadline: g.deadline,
      currency: g.currency,
      fundingMin: g.fundingMin,
      fundingMax: g.fundingMax,
    }));

    return res.json({ ok: true, count, items });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "server error in /grants" });
  }
});

/** =====================  POWER SEARCH WITH MATCH SCORING  ===================== */
router.post("/internal/grants/search", requireAuthOrSkip, async (req: Request, res: Response) => {
  const debug = process.env.DEBUG_SCORES === "1";
  try {
    const q = (req.body?.q ?? "").toString().trim();
    const limit = Math.min(Math.max(Number(req.body?.limit ?? 24), 1), 100);
    const offset = Math.max(Number(req.body?.offset ?? 0), 0);
    
    // Get clerkId from authenticated request (preferred) or fallback to body
    let clerkId: string | null = req.auth?.userId || null;
    if (!clerkId) {
      clerkId = (req.body?.clerkId ?? "").toString().trim() || null;
    }

    const where: Prisma.GrantWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { summary: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    let prefsRecord: any = null;
    let prefsModel: string | null = null;
    if (clerkId) {
      const { record, sourceModel } = await loadPrefsByClerkId(clerkId);
      prefsRecord = record;
      prefsModel = sourceModel;
    }

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
      2
    );
    const qTokens = normalizeTokens([q], 3);
    let profileTokens = tokensFromPrefs(prefsRecord);
    if (profileTokens.length === 0 && clientProvidedTokens.length > 0) profileTokens = clientProvidedTokens;
    if (profileTokens.length === 0 && qTokens.length > 0) profileTokens = qTokens;

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

    // Get or create user record if authenticated
    let userId: string | null = null;
    if (clerkId) {
      userId = await getOrCreateUser(clerkId);
      if (userId && debug) {
        console.log(`[Match Scores] User ${clerkId} -> userId ${userId}`);
      }
    }

    // Compute scores and save them if user is authenticated
    const grantScores: Array<{ grantId: string; score: number }> = [];
    
    const items = rows.map((g) => {
      const score = computeScore(g, profileTokens);
      
      // Collect scores for saving
      if (userId) {
        grantScores.push({ grantId: g.id, score });
      }
      
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
      return { ...base, __debug: { textSample: grantText(g).slice(0, 160) } };
    });

    // Save match scores asynchronously (don't block response)
    if (userId && grantScores.length > 0) {
      saveMatchScores(userId, grantScores).catch((error) => {
        console.error("[Match Scores] Failed to save scores:", error);
      });
    }

    return res.json({ 
      ok: true, 
      query: q, 
      items, 
      grants: items, 
      count,
      userId: userId || null, // Include userId in response for debugging
      ...(debug ? { profileTokens, prefsModel, clerkId } : {}) 
    });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "server error in /internal/grants/search" });
  }
});

/** =====================  GET SAVED MATCH SCORES  ===================== */
router.get("/grants/match-scores", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
    // Get clerkId from authenticated request (preferred) or query parameter
    let clerkId: string | null = req.auth?.userId || null;
    if (!clerkId) {
      clerkId = (req.query.clerkId as string)?.trim() || null;
    }

    if (!clerkId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get user ID from clerkId
    const userId = await getOrCreateUser(clerkId);
    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get grant IDs from query (optional - if not provided, return all user's scores)
    const grantIds = req.query.grantIds 
      ? (Array.isArray(req.query.grantIds) ? req.query.grantIds : [req.query.grantIds]).map(String)
      : null;

    let matches;
    if (grantIds && grantIds.length > 0) {
      // Get specific grants' scores
      matches = await prisma.match.findMany({
        where: {
          userId,
          grantId: { in: grantIds },
        },
        include: {
          grant: {
            select: {
              id: true,
              title: true,
              summary: true,
            },
          },
        },
        orderBy: { score: "desc" },
      });
    } else {
      // Get all user's match scores
      matches = await prisma.match.findMany({
        where: { userId },
        include: {
          grant: {
            select: {
              id: true,
              title: true,
              summary: true,
            },
          },
        },
        orderBy: { score: "desc" },
        take: 100, // Limit to 100 most recent
      });
    }

    const scores = matches.map((match) => ({
      grantId: match.grantId,
      score: match.score,
      createdAt: match.createdAt,
      grant: match.grant,
    }));

    return res.json({ ok: true, scores, count: scores.length });
  } catch (err: any) {
    console.error("Error fetching match scores:", err?.message || err);
    return res.status(500).json({ ok: false, error: "Failed to fetch match scores" });
  }
});

/** ---------- grant validation endpoint ---------- */
router.post("/validate", requireInternalToken, async (req: Request, res: Response) => {
  try {
    const { grantIds } = req.body;
    
    if (!grantIds || !Array.isArray(grantIds)) {
      return res.status(400).json({ error: "grantIds array is required" });
    }

    const grants = await prisma.grant.findMany({
      where: { id: { in: grantIds } },
      select: { id: true, url: true, title: true }
    });

    const validationResults = await Promise.allSettled(
      grants.map(async (grant) => {
        if (!grant.url) {
          return { id: grant.id, valid: false, reason: "No URL" };
        }

        try {
          const response = await axios.head(grant.url, {
            timeout: 10000,
            maxRedirects: 5,
            validateStatus: (status) => status < 500 // Accept 4xx as valid responses
          });
          
          const valid = response.status < 400;
          return {
            id: grant.id,
            valid,
            status: response.status,
            reason: valid ? "URL accessible" : `HTTP ${response.status}`
          };
        } catch (error: any) {
          return {
            id: grant.id,
            valid: false,
            reason: error.code === 'ENOTFOUND' ? 'URL not found' : 
                   error.code === 'ECONNREFUSED' ? 'Connection refused' :
                   error.code === 'ETIMEDOUT' ? 'Request timeout' :
                   error.message || 'Unknown error'
          };
        }
      })
    );

    const results = validationResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          id: grants[index]?.id || 'unknown',
          valid: false,
          reason: 'Validation failed'
        };
      }
    });

    // Update database with validation results
    const invalidGrants = results.filter(r => !r.valid);
    if (invalidGrants.length > 0) {
      await prisma.grant.updateMany({
        where: { id: { in: invalidGrants.map(g => g.id) } },
        data: { 
          isValid: false,
          lastValidated: new Date(),
          validationError: invalidGrants.map(g => g.reason).join('; ')
        }
      });
    }

    const validGrants = results.filter(r => r.valid);
    if (validGrants.length > 0) {
      await prisma.grant.updateMany({
        where: { id: { in: validGrants.map(g => g.id) } },
        data: { 
          isValid: true,
          lastValidated: new Date(),
          validationError: null
        }
      });
    }

    return res.json({
      ok: true,
      total: results.length,
      valid: validGrants.length,
      invalid: invalidGrants.length,
      results
    });

  } catch (error: any) {
    console.error("Grant validation error:", error);
    return res.status(500).json({ error: "Failed to validate grants" });
  }
});

export default router;
