export const metadata = {
  title: 'Features – Grantalytic AI',
  description:
    'One platform for grant discovery, AI summaries, profiles, collaboration, alerts, and admin oversight — built for universities.',
}

const BRAND = 'Grantalytic AI'

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-6 py-3 text-sm font-semibold text-teal-400 mb-8">
            ✨ Features
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white mb-6">
            One Platform.
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"> Every Opportunity.</span>
          </h1>
          <p className="mx-auto max-w-4xl text-xl text-slate-300 leading-relaxed">
            {BRAND} combines a constantly updated grant database with AI-powered insights, personalized
            researcher profiles, and collaboration tools — built for universities that want to maximize funding.
          </p>
        </section>

        {/* Auth & Access */}
        <section className="mb-20">
          <SectionHeader title="Authentication & Access Control" eyebrow="🔐 Access" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard title="Institution-wide access" icon="🏛️">
              Institution subscriptions with unlimited researcher logins and centralized management.
            </FeatureCard>
            <FeatureCard title="Role-based control" icon="👥">
              Admins manage. Researchers explore. Clear permissions that scale with your organization.
            </FeatureCard>
            <FeatureCard title="Simple sign-in" icon="🔑">
              Trusted auth providers and Stripe for seamless subscription management.
            </FeatureCard>
          </div>
          <Note>Universities stay in control while faculty get simple, seamless access.</Note>
        </section>

        {/* Discovery Engine */}
        <section className="mb-20">
          <SectionHeader title="Grant Discovery Engine" eyebrow="📡 Discovery" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard title="Public, verifiable sources" icon="🌐">
              Automated intake from NSF, NIH, Horizon Europe, and leading foundations worldwide.
            </FeatureCard>
            <FeatureCard title="Fresh data" icon="⚡">
              Daily or weekly refresh cycles so new calls surface quickly and deadlines are never missed.
            </FeatureCard>
            <FeatureCard title="Structured + searchable" icon="🔍">
              Grants stored with consistent fields for precise filtering and advanced search capabilities.
            </FeatureCard>
          </div>
          <Note>Always fresh, always comprehensive.</Note>
        </section>

        {/* AI Summaries & Match */}
        <section className="mb-20">
          <SectionHeader title="AI Summaries & Match Scores" eyebrow="🤖 Insights" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard title="Plain-language summaries" icon="📝">
              Purpose, amount, timelines, and eligibility in clear, easy-to-understand text.
            </FeatureCard>
            <FeatureCard title="Personalized Match Score" icon="🎯">
              A 0–100 score per researcher or department to rank relevance and save time.
            </FeatureCard>
            <FeatureCard title="Focus on what matters" icon="⚡">
              Cut through noise and save hours of manual reading with AI-powered insights.
            </FeatureCard>
          </div>
        </section>

        {/* Profiles */}
        <section className="mb-20">
          <SectionHeader title="Researcher & Institution Profiles" eyebrow="👤 Profiles" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard title="Institution focus" icon="🏢">
              Define areas, departments, and strategic goals for targeted grant discovery.
            </FeatureCard>
            <FeatureCard title="Faculty profiles" icon="👨‍🎓">
              Keywords, expertise, and funding history guide personalized recommendations.
            </FeatureCard>
            <FeatureCard title="Improves over time" icon="📈">
              Suggestions get sharper as profiles evolve and learn from your preferences.
            </FeatureCard>
          </div>
          <Note>Tailored discovery that aligns with your institution's strengths.</Note>
        </section>

        {/* Collaboration */}
        <section className="mb-20">
          <SectionHeader title="Collaboration & Saved Grants" eyebrow="📂 Teamwork" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard title="Shared collections" icon="📚">
              Bookmark and organize opportunities by lab, PI, or research theme.
            </FeatureCard>
            <FeatureCard title="Comments & threads" icon="💬">
              Keep context with the grant instead of in long email chains.
            </FeatureCard>
            <FeatureCard title="Faculty ↔ Admin alignment" icon="🤝">
              One view for researchers and research offices to stay coordinated.
            </FeatureCard>
          </div>
        </section>

        {/* Alerts */}
        <section className="mb-20">
          <SectionHeader title="Notifications & Alerts" eyebrow="🔔 Alerts" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard title="Email + in-app" icon="📧">
              New calls and changes delivered where you work most effectively.
            </FeatureCard>
            <FeatureCard title="Custom rules" icon="⚙️">
              Filter by deadline, category, or profile attributes for precision.
            </FeatureCard>
            <FeatureCard title="On-time submissions" icon="⏰">
              No more last-minute surprises with proactive deadline management.
            </FeatureCard>
          </div>
        </section>

        {/* Admin Dashboard */}
        <section className="mb-20">
          <SectionHeader title="Admin Dashboard" eyebrow="📊 Oversight" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <FeatureCard title="Subscription & access" icon="🔧">
              Manage institution-level settings and roles with granular control.
            </FeatureCard>
            <FeatureCard title="Analytics" icon="📊">
              Top categories, search trends, and engagement insights for data-driven decisions.
            </FeatureCard>
            <FeatureCard title="System status" icon="🔍">
              Monitor scrapers and data health at a glance for optimal performance.
            </FeatureCard>
          </div>
        </section>

        {/* Security & Trust */}
        <section className="mb-20">
          <SectionHeader title="Security & Trust" eyebrow="🔒 Confidence" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <KeyItem title="Secure infrastructure" icon="🛡️">
              Hosted on Vercel (frontend) and Railway (backend/database) with enterprise-grade isolation,
              monitoring, and patching.
            </KeyItem>
            <KeyItem title="Encryption everywhere" icon="🔐">
              TLS/HTTPS in transit and database encryption at rest for maximum security.
            </KeyItem>
            <KeyItem title="Data ownership & deletion" icon="📋">
              Institutional data belongs to the university. Full export or deletion on request.
            </KeyItem>
            <KeyItem title="Minimal data" icon="🔒">
              No student records or unpublished research required. Profiles use basic keywords only.
            </KeyItem>
            <KeyItem title="Responsible AI" icon="🤖">
              Summarization and scoring via secure APIs. No institutional data used for model training.
            </KeyItem>
            <KeyItem title="Compliance roadmap" icon="📜">
              Actively aligning with SOC 2, GDPR, and FERPA-friendly practices.
            </KeyItem>
          </div>
          <Note>
            Public grant data in. Secure, actionable insights out. Nothing more, nothing less.
          </Note>
        </section>

        {/* Workflow */}
        <section className="mb-20">
          <SectionHeader title="How Grantalytic Works" eyebrow="▶︎ Workflow" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Step icon="1">Grant data is scraped from trusted sources.</Step>
            <Step icon="2">AI generates summaries and match scores.</Step>
            <Step icon="3">Faculty and institutional profiles refine recommendations.</Step>
            <Step icon="4">Researchers bookmark, share, and collaborate.</Step>
            <Step icon="5">Administrators gain oversight through analytics and dashboards.</Step>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-500/10 to-blue-500/10 p-8 ring-1 ring-teal-500/20 md:flex-row">
            <div>
              <h3 className="text-2xl font-bold text-white">Bring smarter grant discovery to your campus.</h3>
              <p className="mt-2 text-slate-300 text-lg">
                Choose what fits your team. We keep it simple.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="/contact" className="rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 font-semibold text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Request a Pilot
              </a>
              <a href="/contact" className="rounded-xl border border-teal-500/50 bg-teal-500/10 px-8 py-4 font-semibold text-teal-400 hover:bg-teal-500/20 transition-all duration-200">
                Book a Demo
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ---------------- UI helpers (kept inline; no extra imports) ---------------- */

function SectionHeader({
  title,
  eyebrow,
}: {
  title: string
  eyebrow?: string
}) {
  return (
    <div className="text-center">
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-6 py-3 text-sm font-semibold text-teal-400">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-6 text-4xl md:text-5xl font-bold leading-tight text-white">{title}</h2>
    </div>
  )
}

function FeatureCard({ title, children, icon }: { title: string; children: React.ReactNode; icon?: string }) {
  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 ring-1 ring-slate-700/30 hover:border-teal-500/30 hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-teal-400 font-bold text-lg">{title}</h3>
      </div>
      <p className="text-slate-300 leading-relaxed">{children}</p>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 text-center text-slate-400 text-lg font-medium">
      {children}
    </p>
  )
}

function KeyItem({ title, children, icon }: { title: string; children: React.ReactNode; icon?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 hover:border-teal-500/30 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="font-bold text-white text-lg">{title}</h3>
      </div>
      <p className="text-slate-300 leading-relaxed">{children}</p>
    </div>
  )
}

function Step({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 px-6 py-4 hover:border-teal-500/30 transition-all duration-300">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-teal-400 font-bold text-sm">
            {icon}
          </div>
        )}
        <p className="text-slate-300 font-medium">{children}</p>
      </div>
    </div>
  )
}
