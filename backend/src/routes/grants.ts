import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { embedText, cosineSimilarity } from "../ai";

const prisma = new PrismaClient();
const router = Router();

/**
 * Add a new grant
 */
router.post("/", async (req, res) => {
  const { title, description, purpose, fundingMin, fundingMax, deadline } = req.body;

  try {
    const emb = await embedText(description || title);

    const grant = await prisma.grant.create({
      data: {
        title,
        description,
        purpose,
        fundingMin,
        fundingMax,
        deadline,
        embedding: emb, // store array
      },
    });

    res.json(grant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create grant" });
  }
});

/**
 * Search grants with semantic similarity
 */
router.get("/search", async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Query parameter `q` required" });
  }

  try {
    const emb = await embedText(q);

    const grants = await prisma.grant.findMany({
      take: 50, // fetch a batch to rank
    });

    // Rank with cosine similarity
    const ranked = grants
      .map((g) => ({
        ...g,
        score: g.embedding ? cosineSimilarity(emb, g.embedding as number[]) : -1,
      }))
      .sort((a, b) => b.score - a.score);

    res.json(ranked.slice(0, 10));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
