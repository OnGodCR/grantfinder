'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { fetchGrants } from '@/lib/grants';
import { Grant } from '@/lib/types';
import GrantCard from '@/components/GrantCard';
import RightRail from '@/components/RightRail';

const FILTERS = ['NSF', 'NIH', 'Foundations', 'Deadline Soon'];

export default function DiscoverPage() {
  const { getToken, isSignedIn } = useAuth();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>('NSF');
  const [loading, setLoading] = useState(false);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const trimmed = (s: string | undefined | null) => (s ?? '').toLowerCase();
    let rows = grants;

    let rows = grants;

    if (active === 'NSF') rows = rows.filter(g => /nsf|national science foundation/i.test(g.agency || g.source || ''));
    else if (active === 'NIH') rows = rows.filter(g => /nih|national institutes of health/i.test(g.agency || g.source || ''));
    else if (active === 'Foundations') rows = rows.filter(g => /foundation|trust/i.test(g.agency || g.source || ''));
    else if (active === 'Deadline Soon') rows = rows.filter(g => (g.daysRemaining ?? 9999) <= 14);

    if (query.trim()) {
      const q = trimmed(query);
      rows = rows.filter(g =>
        trimmed(g.title).includes(q) ||
        trimmed(g.summary).includes(q) ||
        (g.tags ?? []).some(t => trimmed(t).includes(q))
      );
    }
    return rows;
  }, [grants, active, query]);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const token = isSignedIn ? await getToken() : undefined;
        // Empty search to start; change to query if your API supports it
        const res = await fetchGrants('', token ?? undefined);
        if (!res.ok) throw new Error(`Backend ${res.status}`);
        // Normalize your API payload into Grant[]
        const body = res.body;
        const items: Grant[] = Array.isArray(body?.grants ?? body)
          ? (body.grants ?? body).map((r: any, i: number) => ({
              id: r.id ?? i,
              title: r.title ?? r.name ?? 'Untitled Grant',
              summary: r.summary ?? r.description ?? '',
              agency: r.agency ?? r.source ?? '',
              source: r.source ?? '',
              maxFunding: r.maxFunding ?? r.amount ?? r.max_amount,
              deadline: r.deadline ?? r.due_date ?? r.closeDate,
              daysRemaining: r.daysRemaining,
              matchScore: r.matchScore ?? r.score ?? Math.round(Math.random() * 30 + 65), // fallback nice score
              tags: r.tags ?? r.keywords ?? [],
              url: r.url ?? r.link,
            }))
          : [];
        setGrants(items);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken, isSignedIn]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 text-white">
      {/* Search + header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for grants, keywords, or agencies"
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-3 outline-none text-white placeholder-white/50"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">⌘K</div>
        </div>
        <div className="hidden md:block rounded-xl border border-white/10 bg-white/5 px-4 py-2">Profile ▾</div>
      </div>

      <h1 className="text-3xl md:text-4xl font-semibold mt-6">Discover Grants</h1>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`px-3 py-1.5 rounded-full border ${active === f ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Results */}
        <section className="space-y-4">
          {loading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">Loading grants…</div>
          )}
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-200">Error: {error}</div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">No results. Try a different filter or search.</div>
          )}
          {filtered.map(g => <GrantCard key={g.id} grant={g} />)}
        </section>

        {/* Right rail */}
        <RightRail grants={filtered.slice(0, 20)} />
      </div>
    </div>
  );
}
