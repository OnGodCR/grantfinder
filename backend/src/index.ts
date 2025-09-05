// ---- CORS BEGIN (single-origin echo) ----
const RAW_ORIGINS = (process.env.FRONTEND_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// wildcard like *.vercel.app
function hostMatches(pattern: string, host: string): boolean {
  if (!pattern.includes('*')) return pattern.toLowerCase() === host.toLowerCase();
  const esc = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
  return new RegExp(`^${esc}$`, 'i').test(host);
}

function isAllowed(origin?: string): string | null {
  // allow server-to-server (no Origin)
  if (!origin) return null;
  // permissive when nothing configured
  if (RAW_ORIGINS.length === 0) return origin;

  let u: URL;
  try { u = new URL(origin); } catch { return null; }

  for (const o of RAW_ORIGINS) {
    if (!o) continue;
    if (o.startsWith('http://') || o.startsWith('https://')) {
      try {
        const ao = new URL(o);
        if (ao.protocol === u.protocol && hostMatches(ao.host, u.host)) return origin;
      } catch { /* ignore bad pattern */ }
    } else {
      // pattern without scheme (e.g., *.vercel.app)
      if (hostMatches(o, u.host)) return origin;
    }
  }
  return null;
}

app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  const allow = isAllowed(origin);

  // caches should vary on Origin
  res.setHeader('Vary', 'Origin');

  if (allow) {
    // IMPORTANT: echo back a SINGLE origin, not the env list
    res.setHeader('Access-Control-Allow-Origin', allow);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // res.setHeader('Access-Control-Allow-Credentials', 'true'); // only if you use cookies
  }

  // cleanly end preflight
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
// ---- CORS END ----
