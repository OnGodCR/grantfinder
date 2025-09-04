// frontend/components/GrantCard.tsx
import { Grant } from '@/lib/types';
import { clamp, currency, daysUntil, shortDate } from '@/lib/format';

// Accept EITHER { grant: Grant } or a Grant directly (spread props)
type Props = { grant: Grant } | Grant;

function toGrant(p: Props): Grant {
  return (typeof (p as any).title !== 'undefined' || typeof (p as any).id !== 'undefined')
    ? (p as Grant)
    : (p as { grant: Grant }).grant;
}

export default function GrantCard(props: Props) {
  const grant = toGrant(props);

  const score = clamp(grant.matchScore ?? 0);
  const days = grant.daysRemaining ?? daysUntil(grant.deadline) ?? undefined;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-4">
        {/* Title & meta */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[1.25rem] font-semibold text-white mb-1">
            {grant.title || 'Untitled Grant'}
          </h3>
          <div className="text-sm text-white/70 mb-2">
            {grant.agency || grant.source ? <span className="mr-3">{grant.agency || grant.source}</span> : null}
            {grant.maxFunding !== undefined && <span>Maximum: {currency(grant.maxFunding)}</span>}
          </div>
          {grant.summary && (
            <p className="text-white/70 line-clamp-2">{grant.summary}</p>
          )}
          {/* Tags */}
          {grant.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {grant.tags.slice(0, 6).map((t, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80">{t}</span>
              ))}
            </div>
          ) : null}
          {/* Footer */}
          <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
            <span className="inline-flex items-center gap-1">
              📅 Deadline: <strong className="text-white ml-1">{grant.deadline ? shortDate(grant.deadline) : (days ? `${days} days` : '—')}</strong>
            </span>
            {grant.url && (
              <a href={grant.url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4">
                View details ↗
              </a>
            )}
          </div>
        </div>

        {/* Score badge */}
        <div className="shrink-0 relative">
          <div className="h-16 w-16 rounded-full bg-gradient-to-b from-cyan-400/30 to-cyan-600/30 border border-cyan-400/30 grid place-items-center">
            <div className="text-cyan-200 text-xl font-semibold">{score}%</div>
          </div>
          <div className="text-center text-[11px] text-white/60 mt-1">Match</div>
        </div>
      </div>
    </article>
  );
}
