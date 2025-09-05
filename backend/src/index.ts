// backend/src/index.ts
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { prisma } from "./prisma.js"; // keep .js if your tsconfig resolves it
import grants from "./routes/grants.js";
import profiles from "./routes/profiles.js";

const app = express();

// ---------- CORS BEGIN (single-origin echo) ----------
/**
 * Configure allowed frontends in Railway env as CSV, e.g.:
 *   FRONTEND_ORIGINS=https://grantlytic.com, https://*.vercel.app
 */
const RAW_ORIGINS = (process.env.FRONTEND_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// wildcard like *.vercel.app
function hostMatches(pattern: string, host: string): boolean {
  if (!pattern.includes("*")) return pattern.toLowerCase() === host.toLowerCase();
  const esc = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
  return new RegExp(`^${esc}$`, "i").test(host);
}

function allowedOrigin(origin?: string): string | null {
  if (!origin) return null; // server-to-server has no Origin; allow silently
  if (RAW_ORIGINS.length === 0) return origin; // permissive if not configured

  let u: URL;
  try {
    u = new URL(origin);
  } catch {
    return null;
  }

  for (const o of RAW_ORIGINS) {
    if (!o) continue;
    if (o.startsWith("http://") || o.startsWith("https://")) {
      try {
        const ao = new URL(o);
        if (ao.protocol === u.protocol && hostMatches(ao.host, u.host)) return origin;
      } catch {
        /* ignore */
      }
    } else {
      // pattern without scheme, e.g. *.vercel.app
      if (hostMatches(o, u.host)) return origin;
    }
  }
  return null;
}

app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  const allow = allowedOrigin(origin);

  // vary for caches
  res.setHeader("Vary", "Origin");

  if (allow) {
    // echo back ONLY the caller origin (single value)
    res.setHeader("Access-Control-Allow-Origin", allow);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // res.setHeader("Access-Control-Allow-Credentials", "true"); // only if you use cookies
  }

  // end preflight quickly
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
// ---------- CORS END ----------

app.use(bodyParser.json({ limit: "1mb" }));

// ---------- GLOBAL AUTH BYPASS WHEN SKIP_AUTH=1 ----------
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true") {
    if (!req.headers.authorization) {
      req.headers.authorization = "Bearer dev-token";
    }
    (req as any).__skipAuth = true;
  }
  next();
});

// (optional) request logging while debugging
app.use((req, _res, next) => {
  if (process.env.LOG_REQUESTS === "1") {
    console.log(`[in] ${req.method} ${req.path} origin=${req.headers.origin ?? "(none)"} auth=${!!req.headers.authorization}`);
  }
  next();
});

// ---------- HEALTH ----------
app.get("/api/health", async (_req: Request, res: Response) => {
  const mustHave = ["DATABASE_URL", "OPENAI_API_KEY", "INTERNAL_API_TOKEN"];
  const optional = [
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_ID",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "APP_URL",
    "FRONTEND_URL",
    "FRONTEND_ORIGINS",
    "SKIP_AUTH",
  ];

  const envReport: Record<string, boolean | string> = {};
  mustHave.forEach((k) => (envReport[k] = !!process.env[k]));
  optional.forEach((k) => (envReport[k] = process.env[k] ? true : false));

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
      process.env.SKIP_AUTH === "1" || process.env.SKIP_AUTH === "true"
        ? "Auth bypass is ACTIVE (Authorization injected)."
        : "Auth bypass is OFF.",
  });
});

// ---------- ROUTES ----------
app.use("/api", grants);
app.use("/api", profiles);

// ---------- ROOT ----------
app.get("/", (_req, res) => {
  res.send("GrantFinder backend is running.");
});

// ---------- LISTEN ----------
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on :${port} (skipAuth=${process.env.SKIP_AUTH || "0"})`);
});
