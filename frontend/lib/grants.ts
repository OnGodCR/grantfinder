// frontend/lib/grants.ts
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/+$/, "");
const CANDIDATE_PATHS = ["/api/grants", "/api/internal/grants", "/grants", "/api/grants/search"];
type Hit = { url: string; method: "POST" | "GET" };

function loadCached(): Hit | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("grants_endpoint_v1");
    return raw ? (JSON.parse(raw) as Hit) : null;
  } catch { return null; }
}
function saveCached(hit: Hit) {
  try { if (typeof window !== "undefined") window.sessionStorage.setItem("grants_endpoint_v1", JSON.stringify(hit)); } catch {}
}

async function tryOnce(url: string, method: "POST" | "GET", q: string, token?: string) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(method === "GET" ? `${url}?q=${encodeURIComponent(q)}` : url, {
    method, headers, body: method === "POST" ? JSON.stringify({ q }) : undefined, cache: "no-store",
  });
  const text = await res.clone().text();
  let body: any = text; try { body = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, body };
}

export async function fetchGrantsAuto(q: string, token?: string) {
  const cached = loadCached();
  if (cached) {
    const r = await tryOnce(cached.url, cached.method, q, token);
    if (r.ok) return { ...r, url: cached.url, method: cached.method };
  }
  for (const path of CANDIDATE_PATHS) {
    const url = `${BASE}${path}`;
    try { const r = await tryOnce(url, "POST", q, token); if (r.ok) { saveCached({ url, method: "POST" }); return { ...r, url, method: "POST" }; } } catch {}
  }
  for (const path of CANDIDATE_PATHS) {
    const url = `${BASE}${path}`;
    try { const r = await tryOnce(url, "GET", q, token); if (r.ok) { saveCached({ url, method: "GET" }); return { ...r, url, method: "GET" }; } } catch {}
  }
  return { ok: false, status: 0, body: { error: "No working grants endpoint found." }, url: `${BASE}${CANDIDATE_PATHS[0]}`, method: "POST" as const };
}

// Back-compat
export const fetchGrants = fetchGrantsAuto;
