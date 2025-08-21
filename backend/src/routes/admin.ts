import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

// Simple metrics (extend as needed)
r.get('/admin/metrics', requireAuth, async (req: any, res) => {
  // TODO: enforce role check
  const grants = await prisma.grant.count();
  const users = await prisma.user.count();
  const institutions = await prisma.institution.count();
  const topAgencies = await prisma.agency.findMany({ take: 5, orderBy: { grants: { _count: 'desc' } } });
  res.json({ grants, users, institutions, topAgencies });
});

export default r;
