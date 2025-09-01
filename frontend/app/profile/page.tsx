'use client'

import { useEffect, useMemo, useState } from 'react'
import SidebarShell from '@/components/SidebarShell'
import { useUser } from '@clerk/nextjs'

const DEPARTMENTS = [
  'Engineering','Medicine','Arts & Sciences','Public Health','Education',
  'Computer Science','Biology','Chemistry','Physics','Business','Law','Other',
]
const ROLES = ['Faculty','Postdoc','Research Staff','Graduate Student','Admin','Other'] as const
const FUNDING_CATEGORIES = ['Research','Equipment/Infrastructure','Training/Education','Travel/Collaboration'] as const
const SOURCES = ['NSF','NIH','Horizon Europe','Foundations','Other'] as const
const FREQ = ['Real-time','Daily Digest','Weekly Digest'] as const
const METHODS = ['Email','In-App','Both'] as const

type Profile = {
  department?: string
  role?: string
  researchKeywords?: string
  fundingPreferences?: string[] // names from FUNDING_CATEGORIES
  preferredSources?: string[]   // names from SOURCES
  alertFrequency?: string
  notificationMethod?: string
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const initial = useMemo<Profile>(() => {
    const raw = (user?.unsafeMetadata as any)?.profile
    return (raw && typeof raw === 'object') ? raw as Profile : {}
  }, [user])

  const [form, setForm] = useState<Profile>(initial)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  useEffect(() => { setForm(initial) }, [initial])

  function toggleArray(field: 'fundingPreferences'|'preferredSources', val: string) {
    setForm((f) => {
      const set = new Set(f[field] || [])
      set.has(val) ? set.delete(val) : set.add(val)
      return { ...f, [field]: Array.from(set) }
    })
  }

  async function onSave() {
    if (!user) return
    setSaving(true); setSavedMsg(null)
    try {
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          profile: form,
        },
      })
      setSavedMsg('Saved!')
    } finally {
      setSaving(false)
      setTimeout(() => setSavedMsg(null), 2000)
    }
  }

  return (
    <SidebarShell>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Profile</h1>

      {!isLoaded ? (
        <div>Loading…</div>
      ) : (
        <div className="grid gap-6">
          {/* Department */}
          <div className="card">
            <label className="mb-2 block text-sm font-medium">Department / School</label>
            <select
              className="input"
              value={form.department || ''}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="" disabled>Select your department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Role */}
          <div className="card">
            <label className="mb-2 block text-sm font-medium">Role</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={[
                    'rounded-2xl px-3 py-2 text-sm ring-1 transition',
                    form.role === r ? 'bg-mint text-navy ring-mint/50' : 'bg-white/5 text-text ring-white/10 hover:bg-white/10',
                  ].join(' ')}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Research keywords */}
          <div className="card">
            <label className="mb-2 block text-sm font-medium">Research Focus Keywords</label>
            <textarea
              className="input min-h-[100px]"
              placeholder='e.g., "AI in Healthcare, Climate Modeling, Materials Informatics"'
              value={form.researchKeywords || ''}
              onChange={(e) => setForm({ ...form, researchKeywords: e.target.value })}
            />
            <p className="mt-2 text-xs opacity-70">Comma-separated works well.</p>
          </div>

          {/* Funding preferences */}
          <div className="card">
            <label className="mb-2 block text-sm font-medium">Funding Preferences</label>
            <div className="flex flex-wrap gap-2">
              {FUNDING_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleArray('fundingPreferences', c)}
                  className={[
                    'rounded-2xl px-3 py-2 text-sm ring-1 transition',
                    (form.fundingPreferences || []).includes(c)
                      ? 'bg-mint text-navy ring-mint/50'
                      : 'bg-white/5 text-text ring-white/10 hover:bg-white/10',
                  ].join(' ')}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred sources */}
          <div className="card">
            <label className="mb-2 block text-sm font-medium">Preferred Funding Sources</label>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleArray('preferredSources', s)}
                  className={[
                    'rounded-2xl px-3 py-2 text-sm ring-1 transition',
                    (form.preferredSources || []).includes(s)
                      ? 'bg-mint text-navy ring-mint/50'
                      : 'bg-white/5 text-text ring-white/10 hover:bg-white/10',
                  ].join(' ')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <label className="mb-2 block text-sm font-medium">Notification Settings</label>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-sm mb-1">Frequency</div>
                <select
                  className="input"
                  value={form.alertFrequency || ''}
                  onChange={(e) => setForm({ ...form, alertFrequency: e.target.value })}
                >
                  <option value="" disabled>Select frequency</option>
                  {FREQ.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <div className="text-sm mb-1">Method</div>
                <select
                  className="input"
                  value={form.notificationMethod || ''}
                  onChange={(e) => setForm({ ...form, notificationMethod: e.target.value })}
                >
                  <option value="" disabled>Select method</option>
                  {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn" onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            {savedMsg && <span className="text-sm opacity-80">{savedMsg}</span>}
          </div>
        </div>
      )}
    </SidebarShell>
  )
}
