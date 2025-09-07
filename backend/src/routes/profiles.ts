import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";

const router = Router();

function requireAuthOrSkip(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") return next();
  const auth = (req.headers.authorization || "").toLowerCase();
  if (!auth.startsWith("bearer ")) return res.status(401).json({ error: "Unauthorized" });
  return next();
}

function buildEmbeddingText(p: any): string {
  const parts: string[] = [];
  parts.push(
    `Department: ${p.department || ""}`,
    `Position: ${p.position || ""}`,
    `Research areas: ${(p.researchAreas || []).join(", ")}`,
    `Keywords: ${(p.keywords || []).join(", ")}`,
    `Funding categories: ${(p.fundingCategories || []).join(", ")}`,
    `Preferred sources: ${(p.preferredSources || []).join(", ")}`,
    `Funding level: ${p.fundingLevel || ""}`,
    `Project duration: ${p.projectDuration || ""}`,
    `Deadline first: ${p.deadlineFirst ? "yes" : "no"}`,
    `Alert frequency: ${p.alertFrequency || ""}`,
    `Notification method: ${p.notificationMethod || ""}`,
  );
  return parts.join("\n");
}

async function maybeCreateEmbedding(profilePayload: any): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": `Bearer ${key}` },
    body: JSON.stringify({ input: buildEmbeddingText(profilePayload), model: "text-embedding-3-small" }),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data?.data?.[0]?.embedding ?? null;
}

// GET /api/me/preferences?clerkId=USER_ID
router.get("/me/preferences", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
    const clerkId = String(req.query.clerkId || "").trim();
    if (!clerkId) return res.status(400).json({ error: "Missing clerkId" });
    const row = await prisma.userProfile.findUnique({ where: { clerkId } });
    return res.json({ exists: !!row, profile: row ?? null });
  } catch (e: any) {
    console.error("GET /me/preferences error:", e?.message || e);
    return res.status(500).json({ error: "server error" });
  }
});

// POST /api/me/preferences
router.post("/me/preferences", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
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
    if (!clerkId || typeof clerkId !== "string") return res.status(400).json({ error: "Missing clerkId" });

    const payload = {
      clerkId,
      department: department || null,
      position: position || null,
      researchAreas,
      keywords,
      fundingCategories,
      preferredSources,
      fundingLevel: fundingLevel || null,
      projectDuration: projectDuration || null,
      deadlineFirst: !!deadlineFirst,
      alertFrequency: alertFrequency || null,
      notificationMethod: notificationMethod || null,
    };

    const upserted = await prisma.userProfile.upsert({
      where: { clerkId },
      create: payload,
      update: payload,
    });

    const emb = await maybeCreateEmbedding(payload);
    if (emb) {
      await prisma.userProfile.update({ where: { id: upserted.id }, data: { embedding: emb as any } });
    }

    const finalRow = await prisma.userProfile.findUnique({ where: { id: upserted.id } });
    return res.json({ ok: true, profile: finalRow });
  } catch (e: any) {
    console.error("POST /me/preferences error:", e?.message || e);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
