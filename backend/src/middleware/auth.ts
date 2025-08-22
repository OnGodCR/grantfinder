import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  auth?: { userId: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Temporary: allow all if SKIP_AUTH=true
  if (process.env.SKIP_AUTH === "true") {
    req.auth = { userId: "demo-user" };
    return next();
  }

  // Minimal header-based auth for now
  const userId = req.header("x-user-id");
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  req.auth = { userId };
  next();
}
