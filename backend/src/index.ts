import "dotenv/config";
import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
// body-parser not needed; use express.json()
import { prisma } from "./prisma.js";
import grants from "./routes/grants.js";
import profiles from "./routes/profiles.js";

const app = express();

// If you're behind a proxy (Railway), this helps with correct IP/proto
app.set("trust proxy", 1);

/**
 * CORS allowlist:
 * - Your custom domain(s)
 * - Local dev
 * - Any Vercel preview subdomain (*.vercel.app)
 * - Optional FRONTEND_URL / APP_URL overrides from env
 */
const STATIC_ALLOWED = new Set<string>([
  "https://grantlytic.com",
  "https://www.grantlytic.com",
  "http://localhost:3000",
]);

const ENV_ALLOWED = [process.env.FRONTEND_URL, process.env.APP_URL]
  .filter(Boolean) as string[];

// Helper: check if an origin is allowed
function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // allow non-browser tools (curl/postman)
  if (STATIC_ALLOWED.has(origin)) return true;
  if (ENV_ALLOWED.includes(origin)) return true;
  // allow any vercel preview domain
  if (origin.endsWith(".vercel.app")) return true;
  return false;
}

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // Use cookies only if you actually do cookie-based auth; for Bearer tokens keep false
  credentials: false,
};

// Handle preflights early
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// JSON body parser
app.use(express.json({ limit: "1mb" }));

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

  const envReport: Record<string, boolean> = {};
  mustHave.forEach((k) => (envReport[k] = !!process.env[k]));
  optional.forEach((k) => (envReport[k] = !!process.env[k]));

  // quick DB ping
  let db = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e: any) {
    db = `
