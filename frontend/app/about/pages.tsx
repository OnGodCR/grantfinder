export const metadata = {
  title: 'About Us – NovaGrant AI',
  description:
    'Our mission, story, and values—how NovaGrant AI helps universities unlock more research funding with less effort.',
};

const BRAND = 'NovaGrant AI';

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

      {/* Mission + Story */}
      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-semibold text-text">Our Mission</h2>
          <p className="mt-3 text-body">
            At {BRAND}, our mission is simple: to help universities unlock more research funding
            with less effort. Faculty and administrators should be driving discovery—not digging
            through scattered databases.
          </p>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-text">Our Story</h2>
          <p className="mt-3 text-body">
            {BRAND} was born out of research itself. While working as a Youth Researcher at the
            University of Washington, I collaborated with PhD students and professors on real
            projects. One theme kept surfacing:
          </p>
          <Quote>
            “Finding the right grant is hard. Opportunities are fragmented, deadlines slip by, and
            research office
