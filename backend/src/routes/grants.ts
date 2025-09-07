// backend/src/routes/grants.ts
import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";

const router = Router();

/** Bypass auth when SKIP_AUTH is set; else require Bearer (placeholder). */
function requireAuthOrSkip(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") return next();
  const auth = (req.headers.authorization || "").toLowerCase();
  if (!auth.startsWith("bearer ")) return res.status(401).json({ error: "Unauthorized" });
  return next();
}

/**
 * POST /api/internal/grants
 * Body: { q?: string, limit?: number, offset?: number }
 * Returns newest grants, text-filtered by q (title/summary/description).
 */
router.post("/internal/grants", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
    const q = (req.body?.q ?? "").toString().trim();
    const limit = Math.min(Math.max(Number(req.body?.limit ?? 24), 1), 100);
    const offset = Math.max(Number(req.body?.offset ?? 0), 0);

    const where = q
      ? {
          OR: [
            { title:       { contains: q, mode: "insensitive" } },
            { summary:     { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [rows, count] = await Promise.all([
      prisma.grant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          source: true,
          sourceId: true,
          url: true,
          title: true,
          description: true,
          summary: true,
          purpose: true,
          currency: true,
          fundingMin: true,
          fundingMax: true,
          deadline: true,
          eligibility: true,
          createdAt: true,
          agency: { select: { id: true, name: true, url: true } },
        },
      }),
      prisma.grant.count({ where }),
    ]);

    // Map to a clean card-friendly shape (and keep the raw too if you prefer)
    const items = rows.map(g => ({
      id: g.id,
      title: g.title,
      summary: g.summary || g.description?.slice(0, 280) || "",
      url: g.url || (g.agency?.url ?? null),
      agency: g.agency?.name ?? null,
      deadline: g.deadline,
      currency: g.currency,
      fundingMin: g.fundingMin,
      fundingMax: g.fundingMax,
      raw: g, // keep original grant if your UI needs extra fields
    }));

    // Return both `items` and `grants` for compatibility with older UI code
    return res.json({ ok: true, query: q, items, grants: items, count });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "server error in /internal/grants" });
  }
});

export default router;
