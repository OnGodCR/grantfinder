'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'

export default function GrantDetail() {
  const params = useParams()
  const [g, setG] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuth()

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const token = await getToken()
        
        // Since we don't have a GET endpoint for individual grants,
        // we'll fetch all grants and find the one with matching ID
        const response = await fetch(`${API}/grants`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ q: '', limit: 1000 }), // Get many grants to find the one we need
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        const grant = data.items?.find((item: any) => item.id === params.id)
        
        if (grant) {
          setG(grant)
        } else {
          setError('Grant not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load grant')
      } finally {
        setLoading(false)
      }
    })()
  }, [params.id, getToken])

  if (loading) return <div className="max-w-4xl mx-auto mt-10">Loading…</div>
  if (error) return <div className="max-w-4xl mx-auto mt-10 text-red-600">Error: {error}</div>
  if (!g) return <div className="max-w-4xl mx-auto mt-10">Grant not found</div>

  return (
    <main className="max-w-4xl mx-auto mt-10 card">
      <h1 className="text-2xl font-bold mb-2">{g.title}</h1>
      {g.summary ? <p className="opacity-90">{g.summary}</p> : <p>{g.description}</p>}
      <div className="text-sm opacity-70 mt-4">
        {g.deadline ? (<div>Deadline: {new Date(g.deadline).toLocaleDateString()}</div>) : null}
        {(g.fundingMin || g.fundingMax) ? <div>Funding: {g.fundingMin || '—'} - {g.fundingMax || '—'} {g.currency || 'USD'}</div> : null}
      </div>
      <div className="mt-4">
        <a className="btn" target="_blank" href={g.url || '#'}>Open Source Page</a>
      </div>
    </main>
  )
}
