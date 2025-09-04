// frontend/lib/grants.ts
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');

type FetchResult = {
  ok: boolean;
  status: number;
  url: string;
  method: 'POST' | 'GET';
  body: any;
  rawText?: string;
  error?: string;
};

async function tryPost(url: string, q: string, token?: string): Promise<FetchResult> {
  try {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (token) headers.authorization = `Bearer ${token}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ q }),
      // Next 14 fetch defaults are fine; no-cache is OK for dynamic too.
    });

    const ctype = res.headers.get('content-type') || '';
    let body: any = null;
    let rawText: string | undefined;

    if (ctype.includes('application/json')) {
      body = await res.json().catch(() => null);
    } else {
      rawText = await res.text().catch(() => undefined);
      try { body = rawText ? JSON.parse(rawText) : null; } catch { /* keep rawText */ }
    }

    const out: FetchResult = {
      ok: res.ok,
      status: res.status,
      url,
      method: 'POST',
      body,
      rawText,
    };
    // Helpful console trace
    // eslint-disable-next-line no-console
    console.log('[grants] POST', out);
    return out;
  } catch (e: any) {
    const out: FetchResult = {
      ok: false,
      status: 0,
      url,
      method: 'POST',
      body: null,
      error: e?.message || String(e),
    };
    // eslint-disable-next-line no-console
    console.error('[grants] POST error', out);
    return out;
  }
}

/**
 * Call your backend POST /api/grants. If that 404s, fall back to /api/internal/grants.
 * Requires NEXT_PUBLIC_BACKEND_URL to be set to your Railway base:
 *   https://grantfinder-production.up.railway.app
 */
export async function fetchGrantsAuto(q: string, token?: string): Promise<FetchResult> {
  if (!BASE) {
    const err: FetchResult = {
      ok: false,
      status: 0,
      url: '(missing NEXT_PUBLIC_BACKEND_URL)',
      method: 'POST',
      body: null,
      error: 'NEXT_PUBLIC_BACKEND_URL is not defined in your Vercel env',
    };
    console.error('[grants] config error', err);
    return err;
  }

  // 1) Try /api/grants
  const first = await tryPost(`${BASE}/api/grants`, q, token);
  if (first.ok || first.status !== 404) return first;

  // 2) Fallback to /api/internal/grants
  const second = await tryPost(`${BASE}/api/internal/grants`, q, token);
  return second;
}

/**
 * Direct single-endpoint version if you know which one works.
 */
export async function fetchGrants(q: string, token?: string): Promise<FetchResult> {
  return fetchGrantsAuto(q, token);
}
