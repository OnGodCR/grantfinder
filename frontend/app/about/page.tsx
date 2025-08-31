export const metadata = {
  title: 'About Us – Grantlytics AI',
  description:
    'Our mission, story, problem, solution, values, and vision—how Grantlytics AI helps universities unlock more research funding with less effort.',
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
          Built for researchers. <span className="text-mint">Powered by AI.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-body">
          {BRAND} helps universities unlock more research funding with less effort—so faculty
          can spend time on discovery, not searching.
        </p>
      </section>

      {/* Mission */}
      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-semibold text-text">Our Mission</h2>
          <p className="mt-3 text-body">
            At {BRAND}, our mission is simple: to help universities unlock more research funding
            with less effort. We believe faculty and administrators should spend their time
            driving discovery, not endlessly searching through scattered databases.
          </p>
        </Card>

        {/* Story */}
        <Card>
          <h2 className="text-2xl font-semibold text-text">Our Story</h2>
          <p className="mt-3 text-body">
            {BRAND} was born out of research itself. While working as a Youth Researcher at the
            University of Washington, I had the chance to collaborate with PhD students and
            professors on real academic projects. In those conversations, one theme kept surfacing:
          </p>
          <Quote>
            🔹 “Finding the right grant is hard. Opportunities are fragmented, deadlines slip by,
            and research offices are stretched thin.”
          </Quote>
          <p className="mt-3 text-body">
            Hearing this pain point directly from the people living it every day, I knew there had
            to be a better way. That insight inspired me to create {BRAND} — a tool designed with
            researchers, for researchers.
          </p>
        </Card>
      </section>

      {/* Problem */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-text">The Problem</h2>
        <p className="mt-3 text-body">
          Universities face a funding paradox: billions of dollars in grants are available
          worldwide, yet faculty and administrators waste countless hours:
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2 text-body">
          {[
            'Sifting through siloed websites (NSF, NIH, Horizon Europe, foundations).',
            'Manually checking eligibility requirements.',
            'Sharing opportunities through endless spreadsheets and email threads.',
            'The result? Missed deadlines, faculty frustration, and lost funding opportunities.',
          ].map((item) => (
            <li key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">• {item}</li>
          ))}
        </ul>
      </section>

      {/* Solution */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-text">Our Solution</h2>
        <p className="mt-3 text-body">
          {BRAND} brings it all together.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Feature title="Aggregated Database">
            We scrape and update grants from trusted federal and foundation sources.
          </Feature>
          <Feature title="AI-Powered Summaries">
            Each grant is summarized into plain language with clear eligibility highlights.
          </Feature>
          <Feature title="Personalized Match Scores">
            Profiles for faculty and departments ensure the right grants find the right researchers.
          </Feature>
          <Feature title="Collaboration Tools">
            Bookmarking, shared collections, and in-app discussion keep teams aligned.
          </Feature>
          <Feature title="Alerts & Notifications">
            Never miss a deadline again — new opportunities arrive automatically.
          </Feature>
        </div>

        <p className="mt-6 text-body">
          {BRAND} acts like a funding radar for universities — saving time, improving grant hit
          rates, and giving research offices a competitive edge.
        </p>
      </section>

      {/* Values */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-text">Our Values</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-4">
          <Value title="Trustworthy">Built on public, verifiable data sources.</Value>
          <Value title="Efficient">Every feature designed to save hours of manual searching.</Value>
          <Value title="Collaborative">Faculty and administrators work together seamlessly.</Value>
          <Value title="Impact-Driven">Every grant won means new knowledge, innovation, and opportunities for students.</Value>
        </div>
      </section>

      {/* Vision */}
      <section className="mt-16">
        <div className="rounded-3xl border border-mint/30 bg-gradient-to-br from-white/10 to-white/0 p-8 ring-1 ring-white/10">
          <h2 className="text-2xl font-semibold text-text">Our Vision</h2>
          <p className="mt-3 text-body">
            We’re building more than a platform — we’re building a future where every university
            has the tools to maximize its research potential. Our vision is to become the trusted
            funding partner for institutions worldwide, empowering the next generation of discoveries.
          </p>
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
        </div>

        <Card>
          <h3 className="text-xl font-semibold text-text">About the Founder</h3>
          <p className="mt-3 text-body">
            As a high school student deeply involved in academic research at the University of
            Washington, I saw first-hand the challenges faculty face in securing funding.
            Professors and PhD students spoke often about the inefficiency of grant discovery.
            That perspective — combined with my passion for AI — led me to create {BRAND}.
          </p>
          <p className="mt-3 text-body">
            By listening to researchers’ needs and working alongside them, I’ve built {BRAND} to
            serve the academic community with the tools it deserves.
          </p>
          <p className="mt-6 text-text font-medium">✨ {BRAND}: Where universities meet opportunity.</p>
        </Card>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-mint/40 bg-white/5 p-6 md:flex-row">
          <div>
            <h3 className="text-xl font-semibold text-text">Ready to see it in action?</h3>
            <p className="mt-1 text-body">Book a 15-minute walkthrough tailored to your research office.</p>
          </div>
          <div className="flex gap-3">
            <a href="/contact" className="rounded-3xl bg-mint px-6 py-3 font-semibold text-navy hover:opacity-90">
              Book a Demo
            </a>
            <a href="/features" className="rounded-3xl border border-mint px-6 py-3 font-semibold text-text hover:bg-white/5">
              See How It Works
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- lightweight UI helpers (no extra imports) ---------- */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft ring-1 ring-white/10">
      {children}
    </div>
  );
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-body">{children}</p>
    </div>
  );
}

function Value({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-mint font-semibold">{title}</div>
      <p className="mt-2 text-body">{children}</p>
    </div>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-body italic">
      {children}
    </blockquote>
  );
}
