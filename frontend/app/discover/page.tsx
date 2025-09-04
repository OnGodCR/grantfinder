// frontend/app/discover/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { fetchGrantsAuto } from '@/lib/grants';
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
  const [api, setApi] = useState<{status:number; ok:boolean; url:string; error?:string} | null>(null);

  const filtered = useMemo(() => {
    const t = (s?: string | null) => (s ?? '').toLowerCase();
    let rows = grants;

    if (active === 'NSF') rows = rows.filter(g => /nsf|national science foundation/i.test((g.agency || g.source || '')));
    else if (active === 'NIH') rows = rows.filter(g => /nih|national institutes of health/i.test((g.agency || g.source || '')));
    else if (active === 'Foundations') rows = rows.filter(g => /foundation|trust/i.test((g.agency || g.source || '')));
    else if (active === 'Deadline Soon') rows = rows.filter(g => (g.daysRemaining ?? 9999) <= 14);

    if (query.trim()) {
      const q = t(query);
      rows = rows.filter(g =>
        t(g.title).includes(q) ||
        t(g.summary).includes(q) ||
        (g.tags ?? []).some(tag => t(tag).includes(q))
      );
    }
    return rows;
  }, [grants, active, query]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = isSignedIn ? await getToken() : undefined;
        const res = await fetchGrantsAuto('', token ?? undefined);
        setApi({ status: res.status, ok: res.ok, url: res.url, error: res.error });

        if (!res.ok) {
          setGrants([]);
          return;
        }

        const body = res.body;
        const arr = Array.isArray(body?.grants ?? body) ? (body.grants ?? body) : [];
        const items: Grant[] = arr.map((r: any, i: number) => ({
          id: r.id ?? i,
          title: r.title ?? r.name ?? 'Untitled Grant',
          summary: r.summary ?? r.description ?? '',
          agency: r.agency ?? r.source ?? '',
          source: r.source ?? '',
          maxFunding: r.maxFunding ?? r.amount ?? r.max_amount,
          deadline: r.deadline ?? r.due_date ?? r.closeDate,
          daysRemaining: r.daysRemaining,
          matchScore: r.matchScore ?? r.score ?? Math.round(Math.random() * 30 + 65),
          tags: r.tags ?? r.keywords ?? [],
          url: r.url ?? r.link,
        }));

        setGrants(items);
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
          {loading && <div className="rounded-2xl border border-white/10 bg-white/5 p-5">Loading grants…</div>}

          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="font-medium mb-1">No results. Try a different filter or search.</div>
              {/* Debug strip */}
              {api && (
                <div className="mt-3 text-sm text-white/60">
                  <div><span className="text-white/70">Backend:</span> <code>{api.url}</code></div>
                  <div><span className="text-white/70">Status:</span> {api.status} • <span className="text-white/70">OK:</span> {String(api.ok)}</div>
                  {api.error && <div className="text-red-300">Error: {api.error}</div>}
                  {!process.env.NEXT_PUBLIC_BACKEND_URL && (
                    <div className="text-amber-300 mt-1">
                      Warning: NEXT_PUBLIC_BACKEND_URL is not set for this deployment.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {filtered.map(g => <GrantCard key={String(g.id ?? g.title)} grant={g} />)}
        </section>

        {/* Right rail */}
        <RightRail grants={filtered.slice(0, 20)} />
      </div>
    </div>
  );
}
