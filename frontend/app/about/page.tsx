export const metadata = {
  title: 'About Us – Grantlytics AI',
  description:
    'A straightforward note to students, faculty, and research leaders about why we built Grantlytics AI and how it helps.',
};

const BRAND = 'Grantlytics AI';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 pb-24">
      {/* Hero */}
      <section className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-white/5 px-4 py-1 text-sm text-body">
          About Us
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight">
          Built for universities that value focus
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-body">
          {BRAND} helps academic teams find and manage grants in one place. Less tab juggling,
          more time for the work that moves research forward.
        </p>
      </section>

      {/* Mission + Story */}
      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-semibold text-text">Our mission</h2>
          <p className="mt-3 text-body">
            Give students, faculty, and research offices a calm, reliable system for funding
            discovery. The goal is simple. Spend more time on ideas and less time chasing links.
          </p>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-text">Where this started</h2>
          <p className="mt-3 text-body">
            I worked as a Youth Researcher at the University of Washington. I sat with professors
            and grad students who were balancing courses, papers, mentoring, and proposals.
            The same issue kept coming up in every conversation.
          </p>
          <blockquote className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-body italic">
            “Finding the right grant is hard. Opportunities are scattered. Deadlines slip.
            Research offices are stretched thin.”
          </blockquote>
          <p className="mt-3 text-body">
            {BRAND} began as a practical response to that reality. The aim is not shiny software.
            The aim is fewer missed chances and clearer days.
          </p>
        </Card>
      </section>

      {/* Audience */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-text">Who we build for</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <MiniCard title="Students and early-career researchers">
            Find opportunities that match your interests. Track deadlines in one view.
            Share a short list with mentors without extra docs.
          </MiniCard>
          <MiniCard title="Faculty">
            Scan plain summaries, review eligibility, and coordinate with co-PIs.
            Keep notes next to each call so decisions are quick and documented.
          </MiniCard>
          <MiniCard title="Research offices">
            Centralize sources like NSF, NIH, Horizon Europe, and foundations.
            Send quiet reminders. See what teams are considering at a glance.
          </MiniCard>
        </div>
      </section>

      {/* Problem */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-text">What gets in the way</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2 text-body">
          <Li>Many sites to check and each has a different format.</Li>
          <Li>Eligibility rules change and are easy to miss.</Li>
          <Li>Sharing happens in spreadsheets and long email threads.</Li>
          <Li>Deadlines slip because there is no single source of truth.</Li>
        </ul>
      </section>

      {/* Solution */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-text">What we built</h2>
        <p className="mt-3 text-body">
          {BRAND} gathers reputable opportunities and adds just enough structure to keep teams aligned.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Feature title="One searchable list">
            Grants from trusted federal and foundation sources, refreshed on a regular cadence.
          </Feature>
          <Feature title="Plain summaries">
            Key details and eligibility in clear language so you can decide quickly.
          </Feature>
          <Feature title="Match suggestions">
            Profiles for departments and faculty that surface relevant calls.
          </Feature>
          <Feature title="Lightweight collaboration">
            Save, tag, comment, and share. Keep context where people can actually find it.
          </Feature>
          <Feature title="Deadline reminders">
            Timely nudges that help teams submit on time without noise.
          </Feature>
          <Feature title="Built on verifiable data">
            Sources you can check. Decisions you can defend.
          </Feature>
        </div>
      </section>

      {/* Values */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-text">How we work</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-4">
          <Value title="Trust first">Public, checkable sources. Clear provenance.</Value>
          <Value title="Clarity">Small features that save real time.</Value>
          <Value title="Shared view">Students, faculty, and staff see the same picture.</Value>
          <Value title="Impact">Measure outcomes by proposals submitted and awards earned.</Value>
        </div>
      </section>

      {/* Founder */}
      <section className="mt-16 grid gap-6 md:grid-cols-[220px_1fr] items-start">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-mint/20 text-mint text-3xl font-bold">
            AK
          </div>
          <div className="font-semibold text-text">Angad Kochar</div>
          <div className="mt-1 text-sm text-body">Youth Researcher, University of Washington</div>
          <div className="text-sm text-body">Founder, {BRAND}</div>
          <div className="mt-4 flex items-center justify-center gap-3">
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
          <p className="mt-2 text-xs text-body">
            Follow the build and product updates.
          </p>
        </div>

        <Card>
          <h3 className="text-xl font-semibold text-text">A note to our community</h3>
          <p className="mt-3 text-body">
            I watched talented people spend evenings copying grant details into sheets.
            That time belongs to reading, writing, mentoring, and building prototypes.
            {` `}{BRAND} is my attempt to give that time back. If we help your team submit
            one more strong proposal this year, we did our job.
          </p>
          <p className="mt-6 text-text font-medium">— Angad</p>
        </Card>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-mint/40 bg-white/5 p-6 md:flex-row">
          <div>
            <h3 className="text-xl font-semibold text-text">Want a short walkthrough</h3>
            <p className="mt-1 text-body">See how departments and labs use {BRAND} day to day.</p>
          </div>
          <div className="flex gap-3">
            <a href="/contact" className="rounded-3xl bg-mint px-6 py-3 font-semibold text-navy hover:opacity-90">
              Book a Demo
            </a>
            <a href="/features" className="rounded-3xl border border-mint px-6 py-3 font-semibold text-text hover:bg-white/5">
              See Features
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ---------- UI helpers (no extra deps) ---------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft ring-1 ring-white/10">
      {children}
    </div>
  )
}

function MiniCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="text-mint font-semibold">{title}</div>
      <p className="mt-2 text-body">{children}</p>
    </div>
  )
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-body">{children}</p>
    </div>
  )
}

function Value({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-mint font-semibold">{title}</div>
      <p className="mt-2 text-body">{children}</p>
    </div>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      • {children}
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
