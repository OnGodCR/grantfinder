'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type View = {
  ok: boolean;
  status: number;
  url: string;
  body: any;
  error?: string;
};

export default function DashboardPage() {
  const { getToken, isSignedIn } = useAuth();
  const [res, setRes] = useState<View | null>(null);

  const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');

  useEffect(() => {
    (async () => {
      try {
        const token = isSignedIn ? await getToken() : undefined;

        const url = `${BASE}/api/grants`;
        const r = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ q: '' }),
        });

        // ✅ Read body exactly once using clone().text(), then try JSON.parse
        const text = await r.clone().text();
        let body: any = text;
        try { body = JSON.parse(text); } catch { /* leave as text */ }

        setRes({ ok: r.ok, status: r.status, url, body });
      } catch (e: any) {
        // Network/CORS/etc. errors land here (status will be 0)
        setRes({
          ok: false,
          status: 0,
          url: `${BASE}/api/grants`,
          body: null,
          error: e?.message || String(e),
        });
      }
    })();
  }, [getToken, isSignedIn, BASE]);

  return (
    <main style={{ fontFamily: 'ui-sans-serif, system-ui', padding: 20 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ marginBottom: 12 }}>
        Backend: <code>{BASE || '(missing NEXT_PUBLIC_BACKEND_URL)'}</code>
      </p>

      {!res && <div>Loading…</div>}

      {!!res && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div><strong>Call:</strong> <code>POST {res.url}</code></div>
          <div><strong>Status:</strong> {res.status} • <strong>OK:</strong> {String(res.ok)}</div>
          {res.error && (
            <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>
Error: {res.error}
            </pre>
          )}
          <details style={{ marginTop: 8 }}>
            <summary>Response Body</summary>
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
{typeof res.body === 'string' ? res.body : JSON.stringify(res.body, null, 2)}
            </pre>
          </details>

          {!res.ok && (
            <div style={{ marginTop: 12, color: '#b91c1c' }}>
              <strong>Hints:</strong> 401 → sign in (Clerk) & verify backend accepts Clerk <em>LIVE</em> tokens.
              CORS error → confirm backend CORS allows <code>https://grantlytic.com</code> and <code>Authorization</code> header.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
