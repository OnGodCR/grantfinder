import "dotenv/config";
import express from "express";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import { prisma } from "./prisma.js";
import grants from "./routes/grants.js";
import profiles from "./routes/profiles.js";

const app = express();

/** Parse FRONTEND_ORIGINS env as a comma/space separated list.
 *  Example value (Railway):
 *  https://grantlytic.com, https://www.grantlytic.com, https://*.vercel.app
 */
const ORIGINS = (process.env.FRONTEND_ORIGINS || "")
  .split(/[,\s]+/)
  .map(s => s.trim())
  .filter(Boolean);

// simple wildcard matcher for "*.vercel.app" etc.
function matchOrigin(origin: string, pattern: string): boolean {
  if (pattern === "*") return true;
  // escape regex specials except *
  const rx = "^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$";
  return new RegExp(rx).test(origin);
}

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    // allow server-to-server / curl with no origin
    if (!origin) return cb(null, true);
    const ok = ORIGINS.some(p => matchOrigin(origin, p));
    return cb(ok ? null : new Error("Not allowed by CORS"), ok);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // keep false unless you need cookies
  maxAge: 86400,
};

app.use(cors(corsOptions));
// make sure OPTIONS preflights are handled globally
app.options("*", cors(corsOptions));

app.use(bodyParser.json({ limit: "1mb" }));

// ---- routes
app.use("/api", grants);
app.use("/api", profiles);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "ok", origins: ORIGINS });
  } catch (e: any) {
    res.json({ ok: true, db: `error: ${e?.message}`, origins: ORIGINS });
  }
});

app.get("/", (_req, res) => res.send("GrantFinder backend is running."));

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API listening on :${port}`));
