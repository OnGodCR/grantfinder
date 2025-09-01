'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import SidebarShell from '@/components/SidebarShell'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'

type Grant = {
  id: string
  title: string
  summary: string
  deadline?: string
  match?: number
  url?: string
}

export default function DiscoverPage() {
  const { getToken } = useAuth()
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Grant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  async function search(query = q) {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await axios.get(`${API}/grants`, {
        params: { q: query },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setItems(res.data?.items ?? [])
    } catch {
      setError('Unable to load grants. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // initial load
    search('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleSave(id: string) {
    setSaved((s) => ({ ...s, [id]: !s[id] }))
    // TODO: POST to backend to persist bookmark
  }

  return (
    <SidebarShell>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Discover New Grants</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            className="input min-w-[260px] flex-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Search by keywords or paste a research question..."
          />
          <button className="btn" onClick={() => search()}>
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
            onClick={() => alert('Filters coming soon')}
          >
            Filter
          </button>
        </div>
        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
      </header>

      <section className="grid gap-4">
        {items.map((g) => (
          <div key={g.id} className="card">
            <div className="flex flex-col gap-3 md:flex-row md:justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-semibold">{g.title}</h3>
                <div className="mt-1 text-sm opacity-70">
                  {typeof g.match === 'number' && <span>Match: {g.match}%</span>}
                  {g.deadline && (
                    <span className={g.match != null ? 'ml-3' : ''}>
                      Deadline: {new Date(g.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="mt-2 opacity-80">{g.summary}</p>
              </div>
              <div className="flex gap-2 md:self-start">
                <button
                  className={['btn', saved[g.id] ? 'opacity-70' : ''].join(' ')}
                  onClick={() => toggleSave(g.id)}
                >
                  {saved[g.id] ? 'Saved' : 'Save'}
                </button>
                <a className="btn" target="_blank" href={g.url || '#'} rel="noreferrer">
                  View Details
                </a>
                <Link className="btn" href={`/grants/${g.id}`}>
                  More
                </Link>
              </div>
            </div>
          </div>
        ))}

        {!loading && !error && items.length === 0 && (
          <div className="card opacity-80">
            No matches yet. Try searching for a topic like “climate modeling” or “AI in healthcare”.
          </div>
        )}
      </section>
    </SidebarShell>
  )
}
