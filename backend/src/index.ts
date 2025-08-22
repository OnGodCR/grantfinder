import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { prisma } from "./prisma.js";
import grants from "./routes/grants.js";
import profiles from "./routes/profiles.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: false }));
app.use(bodyParser.json({ limit: "1mb" }));

// Health check + env sanity (doesn't leak secrets)
app.get("/api/health", async (_req: Request, res: Response) => {
  const mustHave = [
    "DATABASE_URL",
    "OPENAI_API_KEY",
    "INTERNAL_API_TOKEN"
  ];
  const optional = [
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_ID",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "APP_URL",
    "FRONTEND_URL",
    "SKIP_AUTH"
  ];

  const envReport: Record<string, boolean | string> = {};
  mustHave.forEach(k => (envReport[k] = !!process.env[k]));
  optional.forEach(k => (envReport[k] = process.env[k] ? true : false));

  // quick DB ping
  let db = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e: any) {
    db = `error: ${e?.message || "db failed"}`;
  }

  res.json({ ok: true, db, env: envReport });
});

// Mount API
app.use("/api", grants);
app.use("/api", profiles);

// Fallback
app.get("/", (_req, res) => {
  res.send("GrantFinder backend is running.");
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
