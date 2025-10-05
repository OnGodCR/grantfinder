import ContactForm from '@/components/ContactForm' // if this fails, use: ../../components/ContactForm

export const metadata = {
  title: 'Contact Us – Grantalytic AI',
  description:
    'Get in touch with the Grantalytic team for general questions, support, partnerships, or founder contact.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Hero */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-6 py-3 text-sm font-semibold text-teal-400 mb-8">
            📞 Contact
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white mb-6">
            Contact
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"> Grantalytic</span>
          </h1>
          <p className="mx-auto max-w-4xl text-xl text-slate-300 leading-relaxed">
            We'd love to hear from you. Whether you're a professor, research administrator,
            or part of a grants office, our team is here to help.
          </p>
        </section>

        {/* Quick contacts */}
        <section className="mb-20 grid gap-8 md:grid-cols-2">
          <ContactCard title="General Inquiries" email="info@grantalytic.com" icon="📧" />
          <ContactCard title="Support" email="support@grantalytic.com" icon="🛠️" />
          <ContactCard title="Pilots & Partnerships" email="sales@grantalytic.com" icon="🤝" />
          <ContactCard title="Founder" email="angad@grantalytic.com" icon="👨‍💼" />
        </section>

        {/* Form + Calendly sidebar (client component) */}
        <ContactForm calendlyUrl="https://calendly.com/angad-kochar" />
      </div>
    </div>
  )
}

/* simple server-side card (no state) */
function ContactCard({ title, email, icon }: { title: string; email: string; icon?: string }) {
  return (
    <div className="group rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="text-teal-400 font-bold text-lg">{title}</div>
      </div>
      <a href={`mailto:${email}`} className="block text-slate-300 hover:text-teal-400 transition-colors text-lg">
        {email}
      </a>
    </div>
  )
}
