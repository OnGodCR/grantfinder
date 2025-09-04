// CORS — allow prod domain and vercel previews via env FRONTEND_ORIGINS
import cors from "cors";

// Turn "a, b, c" into ["a","b","c"]
function parseOrigins(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

// Support exact match and simple wildcard like https://*.vercel.app
function originMatches(allowed: string, origin: string): boolean {
  if (allowed === "*") return true;
  if (!allowed.includes("*")) return allowed === origin;
  // wildcard: only at a single label position, e.g. https://*.vercel.app
  const [schemeHost, ...rest] = allowed.split("://");
  const scheme = rest.length ? schemeHost : "https";
  const hostPattern = rest.length ? rest.join("://") : schemeHost; // when no scheme provided
  const url = new URL(origin);
  if (scheme !== "https" && scheme !== "http") {
    // if no scheme in allowed, just compare host with wildcard
    return wildcardHostMatch(hostPattern, url.host);
  }
  return wildcardHostMatch(hostPattern, url.host);
}

function wildcardHostMatch(pattern: string, host: string): boolean {
  if (!pattern.includes("*")) return pattern === host;
  // pattern like *.vercel.app or grantfinder-*.example.com
  const esc = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
  const re = new RegExp(`^${esc}$`, "i");
  return re.test(host);
}

const allowedOrigins = parseOrigins(process.env.FRONTEND_ORIGINS);

app.use(
  cors({
    origin: (origin, cb) => {
      // Server-to-server or curl with no Origin → allow
      if (!origin) return cb(null, true);
      // If no env configured, be permissive (dev)
      if (allowedOrigins.length === 0) return cb(null, true);
      const ok = allowedOrigins.some(allowed => originMatches(allowed, origin));
      return ok ? cb(null, true) : cb(new Error(`CORS: ${origin} not allowed`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    optionsSuccessStatus: 204,
  })
);

// Let Express answer preflights quickly (optional; cors handles it, but this helps)
app.options("*", cors());
