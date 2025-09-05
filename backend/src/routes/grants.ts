// backend/src/routes/grants.ts
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

/** Auth: bypass when SKIP_AUTH is set; otherwise require a Bearer token */
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

/** (Optional) small helper to show demo cards while developing UI */
function demoGrants(q: string) {
  const base = [
    {
      id: "demo-1",
      title: "AI for Social Impact Micro-grant",
      summary:
        "Supports early AI projects that benefit nonprofits and local communities.",
      deadline: "2025-10-15",
      amount: 5000,
      tags: ["AI", "Nonprofit", "Prototype"],
      score: 0.92,
      sourceUrl: "https://example.org/grants/ai-social-impact",
    },
    {
      id: "demo-2",
      title: "Innovation Seed Fund",
      summary:
        "Seed funding for data/AI pilots led by small teams and founders.",
      deadline: "2025-11-01",
      amount: 10000,
      tags: ["Startup", "Data", "Pilot"],
      score: 0.87,
      sourceUrl: "https://example.org/grants/innovation-seed",
    },
    {
      id: "demo-3",
      title: "Civic Tech Challenge",
      summary:
        "Grants for tools that improve public services or accessibility.",
      deadline: "2025-12-01",
      amount: 20000,
      tags: ["Civic Tech", "Accessibility"],
      score: 0.84,
      sourceUrl: "https://example.org/grants/civic-tech",
    },
  ];
  // Tiny filter so searches aren’t confusing
  if (!q) return base;
  const ql = q.toLowerCase();
  return base.filter(
    (g) =>
      g.title.toLowerCase().includes(ql) ||
      g.summary.toLowerCase().includes(ql) ||
      (g.tags || []).some((t) => t.toLowerCase().includes(ql))
  );
}

/** Single handler used by both routes */
async function handler(req: Request, res: Response) {
  try {
    const q = typeof req.body?.q === "string" ? req.body.q.trim() : "";

    // TODO: replace this block with your real search/DB logic.
    // While developing UI, you can set SEED_FAKE_GRANTS=1 on Railway
    // to return demo results instead of an empty list.
    const useDemo = process.env.SEED_FAKE_GRANTS === "1" || process.env.SEED_FAKE_GRANTS === "true";
    const items = useDemo ? demoGrants(q) : [];

    res.setHeader("content-type", "application/json");
    return res.json({
      ok: true,
      query: q,
      items,              // array of grants
      count: items.length // number rendered by UI
    });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    return res
      .status(500)
      .json({ error: err?.message || "server error in /grants" });
  }
}

/**
 * Endpoints this router exposes (mounted at /api in index.ts):
 *   POST /api/internal/grants
 *   POST /api/grants
 */
router.post("/internal/grants", requireAuthOrSkip, handler);
router.post("/grants", requireAuthOrSkip, handler);

export default router;
