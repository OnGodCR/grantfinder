import GrantCard from '@/components/GrantCard'

/* ---------------- existing content stays exactly as you had it ---------------- */

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
    <>
      {/* Hero + sample grant cards (unchanged) */}
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

      {/* ---------------- new sections start here ---------------- */}

      {/* Quick CTA strip under hero */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center ring-1 ring-white/10">
          <p className="text-body">
            We are currently looking to Pilot our services at Universities! Think you'd be a good fit?
          </p>
          <div className="mt-3">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-3xl bg-mint px-6 py-3 font-semibold text-navy hover:opacity-90"
            >
              Request a Pilot
            </a>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12">
        <SectionHeader
          eyebrow="Security & Trust"
          title="Secure by design. Built for higher education."
          description="We know universities take data security seriously. We do too. Grantalytic is designed with transparency and trust at its core."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <TrustItem>
            🔒 Hosted on Vercel (frontend) and Railway (backend and database) using managed, enterprise-grade infrastructure.
          </TrustItem>
          <TrustItem>
            📡 Grants only from public, verifiable sources like NSF, NIH, Horizon Europe, and foundation databases.
          </TrustItem>
          <TrustItem>
            👤 Institutional ownership of all data. Full export and deletion available on request.
          </TrustItem>
          <TrustItem>
            🔑 Role-based authentication and encrypted connections over TLS/HTTPS.
          </TrustItem>
          <TrustItem>
            🚫 No sensitive student records or unpublished research required.
          </TrustItem>
          <TrustItem>
            ✅ Peace of mind for IT. Simple for researchers.
          </TrustItem>
        </div>
      </section>

      {/* Core Features */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-16">
        <SectionHeader
          eyebrow="Core Features"
          title="Discover more. Work smarter. Win faster."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <FeatureCard title="Grant Discovery Engine">
            Aggregated NSF, NIH, Horizon Europe, and foundation data in one searchable place.
          </FeatureCard>
          <FeatureCard title="AI Summaries and Match Scores">
            Instant highlights for eligibility and relevance so teams can decide quickly.
          </FeatureCard>
          <FeatureCard title="Researcher Profiles">
            Tailored suggestions that fit each faculty member and lab focus.
          </FeatureCard>
          <FeatureCard title="Collaboration Tools">
            Shared collections and discussion threads that keep context in one view.
          </FeatureCard>
          <FeatureCard title="Smart Alerts">
            Email and in-app reminders for deadlines with the right level of signal.
          </FeatureCard>
          <FeatureCard title="Admin Dashboard">
            Oversight, analytics, and subscription management for your institution.
          </FeatureCard>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/features"
            className="inline-flex items-center justify-center rounded-3xl border border-mint px-6 py-3 font-semibold text-text hover:bg-white/5"
          >
            Explore all features
          </a>
        </div>
      </section>

      {/* The Why */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-20">
        <SectionHeader eyebrow="The Why" title="Why we built Grantalytic" />

        <div className="grid gap-6 md:grid-cols-[280px_1fr] items-start">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-mint/20 text-mint text-2xl font-bold">
              AK
            </div>
            <div className="text-text font-semibold">Angad Kochar</div>
            <div className="text-body text-sm">Founder</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10">
            <p className="text-body">
              While working as a Youth Researcher at the University of Washington, I collaborated with PhD students and professors on active projects. One challenge kept coming up in conversation.
            </p>
            <blockquote className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 italic text-body">
              “Finding the right grants is slow, fragmented, and overwhelming.”
            </blockquote>
            <p className="mt-4 text-body">
              That insight inspired me to build Grantalytic. The goal is a platform designed with researchers, for researchers, so grant discovery is faster, clearer, and easier to coordinate across a university.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-mint/40 bg-white/5 p-6 md:flex-row">
          <div>
            <h3 className="text-xl font-semibold text-text">Ready to unlock more funding for your institution?</h3>
            <p className="mt-1 text-body">Choose what fits your team. We keep it simple.</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/contact"
              className="rounded-3xl bg-mint px-6 py-3 font-semibold text-navy hover:opacity-90"
            >
              Request a Pilot
            </a>
            <a
              href="/contact"
              className="rounded-3xl border border-mint px-6 py-3 font-semibold text-text hover:bg-white/5"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

/* ---------------- tiny UI helpers to keep things clean ---------------- */

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="text-center">
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-white/5 px-4 py-1 text-sm text-body">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-4 text-3xl md:text-4xl font-bold leading-tight">{title}</h2>
      {description ? <p className="mx-auto mt-3 max-w-3xl text-body">{description}</p> : null}
    </div>
  )
}

function FeatureCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10">
      <div className="text-mint font-semibold">{title}</div>
      <p className="mt-2 text-body">{children}</p>
    </div>
  )
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-body">{children}</p>
    </div>
  )
}
