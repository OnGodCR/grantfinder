'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs'

/** ---------- Options ---------- */

const DEPARTMENTS = [
  'Engineering', 'Medicine', 'Arts & Sciences', 'Public Health', 'Education',
  'Computer Science', 'Biology', 'Chemistry', 'Physics', 'Business', 'Law', 'Other',
]

const ROLES = ['Faculty', 'Postdoc', 'Research Staff', 'Graduate Student', 'Admin', 'Other'] as const

const TAXONOMY_TAGS = [
  'STEM', 'AI/ML', 'Biomed', 'Public Health', 'Education', 'Policy', 'Climate', 'Energy',
  'Humanities', 'Social Science', 'Neuroscience', 'Data Science', 'Robotics', 'Materials',
]

const FUNDING_CATEGORIES = [
  'Research', 'Equipment/Infrastructure', 'Training/Education', 'Travel/Collaboration',
] as const

const PREF_SOURCES = ['NSF', 'NIH', 'Horizon Europe', 'Foundations', 'Other'] as const

const FUNDING_LEVELS = ['< $50K', '$50K–$250K', '$250K–$1M', '> $1M'] as const

const DURATIONS = ['Short (<1 year)', 'Medium (1–3 years)', 'Long (>3 years)'] as const

const ALERT_FREQ = ['Real-time', 'Daily digest', 'Weekly digest'] as const

const NOTIFY_METHOD = ['Email', 'In-app only', 'Both'] as const

/** ---------- Types ---------- */

type Role = typeof ROLES[number]
type FundingCategory = typeof FUNDING_CATEGORIES[number]
type PrefSource = typeof PREF_SOURCES[number]
type FundingLevel = typeof FUNDING_LEVELS[number]
type DurationPref = typeof DURATIONS[number]
type AlertFreq = typeof ALERT_FREQ[number]
type NotifyPref = typeof NOTIFY_METHOD[number]

type ProfileData = {
  department?: string
  role?: Role

  researchAreas?: string[]
  keywords?: string[]
  fundingCategories?: FundingCategory[]

  preferredSources?: PrefSource[]
  fundingLevel?: FundingLevel
  duration?: DurationPref
  deadlineFirst?: boolean

  alertFrequency?: AlertFreq
  notificationMethod?: NotifyPref
}

/** ---------- Page ---------- */

export default function OnboardingPage() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <Wizard />
      </SignedIn>
    </>
  )
}

/** ---------- Wizard ---------- */

function Wizard() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [data, setData] = useState<ProfileData>({
    department: '',
    role: undefined,

    researchAreas: [],
    keywords: [],
    fundingCategories: [],

    preferredSources: [],
    fundingLevel: undefined,
    duration: undefined,
    deadlineFirst: true,

    alertFrequency: 'Weekly digest',
    notificationMethod: 'Email',
  })

  // If already completed, go straight to dashboard
  useEffect(() => {
    if (!isLoaded || !user) return
    const publicFlag = Boolean((user.publicMetadata as any)?.hasOnboarded)
    const unsafeFlag = Boolean((user.unsafeMetadata as any)?.hasOnboarded)
    if (publicFlag || unsafeFlag) {
      router.replace('/dashboard')
    }
  }, [isLoaded, user, router])

  const totalSteps = 4
  const pct = useMemo(() => Math.round((step / totalSteps) * 100), [step])

  function next() { setStep(s => Math.min(totalSteps, s + 1)) }
  function back() { setStep(s => Math.max(1, s - 1)) }

  async function skip() {
    if (!user) return
    setSaving(true)
    try {
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          hasOnboarded: true,
        },
      })
      router.replace('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  async function finish() {
    if (!user) return
    setSaving(true)
    try {
      // Save profile + flag to Clerk (client-safe field)
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          profile: data,
          hasOnboarded: true,
        },
      })

      // Optional: ping your backend for vector creation
      const url = process.env.NEXT_PUBLIC_PROFILE_WEBHOOK_URL || process.env.PROFILE_WEBHOOK_URL
      if (url) {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, profile: data }),
        }).catch(() => {})
      }

      router.replace('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-16">
      {/* Header / Progress */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Set up your research profile</h1>
        <button
          disabled={saving}
          onClick={skip}
          className="rounded-3xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          {saving ? 'Saving…' : 'Skip for now'}
        </button>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-mint transition-all"
          style={{ width: `${pct}%` }}
          aria-label={`Progress ${pct}%`}
        />
      </div>
      <p className="mt-2 text-sm text-body">{step} of {totalSteps}</p>

      {/* Steps */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10">
        {step === 1 && (
          <SectionOne data={data} onChange={setData} />
        )}
        {step === 2 && (
          <SectionTwo data={data} onChange={setData} />
        )}
        {step === 3 && (
          <SectionThree data={data} onChange={setData} />
        )}
        {step === 4 && (
          <SectionFour data={data} onChange={setData} />
        )}

        {/* Nav buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 1 || saving}
            className="rounded-3xl border border-white/10 px-5 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            Back
          </button>
          {step < totalSteps ? (
            <button
              onClick={next}
              disabled={saving}
              className="rounded-3xl bg-mint px-6 py-2.5 font-semibold text-navy hover:opacity-90"
            >
              Next
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              className="rounded-3xl bg-mint px-6 py-2.5 font-semibold text-navy hover:opacity-90"
            >
              {saving ? 'Saving…' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** ---------- Step content ---------- */

function SectionOne({
  data, onChange,
}: { data: ProfileData; onChange: (p: ProfileData | ((p: ProfileData) => ProfileData)) => void }) {
  return (
    <div className="grid gap-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Department / School Affiliation</label>
        <select
          className="w-full rounded-xl bg-white/5 p-3 outline-none ring-1 ring-white/10"
          value={data.department || ''}
          onChange={(e) => onChange({ ...data, department: e.target.value })}
        >
          <option value="" disabled>Select your department</option>
          {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
        </select>
        <p className="mt-1 text-xs text-body">Helps match discipline-specific grants.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Position / Role</label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(r => (
            <Toggle
              key={r}
              label={r}
              active={data.role === r}
              onClick={() => onChange({ ...data, role: r })}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-body">Some grants are restricted by career stage.</p>
      </div>
    </div>
  )
}

function SectionTwo({
  data, onChange,
}: { data: ProfileData; onChange: (p: ProfileData | ((p: ProfileData) => ProfileData)) => void }) {
  const [areaInput, setAreaInput] = useState('')

  function addArea() {
    const v = areaInput.trim()
    if (!v) return
    const next = Array.from(new Set([...(data.researchAreas || []), v]))
    onChange({ ...data, researchAreas: next })
    setAreaInput('')
  }

  function removeArea(v: string) {
    onChange({ ...data, researchAreas: (data.researchAreas || []).filter(x => x !== v) })
  }

  function toggleKeyword(tag: string) {
    const set = new Set(data.keywords || [])
    set.has(tag) ? set.delete(tag) : set.add(tag)
    onChange({ ...data, keywords: Array.from(set) })
  }

  function toggleCategory(cat: FundingCategory) {
    const set = new Set(data.fundingCategories || [])
    set.has(cat) ? set.delete(cat) : set.add(cat)
    onChange({ ...data, fundingCategories: Array.from(set) })
  }

  return (
    <div className="grid gap-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Primary research areas</label>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl bg-white/5 p-3 outline-none ring-1 ring-white/10"
            placeholder='e.g., "AI in Healthcare", "Climate Modeling"'
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' ? (e.preventDefault(), addArea()) : undefined}
          />
          <button onClick={addArea} className="rounded-xl bg-mint px-4 font-semibold text-navy hover:opacity-90">Add</button>
        </div>
        {!!(data.researchAreas && data.researchAreas.length) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.researchAreas!.map(v => (
              <Chip key={v} label={v} onRemove={() => removeArea(v)} />
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-body">We’ll use these to create semantic embeddings for matching.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Select relevant keywords</label>
        <div className="flex flex-wrap gap-2">
          {TAXONOMY_TAGS.map(tag => (
            <Toggle
              key={tag}
              label={tag}
              active={(data.keywords || []).includes(tag)}
              onClick={() => toggleKeyword(tag)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Funding categories of interest</label>
        <div className="flex flex-wrap gap-2">
          {FUNDING_CATEGORIES.map(cat => (
            <Toggle
              key={cat}
              label={cat}
              active={(data.fundingCategories || []).includes(cat)}
              onClick={() => toggleCategory(cat)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionThree({
  data, onChange,
}: { data: ProfileData; onChange: (p: ProfileData | ((p: ProfileData) => ProfileData)) => void }) {
  function togglePref(src: PrefSource) {
    const set = new Set(data.preferredSources || [])
    set.has(src) ? set.delete(src) : set.add(src)
    onChange({ ...data, preferredSources: Array.from(set) })
  }

  return (
    <div className="grid gap-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Preferred funding sources</label>
        <div className="flex flex-wrap gap-2">
          {PREF_SOURCES.map(src => (
            <Toggle
              key={src}
              label={src}
              active={(data.preferredSources || []).includes(src)}
              onClick={() => togglePref(src)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Funding level of interest</label>
        <div className="flex flex-wrap gap-2">
          {FUNDING_LEVELS.map(lvl => (
            <Toggle
              key={lvl}
              label={lvl}
              active={data.fundingLevel === lvl}
              onClick={() => onChange({ ...data, fundingLevel: lvl })}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Typical project duration</label>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map(d => (
            <Toggle
              key={d}
              label={d}
              active={data.duration === d}
              onClick={() => onChange({ ...data, duration: d })}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Deadline sensitivity</label>
        <div className="flex items-center gap-3">
          <span className="text-sm text-body">Show near-term deadlines first?</span>
          <Switch
            checked={!!data.deadlineFirst}
            onChange={(v) => onChange({ ...data, deadlineFirst: v })}
          />
        </div>
      </div>
    </div>
  )
}

function SectionFour({
  data, onChange,
}: { data: ProfileData; onChange: (p: ProfileData | ((p: ProfileData) => ProfileData)) => void }) {
  return (
    <div className="grid gap-6">
      <div>
        <label className="mb-2 block text-sm font-medium">How often do you want updates?</label>
        <div className="flex flex-wrap gap-2">
          {ALERT_FREQ.map(f => (
            <Toggle
              key={f}
              label={f}
              active={data.alertFrequency === f}
              onClick={() => onChange({ ...data, alertFrequency: f })}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Preferred notification method</label>
        <div className="flex flex-wrap gap-2">
          {NOTIFY_METHOD.map(m => (
            <Toggle
              key={m}
              label={m}
              active={data.notificationMethod === m}
              onClick={() => onChange({ ...data, notificationMethod: m })}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-body">
        You can change any of these later in Settings. We use this profile to personalize recommendations and alerts.
      </div>
    </div>
  )
}

/** ---------- tiny UI helpers ---------- */

function Toggle({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
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

function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1 text-sm">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="rounded-full px-2 py-0.5 text-body hover:bg-white/10" aria-label={`Remove ${label}`}>×</button>
      )}
    </span>
  )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 items-center rounded-full transition',
        checked ? 'bg-mint' : 'bg-white/10',
      ].join(' ')}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={[
          'inline-block h-5 w-5 transform rounded-full bg-white transition',
          checked ? 'translate-x-5' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}
