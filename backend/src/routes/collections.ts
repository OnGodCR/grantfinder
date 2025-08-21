import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

r.get('/collections', requireAuth, async (req: any, res) => {
  const userId = req.auth.userId;
  const collections = await prisma.savedCollection.findMany({
    where: { createdById: userId },
    include: { items: { include: { grant: true } } }
  });
  res.json(collections);
});

r.post('/collections', requireAuth, async (req: any, res) => {
  const userId = req.auth.userId;
  const { name } = req.body;
  // Fetch the user's institution id
  const user = await prisma.user.findFirst({ where: { clerkUserId: userId }});
  if (!user) return res.status(400).json({ error: 'User not found in DB. Complete onboarding.' });
  const col = await prisma.savedCollection.create({
    data: { name, createdById: user.id, institutionId: user.institutionId }
  });
  res.json(col);
});

r.post('/collections/:id/items', requireAuth, async (req: any, res) => {
  const { grantId, note } = req.body;
  const item = await prisma.collectionItem.create({
    data: { collectionId: req.params.id, grantId, note }
  });
  res.json(item);
});

export default r;
