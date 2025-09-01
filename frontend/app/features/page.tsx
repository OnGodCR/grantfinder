export const metadata = {
  title: 'Features – Grantlytics AI',
  description:
    'One platform for grant discovery, AI summaries, profiles, collaboration, alerts, and admin oversight — built for universities.',
}

const BRAND = 'Grantlytics AI'

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 pb-24">
      {/* Intro */}
      <section className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-white/5 px-4 py-1 text-sm text-body">
          Features
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight">
          One Platform. Every Opportunity.
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg text-body">
          {BRAND} combines a constantly updated grant database with AI-powered insights, personalized
          researcher profiles, and collaboration tools — built for universities that want to maximize funding.
        </p>
      </section>

      {/* Auth & Access */}
      <section className="mt-16">
        <SectionHeader title="Authentication & Access Control" eyebrow="🔐 Access" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <FeatureCard title="Institution-wide access">
            Institution subscriptions with unlimited researcher logins.
          </FeatureCard>
          <FeatureCard title="Role-based control">
            Admins manage. Researchers explore. Clear permissions that scale.
          </FeatureCard>
          <FeatureCard title="Simple sign-in">
            Trusted auth providers and Stripe for subscription management.
          </FeatureCard>
        </div>
        <Note>Universities stay in control while faculty get simple, seamless access.</Note>
      </section>

      {/* Discovery Engine */}
      <section className="mt-16">
        <SectionHeader title="Grant Discovery Engine" eyebrow="📡 Discovery" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <FeatureCard title="Public, verifiable sources">
            Automated intake from NSF, NIH, Horizon Europe, and foundations.
          </FeatureCard>
          <FeatureCard title="Fresh data">
            Daily or weekly refresh cycles so new calls surface quickly.
          </FeatureCard>
          <FeatureCard title="Structured + searchable">
            Grants stored with consistent fields for precise filtering.
          </FeatureCard>
        </div>
        <Note>Always fresh, always comprehensive.</Note>
      </section>

      {/* AI Summaries & Match */}
      <section className="mt-16">
        <SectionHeader title="AI Summaries & Match Scores" eyebrow="🤖 Insights" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <FeatureCard title="Plain-language summaries">
            Purpose, amount, timelines, and eligibility in clear text.
          </FeatureCard>
          <FeatureCard title="Personalized Match Score">
            A 0–100 score per researcher or department to rank relevance.
          </FeatureCard>
          <FeatureCard title="Focus on what matters">
            Cut through noise and save hours of manual reading.
          </FeatureCard>
        </div>
      </section>

      {/* Profiles */}
      <section className="mt-16">
        <SectionHeader title="Researcher & Institution Profiles" eyebrow="👤 Profiles" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <FeatureCard title="Institution focus">
            Define areas, departments, and strategic goals.
          </FeatureCard>
          <FeatureCard title="Faculty profiles">
            Keywords, expertise, and funding history guide recommendations.
          </FeatureCard>
          <FeatureCard title="Improves over time">
            Suggestions get sharper as profiles evolve.
          </FeatureCard>
        </div>
        <Note>Tailored discovery that aligns with your institution’s strengths.</Note>
      </section>

      {/* Collaboration */}
      <section className="mt-16">
        <SectionHeader title="Collaboration & Saved Grants" eyebrow="📂 Teamwork" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <FeatureCard title="Shared collections">
            Bookmark and organize opportunities by lab, PI, or theme.
          </FeatureCard>
          <FeatureCard title="Comments & threads">
            Keep context with the grant instead of in long email chains.
          </FeatureCard>
          <FeatureCard title="Faculty ↔ Admin alignment">
            One view for researchers and research offices.
          </FeatureCard>
        </div>
      </section>

      {/* Alerts */}
      <section className="mt-16">
        <SectionHeader title="Notifications & Alerts" eyebrow="🔔 Alerts" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <FeatureCard title="Email + in-app">
            New calls and changes delivered where you work.
          </FeatureCard>
          <FeatureCard title="Custom rules">
            Filter by deadline, category, or profile attributes.
          </FeatureCard>
          <FeatureCard title="On-time submissions">
            No more last-minute surprises.
          </FeatureCard>
        </div>
      </section>

      {/* Admin Dashboard */}
      <section className="mt-16">
        <SectionHeader title="Admin Dashboard" eyebrow="📊 Oversight" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <FeatureCard title="Subscription & access">
            Manage institution-level settings and roles.
          </FeatureCard>
          <FeatureCard title="Analytics">
            Top categories, search trends, and engagement insights.
          </FeatureCard>
          <FeatureCard title="System status">
            Monitor scrapers and data health at a glance.
          </FeatureCard>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="mt-16">
        <SectionHeader title="Expanded Security & Trust" eyebrow="🔒 Confidence" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <KeyItem title="Secure infrastructure">
            Hosted on Vercel (frontend) and Railway (backend/database) with enterprise-grade isolation,
            monitoring, and patching.
          </KeyItem>
          <KeyItem title="Encryption everywhere">
            TLS/HTTPS in transit and database encryption at rest.
          </KeyItem>
          <KeyItem title="Data ownership & deletion">
            Institutional data belongs to the university. Full export or deletion on request.
          </KeyItem>
          <KeyItem title="Minimal data">
            No student records or unpublished research required. Profiles use basic keywords.
          </KeyItem>
          <KeyItem title="Responsible AI">
            Summarization and scoring via secure APIs. No institutional data used for model training.
          </KeyItem>
          <KeyItem title="Compliance roadmap">
            Actively aligning with SOC 2, GDPR, and FERPA-friendly practices.
          </KeyItem>
        </div>
        <Note>
          Public grant data in. Secure, actionable insights out. Nothing more, nothing less.
        </Note>
      </section>

      {/* Workflow */}
      <section className="mt-16">
        <SectionHeader title="How Grantlytics Works" eyebrow="▶︎ Workflow" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Step>Grant data is scraped from trusted sources.</Step>
          <Step>AI generates summaries and match scores.</Step>
          <Step>Faculty and institutional profiles refine recommendations.</Step>
          <Step>Researchers bookmark, share, and collaborate.</Step>
          <Step>Administrators gain oversight through analytics and dashboards.</Step>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-mint/40 bg-white/5 p-6 ring-1 ring-white/10 md:flex-row">
          <div>
            <h3 className="text-xl font-semibold text-text">Bring smarter grant discovery to your campus.</h3>
            <p className="mt-1 text-body">
              Choose what fits your team. We keep it simple.
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/contact" className="rounded-3xl bg-mint px-6 py-3 font-semibold text-navy hover:opacity-90">
              Request a Pilot
            </a>
            <a href="/contact" className="rounded-3xl border border-mint px-6 py-3 font-semibold text-text hover:bg-white/5">
              Book a Demo
            </a>
          </div>
        </div>
      </section>
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
        <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-white/5 px-4 py-1 text-sm text-body">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-4 text-3xl md:text-4xl font-bold leading-tight">{title}</h2>
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

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-center text-body">
      {children}
    </p>
  )
}

function KeyItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="font-semibold text-text">{title}</div>
      <p className="mt-2 text-body">{children}</p>
    </div>
  )
}

function Step({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-body">• {children}</p>
    </div>
  )
}
