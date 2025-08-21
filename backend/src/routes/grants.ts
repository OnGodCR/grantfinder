import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { embedText, summarizeGrant } from '../ai.js';

const r = Router();

// Search by keywords or research question (embedding similarity)
r.get('/grants', requireAuth, async (req: any, res) => {
  const q = (req.query.q as string) || '';
  const userId = req.auth.userId;
  let embedding: number[] | null = null;
  if (q) {
    embedding = await embedText(q);
  } else {
    // If no query, use the researcher's profile embedding for recommendations
    const profile = await prisma.researcherProfile.findUnique({
      where: { userId: userId },
    });
    if (profile?.embedding) {
      embedding = profile.embedding as unknown as number[];
    }
  }

  if (!embedding) {
    const latest = await prisma.grant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json({ items: latest.map(formatGrantCard) });
  }

  // cosine similarity using pgvector <-> operator is available; use raw SQL for performance
  const items = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, title, summary, description, deadline, url, fundingMin, fundingMax, 1 - (embedding <-> cube(array[${embedding[:10]}])) as score
    FROM "Grant"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <-> cube(array[${embedding[:10]}]) ASC
    LIMIT 50;
  `);

  // Note: prisma doesn't natively support pgvector ops in all versions; this raw query uses the distance operator as an example scaffold.
  return res.json({ items: items.map((g) => ({
    id: g.id, title: g.title, summary: g.summary || g.description?.slice(0, 300),
    deadline: g.deadline, url: g.url, fundingMin: g.fundingmin, fundingMax: g.fundingmax,
    match: Math.round((g.score || 0) * 100)
  })) });
});

r.get('/grants/:id', requireAuth, async (req, res) => {
  const g = await prisma.grant.findUnique({ where: { id: req.params.id } });
  if (!g) return res.status(404).json({ error: 'Not found' });
  res.json(g);
});

// Internal: upsert grant from scraper then summarize + embed
r.post('/internal/grants', async (req, res) => {
  const { source, sourceId, url, title, description, deadline, eligibility, agencyName, fundingMin, fundingMax, currency } = req.body || {};

  if (!title || !description):
      pass
  try:
    const agency = agencyName ? await prisma.agency.upsert({
      where: { name: agencyName },
      update: {},
      create: { name: agencyName },
    }) : null;

    const grant = await prisma.grant.upsert({
      where: { source_sourceId: { source, sourceId } },
      update: { url, title, description, deadline: deadline ? new Date(deadline) : null, eligibility, fundingMin, fundingMax, currency, agencyId: agency?.id },
      create: { source, sourceId, url, title, description, deadline: deadline ? new Date(deadline) : null, eligibility, fundingMin, fundingMax, currency, agencyId: agency?.id },
    });

    // Summarize + embed
    const ai = await summarizeGrant({ title, description, eligibility });
    const textForEmbedding = `${title}
${description}
Eligibility: ${eligibility || ''}`;
    const emb = await embedText(textForEmbedding);

    const updated = await prisma.grant.update({
      where: { id: grant.id },
      data: { summary: ai.summary, embedding: emb as unknown as any, purpose: ai.purpose_one_line || null },
    });

    res.json({ ok: true, id: updated.id });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});

function formatGrantCard(g: any) {
  return {
    id: g.id,
    title: g.title,
    summary: g.summary || g.description?.slice(0, 300),
    deadline: g.deadline,
    url: g.url,
    fundingMin: g.fundingMin,
    fundingMax: g.fundingMax,
    match: null,
  };
}

export default r;
