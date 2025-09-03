// frontend/lib/grants.ts
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');

export async function fetchGrants(q: string, token?: string) {
  const res = await fetch(`${BASE}/api/grants`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ q }),
    cache: 'no-store',
  });
  let body: any = null;
  try { body = await res.json(); } catch { body = await res.text(); }
  return { ok: res.ok, status: res.status, body };
}
