// backend/src/routes/grants.ts
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

/**
 * Bypass auth when SKIP_AUTH is set.
 * If SKIP_AUTH is not set, require a Bearer token (you can swap this for real Clerk verification later).
 */
function requireAuthOrSkip(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") {
    return next();
  }
  const auth = (req.headers.authorization || "").toLowerCase();
  if (!auth.startsWith("bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

/**
 * POST /api/internal/grants
 * (this router is mounted at /api in index.ts)
 *
 * TEMP: returns an empty list so you can verify 200s in the UI.
 * Replace the inside of the handler with your real search once 401s are gone.
 */
router.post(
  "/internal/grants",
  requireAuthOrSkip,
  async (req: Request, res: Response) => {
    try {
      const q = typeof req.body?.q === "string" ? req.body.q.trim() : "";

      // TODO: plug in your real search logic here and return real grants.
      // Example response shape (keep keys stable for the UI):
      return res.json({
        ok: true,
        query: q,
        items: [], // ← replace with real results later
        count: 0,
      });
    } catch (err: any) {
      console.error("grants route error:", err?.message || err);
      return res
        .status(500)
        .json({ error: err?.message || "server error in /internal/grants" });
    }
  }
);

export default router;
