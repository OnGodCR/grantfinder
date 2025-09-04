import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { prisma } from "./prisma.js";
import grants from "./routes/grants.js";
import profiles from "./routes/profiles.js";

const app = express();

/**
 * CORS
 * Allow your deployed frontend(s). For now, keep your existing FRONTEND_URL or *.
 * If you want to be strict, set FRONTEND_URL to your Vercel domain (preview) and prod domain.
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: false, // we are using Bearer tokens, not cookies
  })
);

app.use(bodyParser.json({ limit: "1mb" }));

/**
 * 🔓 GLOBAL AUTH BYPASS WHEN SKIP_AUTH=1
 * This runs BEFORE any route/middleware that might 401.
 * It injects a harmless Bearer token so "presence" checks pass,
 * and most verifiers will be skipped if you also guard them by SKIP_AUTH.
 */
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") {
    if (!req.headers.authorization) {
      req.headers.authorization = "Bearer dev-token";
    }
    (req as any).__skipAuth = true;
  }
  next();
});

/**
 * (Optional) very light request log to help debug on Railway
 */
app.use((req, _res, next) => {
  if (process.env.LOG_REQUESTS === "1") {
    console.log(`[in] ${req.method} ${req.path} auth=${!!req.headers.authorization}`);
  }
  next();
});

// Health check + env sanity (doesn't leak secrets)
app.get("/api/health", async (_req: Request, res: Response) => {
  const mustHave = ["DATABASE_URL", "OPENAI_API_KEY", "INTERNAL_API_TOKEN"];
  const optional = [
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_ID",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "APP_URL",
    "FRONTEND_URL",
    "SKIP_AUTH",
  ];

  const envReport: Record<string, boolean | string> = {};
  mustHave.forEach((k) => (envReport[k] = !!process.env[k]));
  optional.forEach((k) => (envReport[k] = process.env[k] ? true : false));

  // quick DB ping
  let db = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e: any) {
    db = `error: ${e?.message || "db failed"}`;
  }

  res.json({
    ok: true,
    db,
    env: envReport,
    note:
      process.env.SKIP_AUTH === "1"
        ? "Auth bypass is ACTIVE (Authorization injected)."
        : "Auth bypass is OFF.",
  });
});

// Mount API routers (keep your existing route implementations)
app.use("/api", grants);
app.use("/api", profiles);

// Fallback
app.get("/", (_req, res) => {
  res.send("GrantFinder backend is running.");
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on :${port} (skipAuth=${process.env.SKIP_AUTH || "0"})`);
});
