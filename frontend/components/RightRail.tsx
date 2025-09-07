// frontend/components/RightRail.tsx
import { Grant } from '@/lib/types';
import { clamp, daysUntil } from '@/lib/format';

function Progress({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" style={{ width: `${v}%` }} />
    </div>
  );
}

export default function RightRail({ grants }: { grants: Grant[] }) {
  const top = [...grants]
    .filter(g => typeof g.matchScore === 'number')
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
    .slice(0, 3);

  const soonest = [...grants]
    .map(g => ({ g, days: g.daysRemaining ?? daysUntil(g.deadline) ?? 9999 }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 1)[0];

  const keywords = Array.from(new Set(grants.flatMap(g => g.tags ?? []))).slice(0, 8);

  return (
    <aside className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <h4 className="text-white font-semibold mb-3">Insights</h4>
        <div className="space-y-2 text-white/80 text-sm">
          {top.length ? top.map((g, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="truncate">{g.title}</span>
              <span className="text-cyan-300">{clamp(g.matchScore ?? 0)}%</span>
            </div>
          )) : <div>No recommendations yet.</div>}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <h4 className="text-white font-semibold mb-3">Deadline Tracker</h4>
        <Progress value={soonest ? Math.max(0, 100 - (soonest.days / 60) * 100) : 0} />
        <div className="mt-2 text-sm text-white/70">
          {soonest
            ? <>Soonest deadline in <span className="text-white">{soonest.days}</span> days</>
            : 'No upcoming deadlines'}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <h4 className="text-white font-semibold mb-3">Keyword Trends</h4>
        <div className="flex flex-wrap gap-2">
          {keywords.length ? keywords.map((k, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80">{k}</span>
          )) : <span className="text-white/60 text-sm">No tags yet.</span>}
        </div>
      </section>
    </aside>
  );
}
