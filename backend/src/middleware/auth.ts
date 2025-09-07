// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";

/**
 * If SKIP_AUTH=1 -> allow all.
 * Else, require Authorization: Bearer <token>.
 * If BACKEND_API_TOKEN is set, it must match exactly (constant-time compare).
 */
export function requireAuthOrSkip(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") {
    return next();
  }

  const hdr = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(hdr);
  if (!m) return res.status(401).json({ error: "Unauthorized" });

  const provided = m[1].trim();
  const expected = (process.env.BACKEND_API_TOKEN || "").trim();

  // If expected is set, it must match. If not set, any Bearer value is accepted.
  if (expected && !timeSafeEqual(provided, expected)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}

function timeSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return acc === 0;
}
