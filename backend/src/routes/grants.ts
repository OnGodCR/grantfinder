// backend/src/routes/grants.ts
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

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

router.post(
  "/internal/grants",
  requireAuthOrSkip,
  async (req: Request, res: Response) => {
    try {
      const q = typeof req.body?.q === "string" ? req.body.q.trim() : "";

      // Mock grants for testing
      const mockGrants = [
        {
          id: "g1",
          title: "AI-Driven Environmental Monitoring",
          summary: "Funding to develop AI systems for climate and environmental monitoring.",
          tags: ["AI", "Climate", "NSF"],
          score: 92,
          deadline: "2025-10-01",
        },
        {
          id: "g2",
          title: "Neuroscience Research Initiative",
          summary: "Support for cutting-edge neuroscience research with U.S. institutions.",
          tags: ["Neurobiology", "NIH"],
          score: 80,
          deadline: "2025-11-15",
        },
        {
          id: "g3",
          title: "Innovative Cancer Treatment Technologies",
          summary: "Funding for innovative approaches in cancer treatment and medical devices.",
          tags: ["Cancer", "Medicine"],
          score: 75,
          deadline: "2025-12-20",
        },
      ];

      // Basic filter
      const items = q
        ? mockGrants.filter(
            g =>
              g.title.toLowerCase().includes(q.toLowerCase()) ||
              g.summary.toLowerCase().includes(q.toLowerCase())
          )
        : mockGrants;

      return res.json({
        ok: true,
        query: q,
        items,
        count: items.length,
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
