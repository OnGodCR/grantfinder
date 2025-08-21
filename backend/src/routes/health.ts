import { Router } from 'express';
import { prisma } from '../prisma.js';

const r = Router();
r.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});
export default r;
