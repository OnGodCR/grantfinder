import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js"; // adjust path if needed

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

      const items = await prisma.grant.findMany({
        where: q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        take: 20,
        orderBy: { deadline: "asc" },
      });

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
