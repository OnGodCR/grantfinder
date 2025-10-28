// backend/src/routes/profiles.ts
import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { requireAuthOrSkip } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/me/preferences - Get current user's preferences
 */
router.get("/me/preferences", requireAuthOrSkip, async (req, res) => {
  // First try to get clerkId from authenticated request (preferred)
  let clerkId = req.auth?.userId;
  
  // Fallback to query parameter for backward compatibility during migration
  if (!clerkId) {
    clerkId = String(req.query.clerkId || "").trim();
  }
  
  if (!clerkId) return res.status(400).json({ error: "Authentication required or clerkId parameter missing" });

  try {
    const profile = await prisma.userProfile.findUnique({ where: { clerkId } });
    res.json({ exists: !!profile, profile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

/**
 * POST /api/me/preferences
 * Body: full payload from the onboarding form
 */
router.post("/me/preferences", requireAuthOrSkip, async (req, res) => {
  // First try to get clerkId from authenticated request (preferred)
  let clerkId = req.auth?.userId;
  
  // Fallback to body for backward compatibility during migration
  if (!clerkId) {
    clerkId = req.body?.clerkId;
  }

  if (!clerkId) return res.status(400).json({ error: "Authentication required or clerkId in body missing" });

  const {
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

  try {
    // First, ensure User record exists
    await prisma.user.upsert({
      where: { clerkId },
      update: {
        // Update any basic user info if needed
      },
      create: {
        clerkId,
        role: 'RESEARCHER',
      },
    });

    // Then upsert the UserProfile
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
  } catch (error) {
    console.error("Error saving user profile:", error);
    res.status(500).json({ error: "Failed to save user profile" });
  }
});

export default router;
