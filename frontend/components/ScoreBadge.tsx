// frontend/components/ScoreBadge.tsx
export default function ScoreBadge({ score }: { score?: number }) {
  const s = Math.max(0, Math.min(100, Number.isFinite(score!) ? Number(score) : 0));
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ring-inset"
      style={{
        // greenish at 100, amber mid, red low — simple hue ramp
        background: `hsl(${(s / 100) * 120}, 70%, 95%)`,
        color: `hsl(${(s / 100) * 120}, 60%, 30%)`,
        borderColor: `hsl(${(s / 100) * 120}, 50%, 60%)`,
      }}
      title={`Match score: ${s}%`}
    >
      {s}%
    </span>
  );
}
