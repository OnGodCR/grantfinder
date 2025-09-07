import { Router, Request, Response, NextFunction } from "express";
const router = Router();

function requireAuthOrSkip(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") return next();
  const auth = (req.headers.authorization || "").toLowerCase();
  if (!auth.startsWith("bearer ")) return res.status(401).json({ error: "Unauthorized" });
  return next();
}

router.post("/internal/grants", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
    const q = typeof req.body?.q === "string" ? req.body.q.trim() : "";
    res.json({ ok: true, query: q, items: [], count: 0 });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    res.status(500).json({ error: "server error in /internal/grants" });
  }
});

export default router;
