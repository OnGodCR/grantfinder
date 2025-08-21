import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireInternal } from '../middleware/internal.js';
import { embedText, summarizeGrant, cosineSimilarity } from '../ai.js';

const r = Router();

// GET /api/grants?q=...  (embedding-based search; falls back to profile if no q)
r.get('/grants', requireAuth, async (req: any, res) => {
  const q = (req.query.q as string) || '';
  const userId = req.auth.userId;

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

  // No embedding available yet → just show latest grants
  if (!embedding) {
    const latest = await prisma.grant.findMany({
      orderBy: { createdAt: 'desc' },
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
        summary: g.summary || (g.description ?? '').slice(0, 300),
        deadline: g.deadline,
        url: g.url,
        fundingMin: g.fundingMin,
        fundingMax: g.fundingMax,
        match: null
      }))
    });
  }

  // Pull a reasonable batch, score in app, return top 50
  const candidates = await prisma.grant.findMany({
    where: { embedding: { isEmpty: false } },
    orderBy: { updatedAt: 'desc' },
    take: 500,
    select: {
      id: true, title: true, summary: true, description: true,
      deadline: true, url: true, fundingMin: true, fundingMax: true,
      embedding: true
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
      summary: g.summary || (g.description ?? '').slice(0, 300),
      deadline: g.deadline,
      url: g.url,
      fundingMin: g.fundingMin,
      fundingMax: g.fundingMax,
      match: Math.round(Math.max(0, Math.min(1, sim)) * 100)
    }))
  });
});

// GET /api/grants/:id  (details)
r.get('/grants/:id', requireAuth, async (req, res) => {
  const g = await prisma.grant.findUnique({ where: { id: req.params.id } });
  if (!g) return res.status(404).json({ error: 'Not found' });
  res.json(g);
});

// POST /api/internal/grants  (scraper ingestion; secured via x-internal-token)
r.post('/internal/grants', requireInternal, async (req, res) => {
  try {
    const {
      source, sourceId, url, title, description, deadline,
      eligibility, agencyName, fundingMin, fundingMax, currency
    } = req.body || {};

    if (!source || !title || !description) {
      return res.status(400).json({ ok: false, error: 'Missing required fields: source, title, description' });
    }

    const agency = agencyName
      ? await prisma.agency.upsert({
          where: { name: agencyName },
          update: {},
          create: { name: agencyName }
        })
      : null;

    // Upsert grant by (source, sourceId). If sourceId missing, use URL or title as fallback
    const uniqueSourceId = sourceId || url || title;

    const grant = await prisma.grant.upsert({
      where: { source_sourceId: { source, sourceId: uniqueSourceId } },
      update: {
        url,
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        eligibility,
        fundingMin: fundingMin ?? null,
        fundingMax: fundingMax ?? null,
        currency: currency || 'USD',
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
        currency: currency || 'USD',
        agencyId: agency?.id || null
      }
    });

    // AI summarize + embed (store as number[] array)
    const ai = await summarizeGrant({ title, description, eligibility });
    const textForEmbedding = `${title}\n${description}\nEligibility: ${eligibility || ''}`;
    const emb = await embedText(textForEmbedding);

    const updated = await prisma.grant.update({
      where: { id: grant.id },
      data: {
        summary: ai.summary,
        embedding: emb,
        purpose: ai.purpose_one_line || null
      }
    });

    res.json({ ok: true, id: updated.id });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'Internal error' });
  }
});

export default r;
