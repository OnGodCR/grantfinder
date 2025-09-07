// backend/src/routes/profiles.ts
import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";

const router = Router();

function requireAuthOrSkip(_req: Request, _res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") {
    return next();
  }
  // (Optional) later: verify Clerk session
  return next();
}

/**
 * GET /api/me/preferences?clerkId=...
 */
router.get("/me/preferences", requireAuthOrSkip, async (req, res) => {
  const clerkId = String(req.query.clerkId || "").trim();
  if (!clerkId) return res.status(400).json({ error: "clerkId required" });

  const profile = await prisma.userProfile.findUnique({ where: { clerkId } });
  res.json({ exists: !!profile, profile });
});

/**
 * POST /api/me/preferences
 * Body: full payload from the onboarding form
 */
router.post("/me/preferences", requireAuthOrSkip, async (req, res) => {
  const {
    clerkId,
    department,
    position,
    researchAreas = [],
    keywords = [],
    fundingCategories = [],
    preferredSources = [],
    fundingLevel,
    projectDuration,
    deadlineFirst = false,
    alertFrequency,
    notificationMethod,
  } = req.body || {};

  if (!clerkId) return res.status(400).json({ error: "clerkId required" });

  const upserted = await prisma.userProfile.upsert({
    where: { clerkId },
    update: {
      department,
      position,
      researchAreas,
      keywords,
      fundingCategories,
      preferredSources,
      fundingLevel,
      projectDuration,
      deadlineFirst,
      alertFrequency,
      notificationMethod,
    },
    create: {
      clerkId,
      department,
      position,
      researchAreas,
      keywords,
      fundingCategories,
      preferredSources,
      fundingLevel,
      projectDuration,
      deadlineFirst,
      alertFrequency,
      notificationMethod,
    },
  });

  res.json({ ok: true, profile: upserted });
});

export default router;
