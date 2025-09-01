'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/nextjs'
import AppShell from '@/components/AppShell'

const API =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'

type GrantItem = {
  id: string
  title: string
  summary?: string
  deadline?: string
  match?: number
  url?: string
}

export default function Dashboard() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<GrantItem[]>([])
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()
  const { user } = useUser()

  async function search() {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await axios.get(`${API}/grants`, {
        params: { q },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setItems(Array.isArray(res.data?.items) ? res.data.items : [])
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Discover New Grants</h1>

          {/* Optional hint based on profile keywords if present */}
          {user?.unsafeMetadata?.profile ? (
            <p className="mt-1 text-sm opacity-70">
              Tailoring results for{' '}
              <span className="font-medium">
                {(user.unsafeMetadata as any).profile.keywords ?? 'your profile'}
              </span>
              .
            </p>
          ) : null}
        </header>

        {/* Search + Filter row */}
        <div className="mb-6 flex gap-2">
          <input
            className="input flex-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by keywords or paste a research question…"
          />
          <button className="btn" onClick={search} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button className="btn border border-white/20 bg-transparent">
            Filter
          </button>
        </div>

        {/* Results */}
        <div className="grid gap-4">
          {items.map((g) => (
            <div key={g.id} className="card">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{g.title}</h3>
                  {g.summary ? (
                    <p className="mt-1 opacity-80">{g.summary}</p>
                  ) : null}
                  <div className="mt-2 text-sm opacity-70">
                    {g.deadline ? (
                      <span>
                        Deadline:{' '}
                        {new Date(g.deadline).toLocaleDateString()}
                      </span>
                    ) : (
                      <span>No deadline listed</span>
                    )}
                    {typeof g.match === 'number' ? (
                      <span className="ml-3">Match: {g.match}%</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex gap-2 md:ml-4">
                  {/* Save is a placeholder for now */}
                  <button className="btn border border-white/20 bg-transparent">
                    Save
                  </button>
                  <a
                    className="btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={g.url || '#'}
                  >
                    View Source
                  </a>
                  <Link className="btn" href={`/grants/${g.id}`}>
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {!loading && items.length === 0 ? (
            <p className="opacity-70">No results yet. Try a search above.</p>
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}
