import { Request, Response, NextFunction } from "express";

export function requireInternal(req: Request, res: Response, next: NextFunction) {
  const token = req.header("x-internal-token");
  if (!token || token !== process.env.INTERNAL_API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized (internal)" });
  }
  next();
}
