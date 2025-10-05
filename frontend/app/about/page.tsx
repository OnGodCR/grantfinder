export const metadata = {
  title: 'About Us – Grantalytic AI',
  description:
    'A straightforward note to students, faculty, and research leaders about why we built Grantalytic AI and how it helps.',
};

const BRAND = 'Grantalytic AI';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Hero */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-6 py-3 text-sm font-semibold text-teal-400 mb-8">
            🎯 About Us
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white mb-6">
            Built for universities that
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"> value focus</span>
          </h1>
          <p className="mx-auto max-w-4xl text-xl text-slate-300 leading-relaxed">
            {BRAND} helps academic teams find and manage grants in one place. Less tab juggling,
            more time for the work that moves research forward.
          </p>
        </section>

        {/* Mission + Story */}
        <section className="mb-20 grid gap-8 md:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎯</span>
              <h2 className="text-3xl font-bold text-white">Our mission</h2>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">
              Give students, faculty, and research offices a calm, reliable system for funding
              discovery. The goal is simple. Spend more time on ideas and less time chasing links.
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💡</span>
              <h2 className="text-3xl font-bold text-white">Where this started</h2>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              I worked as a Youth Researcher at the University of Washington. I sat with professors
              and grad students who were balancing courses, papers, mentoring, and proposals.
              The same issue kept coming up in every conversation.
            </p>
            <blockquote className="mt-6 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-6 text-slate-300 italic text-lg">
              "Finding the right grant is hard. Opportunities are scattered. Deadlines slip.
              Research offices are stretched thin."
            </blockquote>
            <p className="mt-6 text-slate-300 text-lg leading-relaxed">
              {BRAND} began as a practical response to that reality. The aim is not shiny software.
              The aim is fewer missed chances and clearer days.
            </p>
          </Card>
        </section>

        {/* Audience */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Who we build for</h2>
            <p className="text-slate-400 text-lg">Designed for every role in the research ecosystem</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <MiniCard title="Students and early-career researchers" icon="🎓">
              Find opportunities that match your interests. Track deadlines in one view.
              Share a short list with mentors without extra docs.
            </MiniCard>
            <MiniCard title="Faculty" icon="👨‍🏫">
              Scan plain summaries, review eligibility, and coordinate with co-PIs.
              Keep notes next to each call so decisions are quick and documented.
            </MiniCard>
            <MiniCard title="Research offices" icon="🏛️">
              Centralize sources like NSF, NIH, Horizon Europe, and foundations.
              Send quiet reminders. See what teams are considering at a glance.
            </MiniCard>
          </div>
        </section>

        {/* Problem */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">What gets in the way</h2>
            <p className="text-slate-400 text-lg">Common challenges that slow down research teams</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Li icon="🌐">Many sites to check and each has a different format.</Li>
            <Li icon="📋">Eligibility rules change and are easy to miss.</Li>
            <Li icon="📧">Sharing happens in spreadsheets and long email threads.</Li>
            <Li icon="⏰">Deadlines slip because there is no single source of truth.</Li>
          </div>
        </section>

        {/* Solution */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">What we built</h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              {BRAND} gathers reputable opportunities and adds just enough structure to keep teams aligned.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Feature title="One searchable list" icon="🔍">
              Grants from trusted federal and foundation sources, refreshed on a regular cadence.
            </Feature>
            <Feature title="Plain summaries" icon="📝">
              Key details and eligibility in clear language so you can decide quickly.
            </Feature>
            <Feature title="Match suggestions" icon="🎯">
              Profiles for departments and faculty that surface relevant calls.
            </Feature>
            <Feature title="Lightweight collaboration" icon="🤝">
              Save, tag, comment, and share. Keep context where people can actually find it.
            </Feature>
            <Feature title="Deadline reminders" icon="⏰">
              Timely nudges that help teams submit on time without noise.
            </Feature>
            <Feature title="Built on verifiable data" icon="✅">
              Sources you can check. Decisions you can defend.
            </Feature>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How we work</h2>
            <p className="text-slate-400 text-lg">Our core principles that guide everything we build</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            <Value title="Trust first" icon="🤝">Public, checkable sources. Clear provenance.</Value>
            <Value title="Clarity" icon="💡">Small features that save real time.</Value>
            <Value title="Shared view" icon="👥">Students, faculty, and staff see the same picture.</Value>
            <Value title="Impact" icon="📈">Measure outcomes by proposals submitted and awards earned.</Value>
          </div>
        </section>

        {/* Founder */}
        <section className="mb-20 grid gap-8 md:grid-cols-[280px_1fr] items-start">
          <div className="rounded-3xl border border-slate-700/50 bg-slate-800/50 p-8 text-center">
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 text-teal-400 text-4xl font-bold">
              AK
            </div>
            <div className="font-bold text-white text-xl">Angad Kochar</div>
            <div className="mt-2 text-slate-400">Youth Researcher, University of Washington</div>
            <div className="text-teal-400 font-semibold">Founder, {BRAND}</div>
            <div className="mt-6 flex items-center justify-center gap-4">
              <SocialLink
                href="https://www.tiktok.com/@angad.buildz"
                label="TikTok"
                icon={<TikTokIcon />}
              />
              <SocialLink
                href="https://www.instagram.com/angad.buildz"
                label="Instagram"
                icon={<InstagramIcon />}
              />
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Follow the build and product updates.
            </p>
          </div>

          <Card>
            <h3 className="text-2xl font-bold text-white mb-6">A note to our community</h3>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              I watched talented people spend evenings copying grant details into sheets.
              That time belongs to reading, writing, mentoring, and building prototypes.
              {` `}{BRAND} is my attempt to give that time back. If we help your team submit
              one more strong proposal this year, we did our job.
            </p>
            <p className="text-teal-400 font-bold text-lg">— Angad</p>
          </Card>
        </section>

        {/* CTA */}
        <section className="mb-20">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-500/10 to-blue-500/10 p-8 md:flex-row">
            <div>
              <h3 className="text-2xl font-bold text-white">Want a short walkthrough</h3>
              <p className="mt-2 text-slate-300 text-lg">See how departments and labs use {BRAND} day to day.</p>
            </div>
            <div className="flex gap-4">
              <a href="/contact" className="rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 font-semibold text-white hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Book a Demo
              </a>
              <a href="/features" className="rounded-xl border border-teal-500/50 bg-teal-500/10 px-8 py-4 font-semibold text-teal-400 hover:bg-teal-500/20 transition-all duration-200">
                See Features
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ---------- UI helpers (no extra deps) ---------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-700/50 bg-slate-800/50 p-8 shadow-xl ring-1 ring-slate-700/30">
      {children}
    </div>
  )
}

function MiniCard({ title, children, icon }: { title: string; children: React.ReactNode; icon?: string }) {
  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-teal-400 font-bold text-lg">{title}</h3>
      </div>
      <p className="text-slate-300 leading-relaxed">{children}</p>
    </div>
  )
}

function Feature({ title, children, icon }: { title: string; children: React.ReactNode; icon?: string }) {
  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-white font-bold text-lg">{title}</h3>
      </div>
      <p className="text-slate-300 leading-relaxed">{children}</p>
    </div>
  )
}

function Value({ title, children, icon }: { title: string; children: React.ReactNode; icon?: string }) {
  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-3">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="text-teal-400 font-bold text-lg">{title}</h3>
      </div>
      <p className="text-slate-300 leading-relaxed">{children}</p>
    </div>
  )
}

function Li({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <li className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 px-6 py-4 hover:border-teal-500/30 transition-all duration-300">
      <div className="flex items-center gap-4">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="text-slate-300 font-medium">{children}</span>
      </div>
    </li>
  )
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-text hover:bg-white/10"
      aria-label={label}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </a>
  )
}

/* Simple inline icons so you do not need any packages */
function TikTokIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M13.5 3.5c.7 1.9 2.2 3.5 4.1 4.2v3.1c-1.6-.1-3.1-.7-4.4-1.7v5.8a5.7 5.7 0 1 1-5-5.6v3.1a2.5 2.5 0 1 0 2 2.4V3.5h3.3z"/>
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-3a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 17.75 6.5z"/>
    </svg>
  )
}
