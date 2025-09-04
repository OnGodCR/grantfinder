// frontend/app/dashboard/page.tsx
'use client';
export const dynamic = 'force-dynamic';

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
        });
      }
    })();
  }, [getToken, isSignedIn, BASE]);

  return (
    <main style={{ fontFamily: 'ui-sans-serif, system-ui', padding: 20 }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ marginB
