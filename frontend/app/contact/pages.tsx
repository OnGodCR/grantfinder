export const metadata = { title: 'Contact Us – Fundora AI' };

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-bold">Book a Demo</h1>
      <p className="mt-4 text-body">Tell us a bit about your team and we’ll reach out.</p>

      <form className="mt-8 grid md:grid-cols-2 gap-4 max-w-2xl">
        <input className="rounded-xl bg-white/5 border border-white/10 p-3" placeholder="Name" />
        <input className="rounded-xl bg-white/5 border border-white/10 p-3" placeholder="Email" />
        <input className="md:col-span-2 rounded-xl bg-white/5 border border-white/10 p-3" placeholder="University / Org" />
        <textarea className="md:col-span-2 rounded-xl bg-white/5 border border-white/10 p-3 h-32" placeholder="What problems are you trying to solve?" />
        <button className="md:col-span-2 rounded-3xl bg-mint text-navy px-6 py-3 font-semibold hover:opacity-90">
          Submit
        </button>
      </form>
    </section>
  );
}
