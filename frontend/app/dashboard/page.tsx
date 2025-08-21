'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'

export default function Dashboard() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<any[]>([])
  const { getToken } = useAuth()

  async function search() {
    const token = await getToken()
    const res = await axios.get(`${API}/grants`, {
      params: { q },
      headers: { Authorization: `Bearer ${token}` }
    })
    setItems(res.data.items)
  }

  useEffect(() => { search() }, [])

  return (
    <main className="max-w-5xl mx-auto mt-10">
      <div className="card mb-6">
        <h2 className="text-2xl font-semibold mb-2">Find Grants</h2>
        <div className="flex gap-2">
          <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by keywords or paste a research question..." />
          <button className="btn" onClick={search}>Search</button>
        </div>
      </div>
      <div className="grid gap-4">
        {items.map(g => (
          <div key={g.id} className="card">
            <div className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">{g.title}</h3>
                <p className="opacity-80">{g.summary}</p>
                <div className="text-sm opacity-70 mt-2">
                  {g.deadline ? (<span>Deadline: {new Date(g.deadline).toLocaleDateString()}</span>) : <span>No deadline listed</span>}
                  {typeof g.match === 'number' ? <span className="ml-3">Match: {g.match}%</span> : null}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <a className="btn" target="_blank" href={g.url || '#'}>View Source</a>
                <Link className="btn" href={`/grants/${g.id}`}>Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
