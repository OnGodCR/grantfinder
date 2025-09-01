'use client'

import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'

export default function Dashboard() {
  const router = useRouter()
  const { getToken } = useAuth()
  const { isLoaded, isSignedIn, user } = useUser()

  const hasOnboarded = useMemo(
    () => Boolean((user?.unsafeMetadata as any)?.hasOnboarded),
    [user]
  )

  const [q, setQ] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    } catch (e) {
      setError('Unable to load grants. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Gate access to this page on the client (keeps middleware minimal & safe)
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }
    if (!hasOnboarded) {
      router.replace('/onboarding')
      return
    }
    // Initial search when user is permitted to view dashboard
    search('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, hasOnboarded])

  // While auth loads / redirecting, render a light placeholder
  if (!isLoaded || !isSignedIn || !hasOnboarded) {
    return (
      <main className="max-w-5xl mx-auto mt-10">
        <div className="card">Loading…</div>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto mt-10">
      <div className="card mb-6">
        <h2 className="text-2xl font-semibold mb-2">Find Grants</h2>

        {/* Optional: show a tiny hint from the user's profile if present */}
        {user?.unsafeMetadata?.profile && (
          <p className="text-sm opacity-70 mb-3">
            Tailoring results for{' '}
            <span className="font-medium">
              {Array.isArray((user.unsafeMetadata as any).profile?.researchAreas) &&
              (user.unsafeMetadata as any).profile.researchAreas.length
                ? (user.unsafeMetadata as any).profile.researchAreas.join(', ')
                : 'your research profile'}
            </span>
            .
          </p>
        )}

        <div className="flex gap-2">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Search by keywords or paste a research question..."
          />
          <button className="btn" onClick={() => search()}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
      </div>

      <div className="grid gap-4">
        {items.map((g) => (
          <div key={g.id} className="card">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">{g.title}</h3>
                <p className="opacity-80">{g.summary}</p>
                <div className="text-sm opacity-70 mt-2">
                  {g.deadline ? (
                    <span>Deadline: {new Date(g.deadline).toLocaleDateString()}</span>
                  ) : (
                    <span>No deadline listed</span>
                  )}
                  {typeof g.match === 'number' ? (
                    <span className="ml-3">Match: {g.match}%</span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <a className="btn" target="_blank" href={g.url || '#'} rel="noreferrer">
                  View Source
                </a>
                <Link className="btn" href={`/grants/${g.id}`}>
                  Details
                </Link>
              </div>
            </div>
          </div>
        ))}

        {!loading && !error && items.length === 0 && (
          <div className="card opacity-80">No results yet — try a search.</div>
        )}
      </div>
    </main>
  )
}
