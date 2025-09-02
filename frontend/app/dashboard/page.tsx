'use client';

import { useEffect, useState, useCallback } from 'react';
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

const GRANTS_URL = '/api/grants'; // proxied via next.config.js rewrites

export default function Dashboard() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken?.();
      const url = `${GRANTS_URL}${q ? `?q=${encodeURIComponent(q)}` : ''}`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const data = await res.json();
      const list: Grant[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];

      setItems(list);
    } catch (e) {
      console.error(e);
      setError('Could not load grants. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [q, getToken]);

  useEffect(() => {
    // initial load
    search();
  }, [search]);

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
          <button className="btn" onClick={search} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {error ? <p className="mt-3 text-red-400 text-sm">{error}</p> : null}
      </div>

      <div className="grid gap-4">
        {items.map((g) => {
          const deadline = g.deadline ? new Date(g.deadline) : null;
          const summary = g.summary || g.description || '';
          const match =
            typeof g.match === 'number'
              ? `${Math.round(g.match)}%`
              : undefined;

          return (
            <div key={g.id} className="card">
              <div className="flex justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold">{g.title}</h3>
                  {summary ? <p className="opacity-80">{summary}</p> : null}
                  <div className="text-sm opacity-70 mt-2">
                    <span>
                      {deadline
                        ? `Deadline: ${deadline.toLocaleDateString()}`
                        : 'No deadline listed'}
                    </span>
                    {match ? <span className="ml-3">Match: {match}</span> : null}
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end shrink-0">
                  {g.url ? (
                    <a className="btn" target="_blank" rel="noreferrer" href={g.url}>
                      View Source
                    </a>
                  ) : null}
                  <Link className="btn" href={`/grants/${g.id}`}>
                    Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && !error && items.length === 0 ? (
          <p className="text-sm opacity-70">No results yet. Try a broader query.</p>
        ) : null}
      </div>
    </main>
  );
}
