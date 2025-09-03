'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

type Grant = {
  id: string;
  title: string;
  summary?: string;
  url?: string;
  deadline?: string | null;
  match?: number | null;
};

export default function Dashboard() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  async function search(query = q) {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();

      const res = await axios.get('/api/proxy/grants', {
        params: { q: query },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = res.data;
      const list = Array.isArray(data?.items) ? data.items : data;

      const normalized: Grant[] = (list || []).map((g: any) => ({
        id:
          g.id ??
          g.sourceId ??
          g.url ??
          Math.random().toString(36).slice(2),
        title: g.title ?? 'Untitled',
        summary: g.summary ?? g.description ?? '',
        url: g.url,
        deadline: g.deadline ?? null,
        match:
          typeof g.match === 'number'
            ? g.match
            : typeof g.score === 'number'
            ? g.score
            : null,
      }));

      setItems(normalized);
    } catch (e) {
      console.error(e);
      setError('Could not load grants');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial fetch (empty query)
    search('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <button className="btn" onClick={() => search()}>
            Search
          </button>
        </div>
        {loading && <p className="mt-2 text-sm opacity-70">Loading…</p>}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="grid gap-4">
        {items.map((g) => (
          <div key={g.id} className="card">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">{g.title}</h3>
                <p className="opacity-80">{g.summary}</p>
                <div className="text-sm opacity-70 mt-2">
                  {g.deadline ? (
                    <span>
                      Deadline: {new Date(g.deadline).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>No deadline listed</span>
                  )}
                  {typeof g.match === 'number' ? (
                    <span className="ml-3">Match: {g.match}%</span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <a
                  className="btn"
                  target="_blank"
                  rel="noreferrer"
                  href={g.url || '#'}
                >
                  View Source
                </a>
                <Link className="btn" href={`/grants/${encodeURIComponent(g.id)}`}>
                  Details
                </Link>
              </div>
            </div>
          </div>
        ))}

        {!loading && !error && items.length === 0 && (
          <p className="opacity-70">No results yet — try a search.</p>
        )}
      </div>
    </main>
  );
}
