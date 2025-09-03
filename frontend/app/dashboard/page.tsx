'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type View = { ok: boolean; status: number; body: any; error?: string };

export default function DashboardPage() {
  const { getToken, isSignedIn } = useAuth();
  const [res, setRes] = useState<View | null>(null);

  // Your Railway base URL is read from NEXT_PUBLIC_BACKEND_URL
  const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');

  useEffect(() => {
    (async () => {
      try {
        const token = isSignedIn ? await getToken() : undefined;

        const r = await fetch(`${BASE}/api/grants`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ q: '' }),
        });

        let body: any = null;
        try { body = await r.json(); } catch { body = await r.text(); }

        setRes({ ok: r.ok, status: r.status, body });
      } catch (e: any) {
        setRes({ ok: false, status: 0, body: null, error: e?.message || String(e) });
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
          <div><strong>Call:</strong> <code>POST {BASE}/api/grants</code></div>
          <div><strong>Status:</strong> {res.status} • <strong>OK:</strong> {String(res.ok)}</div>
          {res.error && <pre style={{ whiteSpace: 'pre-wrap' }}>Error: {res.error}</pre>}
          <details style={{ marginTop: 8 }}>
            <summary>Response Body</summary>
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
{typeof res.body === 'string' ? res.body : JSON.stringify(res.body, null, 2)}
            </pre>
          </details>

          {!res.ok && (
            <div style={{ marginTop: 12, color: '#b91c1c' }}>
              <strong>Tip:</strong> If you see 401, make sure you’re signed in (Clerk) and your backend is verifying Clerk <em>LIVE</em> tokens.
              If you see a CORS error, confirm your backend CORS allows <code>https://grantlytic.com</code>.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
