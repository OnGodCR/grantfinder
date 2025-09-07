// frontend/components/ScoreBadge.tsx
"use client";

export default function ScoreBadge({ score }: { score?: number }) {
  const s = typeof score === "number" ? Math.max(0, Math.min(100, score)) : null;
  return (
    <div
      className="shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
      title={s != null ? `${s}% match` : "No score"}
    >
      {s != null ? (
        <span className="text-sm font-semibold">{s}%</span>
      ) : (
        <span className="text-sm text-white/60">—</span>
      )}
    </div>
  );
}
