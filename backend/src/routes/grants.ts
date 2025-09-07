// backend/src/routes/grants.ts
import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { requireAuthOrSkip } from "../middleware/auth.js";

const router = Router();

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
        include: { agency: { select: { id: true, name: true, url: true } } },
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
