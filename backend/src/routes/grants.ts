// backend/src/routes/grants.ts
import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";

const router = Router();

function requireInternalToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-internal-token"];
  if (!token || token !== process.env.INTERNAL_API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

/**
 * Insert or update a grant (used by scraper)
 */
router.post("/internal/grants", requireInternalToken, async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.title || !data.source) {
      return res.status(400).json({ error: "Missing required fields (title, source)" });
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
      },
    });

    return res.json({ ok: true, id: grant.id });
  } catch (err: any) {
    console.error("Grant insert failed", err);
    return res.status(500).json({ error: "Failed to insert grant" });
  }
});

export default router;
