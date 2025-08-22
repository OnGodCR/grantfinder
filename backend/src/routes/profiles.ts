import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { embedText } from "../ai";

const prisma = new PrismaClient();
const router = Router();

/**
 * Create or update researcher profile
 */
router.post("/", async (req, res) => {
  const { userId, keywords, researchAreas, pastFunding } = req.body;

  try {
    const emb = await embedText(
      [...(keywords || []), ...(researchAreas || []), ...(pastFunding || [])].join(" ")
    );

    const profile = await prisma.researcherProfile.upsert({
      where: { userId },
      create: {
        userId,
        keywords,
        researchAreas,
        pastFunding,
        embedding: emb, // store array
      },
      update: {
        keywords,
        researchAreas,
        pastFunding,
        embedding: emb, // update array
      },
    });

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

export default router;
