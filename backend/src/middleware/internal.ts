import { Request, Response, NextFunction } from 'express';
import { env } from '../env.js';

export function requireInternal(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-internal-token'];
  if (token !== env.INTERNAL_API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
