import { Router, Request, Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { requireInternal } from "../middleware/internal.js";
import { embedText, summarizeGrant, cosineSimilarity } from "../ai.js";

const r = Router();

// GET /api/grants?q=...  (embedding search or profile-based)
r.get("/grants", requireAuth, async (req: AuthRequest, res: Response) => {
  const q = (req.query.q as string) || "";
  const userId = req.auth!.userId;

  let embedding: number[] | null = null;
  if (q) {
    embedding = await embedText(q);
  } else {
    const profile = await prisma.researcherProfile.findUnique({
      where: { userId },
      select: { embedding: true }
    });
    embedding = (profile?.embedding as unknown as number[]) || null;
  }

  if (!embedding) {
    const latest = await prisma.grant.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, title: true, summary: true, description: true,
        deadline: true, url: true, fundingMin: true, fundingMax: true
      }
    });
    return res.json({
      items: latest.map(g => ({
        id: g.id,
        title: g.title,
        summary: g.summary || (g.description ?? "").slice(0, 300),
        deadline: g.deadline,
        url: g.url,
        fundingMin: g.fundingMin,
        fundingMax: g.fundingMax,
        match: null
      }))
    });
  }

  const candidates = await prisma.grant.findMany({
    where: { embedding: { isEmpty: false } },
    orderBy: { updatedAt: "desc" },
    take: 500,
    select: {
      id: true, title: true, summary: true, description: true,
      deadline: true, url: true, fundingMin: true, fundingMax: true, embedding: true
    }
  });

  const scored = candidates.map(g => {
    const emb = (g.embedding as unknown as number[]) || [];
    const sim = cosineSimilarity(embedding!, emb);
    return { g, sim };
  }).sort((a, b) => b.sim - a.sim).slice(0, 50);

  res.json({
    items: scored.map(({ g, sim }) => ({
      id: g.id,
      title: g.title,
      summary: g.summary || (g.description ?? "").slice(0, 300),
      deadline: g.deadline,
      url: g.url,
      fundingMin: g.fundingMin,
      fundingMax: g.fundingMax,
      match: Math.round(Math.max(0, Math.min(1, sim)) * 100)
    }))
  });
});

// GET /api/grants/:id
r.get("/grants/:id", requireAuth, async (req: Request, res: Response) => {
  const g = await prisma.grant.findUnique({ where: { id: req.params.id } });
  if (!g) return res.status(404).json({ error: "Not found" });
  res.json(g);
});

// POST /api/internal/grants  (ingest from scraper; secured)
r.post("/internal/grants", requireInternal, async (req: Request, res: Response) => {
  try {
    const {
      source, sourceId, url, title, description, deadline,
      eligibility, agencyName, fundingMin, fundingMax, currency
    } = req.body || {};

    if (!source || !title || !description) {
      return res.status(400).json({ ok: false, error: "Missing required fields: source, title, description" });
    }

    const agency = agencyName
      ? await prisma.agency.upsert({
          where: { name: agencyName },
          update: {},
          create: { name: agencyName }
        })
      : null;

    const uniqueSourceId: string = sourceId || url || title;

    const grant = await prisma.grant.upsert({
      where: { source_sourceId: { source, sourceId: uniqueSourceId } },
      update: {
        url, title, description,
        deadline: deadline ? new Date(deadline) : null,
        eligibility,
        fundingMin: fundingMin ?? null,
        fundingMax: fundingMax ?? null,
        currency: currency || "USD",
        agencyId: agency?.id || null
      },
      create: {
        source,
        sourceId: uniqueSourceId,
        url,
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        eligibility,
        fundingMin: fundingMin ?? null,
        fundingMax: fundingMax ?? null,
        currency: currency || "USD",
        agencyId: agency?.id || null
      }
    });

    const ai = await summarizeGrant({ title, description, eligibility });
    const textForEmbedding = `${title}\n${description}\nEligibility: ${eligibility || ""}`;
    const emb = await embedText(textForEmbedding);

    await prisma.grant.update({
      where: { id: grant.id },
      data: {
        summary: ai.summary,
        embedding: emb,
        purpose: ai.purpose_one_line || null
      }
    });

    res.json({ ok: true, id: grant.id });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Internal error" });
  }
});

export default r;
