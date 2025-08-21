import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { embedText } from '../ai.js';

const r = Router();

r.get('/me/profile', requireAuth, async (req: any, res) => {
  const profile = await prisma.researcherProfile.findUnique({ where: { userId: req.auth.userId } });
  res.json(profile || {});
});

r.post('/me/profile', requireAuth, async (req: any, res) => {
  const { keywords = [], researchAreas = [], pastFunding = [] } = req.body || {};
  const text = [...keywords, ...researchAreas, ...pastFunding].join(' ');
  const embedding = await embedText(text || 'researcher');
  const profile = await prisma.researcherProfile.upsert({
    where: { userId: req.auth.userId },
    update: { keywords, researchAreas, pastFunding, embedding: embedding as unknown as any },
    create: { userId: req.auth.userId, keywords, researchAreas, pastFunding, embedding: embedding as unknown as any },
  });
  res.json(profile);
});

export default r;
