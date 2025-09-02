'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

type Grant = {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  url?: string;
  deadline?: string | null;
  match?: number | null;
};

const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000/api').replace(/\/+$/, '');

export default function Dashboard() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  async function fetchGrants(query: string) {
    setLoading(true);
    setError(null);
    try {
      let headers: Record<string, string> | undefined = undefined;
      try {
        const token = await getToken();
        if (token) {
          headers = { Authorization: `Bearer ${token}` };
        }
      } catch {
        // ok if backend does not require auth
      }

      const res = await axios.get(`${API_BASE}/grants`, {
        params: { q: query },
        headers,
      });
      const data = res.data;
      const list: Grant[] = Array.isArray(data?.items) ? data.items : [];
      setItems(list);
    } catch (e: any) {
      console.error(e);
      const msg = e?.response?.data?.message || 'Failed to load grants';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchGrants('');
  }, []);

  function onSearch() {
    void fetchGrants(q.trim());
  }

  return (
    <main className="max-w-5xl mx-auto mt-10">
      <div className="card mb-6">
        <h2 className="text-2xl font-semibold mb-2">Find Grants</h2>

        <div className="flex gap-2">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by keywords or paste a research question..."
          />
          <button className="btn" onClick={onSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="mt-3 text-sm opacity-70">
          Using API: <code>{API_BASE}/grants</code>
        </div>
        {error && <div className="mt-3 text-sm text-red-400">Error: {error}</div>}
      </div>

      <div className="grid gap-4">
        {items.length === 0 && !loading && !error && (
          <div className="card">No grants yet. Try another search.</div>
        )}

        {items.map((g) => (
          <div key={g.id} className="card">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">{g.title}</h3>
                <p className="opacity-80">{g.summary || g.description}</p>
                <div className="text-sm opacity-70 mt-2">
                  {g.deadline ? (
                    <span>
                      Deadline{' '}
                      {new Date(g.deadline).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  ) : (
                    <span>No deadline listed</span>
                  )}
                  {typeof g.match === 'number' ? <span className="ml-3">Match: {g.match}%</span> : null}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <a className="btn" target="_blank" href={g.url || '#'} rel="noreferrer">
                  View Source
                </a>
                <Link className="btn" href={`/grants/${g.id}`}>
                  Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
