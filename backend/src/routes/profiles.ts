import { Router, Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { embedText } from "../ai.js";

const r = Router();

r.get("/me/profile", requireAuth, async (req: AuthRequest, res: Response) => {
  const profile = await prisma.researcherProfile.findUnique({
    where: { userId: req.auth!.userId }
  });
  res.json(profile || {});
});

r.post("/me/profile", requireAuth, async (req: AuthRequest, res: Response) => {
  const { keywords = [], researchAreas = [], pastFunding = [] } = req.body || {};
  const text = [...keywords, ...researchAreas, ...pastFunding].join(" ").trim() || "researcher";
  const embedding = await embedText(text);

  const profile = await prisma.researcherProfile.upsert({
    where: { userId: req.auth!.userId },
    update: { keywords, researchAreas, pastFunding, embedding },
    create: { userId: req.auth!.userId, keywords, researchAreas, pastFunding, embedding }
  });

  res.json(profile);
});

export default r;
