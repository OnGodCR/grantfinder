export default function GrantCard({ title, summary, score }:{
  title: string; summary: string; score: number;
}) {
  return (
    <div className="rounded-2xl bg-white text-slate-800 p-5 shadow-soft ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="rounded-full bg-mint/30 text-emerald-700 px-3 py-1 text-sm font-semibold">{score}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{summary}</p>
    </div>
  )
}
