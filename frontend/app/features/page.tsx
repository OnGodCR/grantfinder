export const metadata = { title: 'Features – Fundora AI' }

export default function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-bold">Features</h1>
      <div className="mt-8 grid md:grid-cols-2 gap-8 text-body">
        <div className="rounded-3xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-text">Grant Aggregation</h3>
          <p className="mt-2">Pulls from NSF, NIH, Horizon, and other sources with daily refresh.</p>
        </div>
        <div className="rounded-3xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-text">Semantic Matching & Scoring</h3>
          <p className="mt-2">Embeddings-driven fit score for each opportunity.</p>
        </div>
        <div className="rounded-3xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-text">Team Workspaces</h3>
          <p className="mt-2">Share lists, notes, and statuses with faculty and staff.</p>
        </div>
        <div className="rounded-3xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold text-text">Application Tracking</h3>
          <p className="mt-2">Stages, deadlines, reminders, and export to CSV.</p>
        </div>
      </div>
    </section>
  )
}
