// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";

export function requireAuthOrSkip(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") {
    return next();
  }

  const hdr = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(hdr);
  if (!m) return res.status(401).json({ error: "Unauthorized" });

  const provided = m[1].trim();
  const expected = (process.env.BACKEND_API_TOKEN || "").trim();

  if (expected && !timeSafeEqual(provided, expected)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}

// ✅ keep a direct alias so old code still works
export const requireAuth = requireAuthOrSkip;

function timeSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return acc === 0;
}
