import GrantCard from '@/components/GrantCard'

const grants = [
  { title: 'Climate Change Research Initiative',
    summary: 'NSF program supporting climate-focused research projects.',
    score: 82 },
  { title: 'Genomics and Health Disparities',
    summary: 'Funding to study genomic factors in public health outcomes.',
    score: 87 },
  { title: 'Renewable Energy Technology Development',
    summary: 'Support for novel energy tech with environmental impact.',
    score: 50 },
  { title: 'Digital Education Innovation',
    summary: 'Grants accelerating modern learning technologies.',
    score: 78 },
]

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left: hero */}
        <div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            AI-Powered Grant Discovery for Universities
          </h1>
          <p className="mt-6 text-lg text-body">
            Save your faculty hours of searching. Find, match, and apply for research grants in minutes.
          </p>
          <div className="mt-8 flex gap-4">
            <a className="rounded-3xl bg-mint text-navy px-6 py-3 font-semibold hover:opacity-90" href="/contact">
              Book a Demo
            </a>
            <a className="rounded-3xl border border-mint text-text px-6 py-3 font-semibold hover:bg-white/5" href="/features">
              See How It Works
            </a>
          </div>
          {/* UPDATED BRAND NAME HERE */}
          <p className="mt-10 text-sm text-body/80">
            Grantlytic AI aggregates funding opportunities from trusted sources (NSF, NIH, Horizon, and more).
          </p>
        </div>

        {/* Right: grant cards panel */}
        <div className="rounded-3xl bg-white/5 p-4 md:p-6 ring-1 ring-white/10">
          <div className="rounded-3xl bg-off p-4 md:p-6 shadow-soft">
            <div className="space-y-4">
              {grants.map(g => <GrantCard key={g.title} {...g} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
