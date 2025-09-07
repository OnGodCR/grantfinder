// frontend/lib/grants.ts
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');

export type FetchResult = {
  ok: boolean;
  status: number;
  url: string;
  method: 'POST';
  body: any;
  rawText?: string;
  error?: string;
};

export async function fetchGrants(q: string, token?: string): Promise<FetchResult> {
  const url = `${BASE}/api/internal/grants`;
  try {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (token) headers.authorization = `Bearer ${token}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ q }),
    });

    const ctype = res.headers.get('content-type') || '';
    let body: any = null;
    let rawText: string | undefined;

    if (ctype.includes('application/json')) {
      body = await res.json().catch(() => null);
    } else {
      rawText = await res.text().catch(() => undefined);
      try { body = rawText ? JSON.parse(rawText) : null; } catch {}
    }

    const out: FetchResult = { ok: res.ok, status: res.status, url, method: 'POST', body, rawText };
    // Helpful for debugging in preview:
    // eslint-disable-next-line no-console
    console.log('[grants] POST', out);
    return out;
  } catch (e: any) {
    const out: FetchResult = { ok: false, status: 0, url, method: 'POST', body: null, error: e?.message || String(e) };
    // eslint-disable-next-line no-console
    console.error('[grants] POST error', out);
    return out;
  }
}

// Back-compat alias so old imports keep working:
export const fetchGrantsAuto = fetchGrants;
