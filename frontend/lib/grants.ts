// frontend/lib/grants.ts
// This calls your Railway backend directly

const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');

export async function fetchGrants(q: string, token?: string) {
  const res = await fetch(`${BASE}/api/grants`, {
    method: 'POST', // if your backend expects GET instead, change this to 'GET'
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ q }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Backend error ${res.status}`);
  }

  return res.json();
}
