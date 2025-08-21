'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'

export default function GrantDetail() {
  const params = useParams()
  const [g, setG] = useState<any>(null)
  const { getToken } = useAuth()

  useEffect(() => {
    (async () => {
      const token = await getToken()
      const res = await axios.get(`${API}/grants/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setG(res.data)
    })()
  }, [params.id])

  if (!g) return <div className="max-w-4xl mx-auto mt-10">Loading…</div>

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
