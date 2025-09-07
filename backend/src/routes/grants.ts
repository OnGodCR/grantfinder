// backend/src/routes/grants.ts
import { Router, Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";        // <-- import Prisma types/enums here
import { prisma } from "../prisma.js";          // <-- your singleton client

const router = Router();

function requireAuthOrSkip(req: Request, res: Response, next: NextFunction) {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") return next();
  const auth = (req.headers.authorization || "").toLowerCase();
  if (!auth.startsWith("bearer ")) return res.status(401).json({ error: "Unauthorized" });
  return next();
}

router.post("/internal/grants", requireAuthOrSkip, async (req: Request, res: Response) => {
  try {
    const q = (req.body?.q ?? "").toString().trim();
    const limit = Math.min(Math.max(Number(req.body?.limit ?? 24), 1), 100);
    const offset = Math.max(Number(req.body?.offset ?? 0), 0);

    const where: Prisma.GrantWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { summary: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [rows, count] = await Promise.all([
      prisma.grant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          agency: { select: { id: true, name: true, url: true } },
        },
      }),
      prisma.grant.count({ where }),
    ]);

    const items = rows.map((g) => ({
      id: g.id,
      title: g.title,
      summary: g.summary || g.description?.slice(0, 280) || "",
      url: g.url || g.agency?.url || null,
      agency: g.agency?.name ?? null,
      deadline: g.deadline,
      currency: g.currency,
      fundingMin: g.fundingMin,
      fundingMax: g.fundingMax,
    }));

    return res.json({ ok: true, query: q, items, grants: items, count });
  } catch (err: any) {
    console.error("grants route error:", err?.message || err);
    return res.status(500).json({ ok: false, error: "server error in /internal/grants" });
  }
});

export default router;
