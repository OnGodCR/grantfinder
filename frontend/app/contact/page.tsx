import ContactForm from '@/components/ContactForm'

export const metadata = {
  title: 'Contact Us – Grantlytics AI',
  description:
    'Get in touch with the Grantlytics team for general questions, support, partnerships, or founder contact.',
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 pb-24">
      {/* Hero */}
      <section className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-white/5 px-4 py-1 text-sm text-body">
          Contact
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight">
          Contact Grantalytic
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-body">
          We’d love to hear from you. Whether you’re a professor, research administrator,
          or part of a grants office, our team is here to help.
        </p>
      </section>

      {/* Quick contacts */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <ContactCard title="General Inquiries" email="info@grantalytic.com" />
        <ContactCard title="Support" email="support@grantalytic.com" />
        <ContactCard title="Pilots & Partnerships" email="sales@grantalytic.com" />
        <ContactCard title="Founder" email="angad@grantalytic.com" />
      </section>

      {/* Form + Calendly sidebar (client component) */}
      <ContactForm calendlyUrl="https://calendly.com/angad-kochar" />
    </div>
  )
}

/* simple server-side card (no state) */
function ContactCard({ title, email }: { title: string; email: string }) {
  return (
    <div className="text-left rounded-3xl border bg-white/5 p-5 ring-1 border-white/10 ring-white/10">
      <div className="text-mint font-semibold">{title}</div>
      <a href={`mailto:${email}`} className="mt-1 block text-body hover:underline">
        {email}
      </a>
    </div>
  )
}
