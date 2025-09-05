// --- CORS BEGIN (drop-in) ---
/**
 * Allow your prod domain + Vercel previews.
 * Set FRONTEND_ORIGINS in Railway like:
 *   FRONTEND_ORIGINS=https://grantlytic.com, https://grantfinder-abc.vercel.app, https://*.vercel.app
 */
const RAW_ORIGINS = (process.env.FRONTEND_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// simple wildcard host match like *.vercel.app
function hostMatches(pattern: string, host: string): boolean {
  if (pattern.includes('*')) {
    const esc = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
    return new RegExp(`^${esc}$`, 'i').test(host);
  }
  return pattern === host;
}

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true; // allow server-to-server/no-origin
  if (RAW_ORIGINS.length === 0) return true; // permissive dev default
  try {
    const u = new URL(origin);
    return RAW_ORIGINS.some(o => {
      // allow raw host patterns without scheme (e.g., *.vercel.app)
      if (!o.startsWith('http')) {
        return hostMatches(o.toLowerCase(), u.host.toLowerCase());
      }
      const ao = new URL(o);
      return ao.protocol === u.protocol && hostMatches(ao.host.toLowerCase(), u.host.toLowerCase());
    });
  } catch {
    return false;
  }
}

app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  const allowed = isAllowedOrigin(origin);

  // Helpful debug
  if (process.env.LOG_REQUESTS === '1') {
    console.log(`[CORS] ${req.method} ${req.path} origin=${origin ?? '(none)'} allowed=${allowed}`);
  }

  // Always vary on Origin for caches
  res.setHeader('Vary', 'Origin');

  if (allowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // No cookies -> credentials not needed
  }

  // Short-circuit preflight cleanly
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
// --- CORS END ---
