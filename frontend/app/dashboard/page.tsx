'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

type Grant = {
  id: string
  title: string
  summary?: string | null
  url?: string | null
  deadline?: string | null
  source?: string | null
  match?: number | null // your API can send a computed score; falls back to 0
}

const API_BASE =
  (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '') || 'http://localhost:4000/api'

export default function Dashboard() {
  const { getToken } = useAuth()

  const [q, setQ] = useState('')
  const [items, setItems] = useState<Grant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = useMemo(() => {
    const base = API_BASE
    const param = q ? `?q=${encodeURIComponent(q)}` : ''
    return `${base}/grants${param}`
  }, [q])

  async function fetchGrants() {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await fetch(apiUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      })
      if (!res.ok) {
        // Try to read error message from API if present
        let msg = `API error ${res.status}`
        try {
          const body = await res.json()
          if (body?.error) msg = String(body.error)
        } catch {
          /* ignore */
        }
        throw new Error(msg)
      }
      const data = (await res.json()) as { items?: Grant[] }
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch grants')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchGrants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Press Enter to search
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') fetchGrants()
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pt-10 pb-16">
      <div className="card mb-6">
        <h2 className="text-2xl font-semibold mb-2">Discover New Grants</h2>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search by keywords or paste a research question…"
          />
          <button className="btn" onClick={fetchGrants} disabled={loading}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {error ? (
          <p className="mt-3 text-red-400 text-sm">Error: {error}</p>
        ) : null}
      </div>

      {/* Results */}
      <div className="grid gap-4">
        {loading && items.length === 0 ? (
          <div className="card">Loading grants…</div>
        ) : null}

        {!loading && items.length === 0 ? (
          <div className="card text-sm opacity-80">
            No grants found{q ? ` for “${q}”` : ''}. Try a broader query like “climate” or
            “education”.
          </div>
        ) : null}

        {items.map((g) => (
          <GrantRow key={g.id} g={g} />
        ))}
      </div>
    </main>
  )
}

function GrantRow({ g }: { g: Grant }) {
  const match = typeof g.match === 'number' ? g.match : 0
  const deadline =
    g.deadline ? new Date(g.deadline).toLocaleDateString() : 'No deadline listed'

  return (
    <div className="card">
      <div className="flex justify-between gap-6">
        <div>
          <h3 className="text-xl font-semibold">{g.title}</h3>
          {g.summary ? (
            <p className="opacity-80">{g.summary}</p>
          ) : null}
          <div className="text-sm opacity-70 mt-2">
            <span>Deadline: {deadline}</span>
            <span className="ml-3">Match: {match}%</span>
            {g.source ? <span className="ml-3">Source: {g.source}</span> : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <a className="btn" target="_blank" rel="noreferrer" href={g.url || '#'}>
            View Source
          </a>
          <Link className="btn" href={`/grants/${g.id}`}>
            Details
          </Link>
        </div>
      </div>
    </div>
  )
}
