'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchGrantsAuto } from '@/lib/grants';

export default function GrantsClient() {
  const { getToken, isSignedIn } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = isSignedIn ? await getToken() : undefined;
        const r = await fetchGrantsAuto('', token ?? undefined);
        if (!r.ok) throw new Error(`Backend ${r.status}`);
        setData(r.body);
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    })();
  }, [getToken, isSignedIn]);

  if (error) return <pre>Error: {error}</pre>;
  if (!data) return <div>Loading…</div>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
