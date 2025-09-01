'use client'

import { useState } from 'react'

export const metadata = {
  title: 'Contact Us – Grantlytics AI',
  description:
    'Get in touch with the Grantlytics team for general questions, support, partnerships, or founder contact.',
}

export default function ContactPage() {
  const [topic, setTopic] = useState<'general' | 'support' | 'sales' | 'founder'>('general')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')

  const EMAILS: Record<typeof topic, string> = {
    general: 'info@grantalytic.com',
    support: 'support@grantalytic.com',
    sales: 'sales@grantalytic.com',
    founder: 'angad@grantalytic.com',
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const to = EMAILS[topic]
    const subject = encodeURIComponent(`Website contact — ${capitalize(topic)}`)
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        role ? `Role: ${role}` : '',
        '',
        message || '(no message provided)',
      ]
        .filter(Boolean)
        .join('\n')
    )
    // Mailto keeps this page static and works without a backend:
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
  }

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

      {/* Contact cards */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <ContactCard
          title="General Inquiries"
          email="info@grantalytic.com"
          active={topic === 'general'}
          onSelect={() => setTopic('general')}
        />
        <ContactCard
          title="Support"
          email="support@grantalytic.com"
          active={topic === 'support'}
          onSelect={() => setTopic('support')}
        />
        <ContactCard
          title="Pilots & Partnerships"
          email="sales@grantalytic.com"
          active={topic === 'sales'}
          onSelect={() => setTopic('sales')}
        />
        <ContactCard
          title="Founder"
          email="angad@grantalytic.com"
          active={topic === 'founder'}
          onSelect={() => setTopic('founder')}
        />
      </section>

      {/* Form + Sidebar */}
      <section className="mt-12 grid gap-8 md:grid-cols-[minmax(0,1fr)_360px]">
        {/* Form */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft ring-1 ring-white/10">
          <h2 className="text-2xl font-semibold text-text">Send a message</h2>
          <p className="mt-2 text-body text-sm">
            Your message will open in your email client addressed to{' '}
            <span className="font-medium">{EMAILS[topic]}</span>.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={onSubmit} noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Name"
                value={name}
                onChange={setName}
                placeholder="Full name"
                required
              />
              <Input
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                placeholder="you@university.edu"
                required
              />
            </div>

            <Input
              label="Role (optional)"
              value={role}
              onChange={setRole}
              placeholder="Student, PI, Grants Manager, etc."
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-text">Topic</label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <Toggle value="general" label="General" active={topic === 'general'} onClick={() => setTopic('general')} />
                <Toggle value="support" label="Support" active={topic === 'support'} onClick={() => setTopic('support')} />
                <Toggle value="sales" label="Pilots & Partnerships" active={topic === 'sales'} onClick={() => setTopic('sales')} />
                <Toggle value="founder" label="Founder" active={topic === 'founder'} onClick={() => setTopic('founder')} />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text">Message</label>
              <textarea
                className="w-full rounded-xl bg-white/5 p-3 outline-none ring-1 ring-white/10 focus:ring-mint/50"
                rows={6}
                placeholder="How can we help?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-body">
                📍 Based in Seattle, WA. Serving universities everywhere.
                <br />
                ⏱ Response time: within 1 business day.
              </p>
              <button
                type="submit"
                className="rounded-3xl bg-mint px-6 py-3 font-semibold text-navy hover:opacity-90"
              >
                Send Email
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10">
          <h3 className="text-lg font-semibold text-text">Prefer to meet</h3>
          <p className="mt-2 text-body text-sm">
            Book a short call and we’ll walk through the workflow that fits your team.
          </p>
          <a
            href="https://calendly.com/angad-kochar" // TODO: replace with your exact Calendly link
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-3xl border border-mint bg-mint px-6 py-3 font-semibold text-navy hover:opacity-90"
          >
            Book a Demo
          </a>

          <div className="mt-8 space-y-2 text-sm">
            <h4 className="font-medium text-text">Direct emails</h4>
            <EmailLink label="General" email="info@grantalytic.com" />
            <EmailLink label="Support" email="support@grantalytic.com" />
            <EmailLink label="Pilots & Partnerships" email="sales@grantalytic.com" />
            <EmailLink label="Founder" email="angad@grantalytic.com" />
          </div>
        </aside>
      </section>
    </div>
  )
}

/* ---------- Little UI helpers (no extra deps) ---------- */

function ContactCard({
  title,
  email,
  active,
  onSelect,
}: {
  title: string
  email: string
  active?: boolean
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'text-left rounded-3xl border bg-white/5 p-5 ring-1 transition',
        active ? 'border-mint/40 ring-mint/40' : 'border-white/10 ring-white/10 hover:bg-white/7',
      ].join(' ')}
    >
      <div className="text-mint font-semibold">{title}</div>
      <a href={`mailto:${email}`} className="mt-1 block text-body hover:underline">
        {email}
      </a>
    </button>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text">{label}</label>
      <input
        type={type}
        className="w-full rounded-xl bg-white/5 p-3 outline-none ring-1 ring-white/10 focus:ring-mint/50"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  )
}

function Toggle({
  value,
  label,
  active,
  onClick,
}: {
  value: string
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-2xl px-3 py-2 text-sm ring-1 transition',
        active ? 'bg-mint text-navy ring-mint/50' : 'bg-white/5 text-text ring-white/10 hover:bg-white/10',
      ].join(' ')}
      aria-pressed={active}
      aria-label={label}
    >
      {label}
    </button>
  )
}

function EmailLink({ label, email }: { label: string; email: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body">{label}</span>
      <a href={`mailto:${email}`} className="text-mint hover:underline">
        {email}
      </a>
    </div>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
