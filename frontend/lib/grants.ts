// frontend/lib/grants.ts
// Directly call your Railway backend, no Next.js proxy.

const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');

if (!BASE) {
  // Helps you notice if the env var is missing in Vercel prod
  console.warn('NEXT_PUBLIC_BACKEND_URL is missing');
}

export async function fetchGrants(q: string, token?: string) {
  const res = await fetch(`${BASE}/api/grants`, {
    method: 'POST',                               // change to 'GET' if your backend expects GET
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ q }),                  // if backend expects GET, put ?q=... in the URL and remove body
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend ${res.status}: ${text}`);
  }
  return res.json();
}
