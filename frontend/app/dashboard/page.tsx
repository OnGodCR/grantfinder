'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { fetchGrantsAuto } from '@/lib/grants';

type View = {
  ok: boolean;
  status: number;
  url: string;
  method: 'POST' | 'GET';
  body: any;
  error?: string;
  detected?: boolean;
};

export default function DashboardPage() {
  const { getToken, isSignedIn } = useAuth();
  const [res, setRes] = useState<View | null>(null);

  const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');

  useEffect(() => {
    (async () => {
      try {
        const token = isSignedIn ? await getToken() : undefined;
        const r = await fetchGrantsAuto('', token ?? undefined);
        setRes(r as View);
      } catch (e: any) {
        setRes({
          ok: false,
          status: 0,
          url: `${BASE}/api/grants`,
          method: 'POST',
          body: null,
          error: e?.message || String(e),
          detected: false,
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

      {!res && <div>Detecting endpoint…</div>}

      {!!res && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div>
            <strong>Detected:</strong> {res.detected ? 'yes' : 'no'}
          </div>
          <div>
            <strong>Call:</strong> <code>{res.method} {res.url}</code>
          </div>
          <div>
            <strong>Status:</strong> {res.status} • <strong>OK:</strong> {String(res.ok)}
          </div>
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
              <strong>Hints:</strong> If everything 404s, your actual route might be named differently.
              Check your backend router for the exact path and whether it expects GET or POST.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
