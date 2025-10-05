'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { fetchGrantsAuto } from '@/lib/grants'

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
        
        // Use the same API function as other pages
        const response = await fetchGrantsAuto('', token || undefined)
        
        if (response.ok && response.body) {
          const grantsData = response.body.items || response.body.grants || []
          const grant = grantsData.find((item: any) => item.id === params.id)
          
          if (grant) {
            setG(grant)
          } else {
            setError('Grant not found')
          }
        } else {
          setError(response.error || 'Failed to load grant')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load grant')
      } finally {
        setLoading(false)
      }
    })()
  }, [params.id, getToken])

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
        <p className="text-slate-300 text-lg">Loading grant details...</p>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Error Loading Grant</h1>
        <p className="text-red-300">{error}</p>
      </div>
    </div>
  )
  
  if (!g) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-slate-400 text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">Grant Not Found</h1>
        <p className="text-slate-300">The grant you're looking for doesn't exist or has been removed.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700/50">
          <h1 className="text-3xl font-bold text-white mb-4">{g.title}</h1>
          <div className="text-slate-300 text-lg leading-relaxed mb-6">
            {g.summary ? g.summary : g.description}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {g.deadline && (
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Deadline</h3>
                <p className="text-white text-lg font-semibold">{new Date(g.deadline).toLocaleDateString()}</p>
              </div>
            )}
            {(g.fundingMin || g.fundingMax) && (
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Funding</h3>
                <p className="text-white text-lg font-semibold">
                  {g.fundingMin ? `${g.currency || 'USD'}${g.fundingMin.toLocaleString()}` : '—'} 
                  {g.fundingMin && g.fundingMax ? ' - ' : ''}
                  {g.fundingMax ? `${g.currency || 'USD'}${g.fundingMax.toLocaleString()}` : ''}
                </p>
              </div>
            )}
            {g.agency && (
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Agency</h3>
                <p className="text-white text-lg font-semibold">{g.agency}</p>
              </div>
            )}
            {g.matchScore && (
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Match Score</h3>
                <p className="text-teal-400 text-lg font-semibold">{g.matchScore}%</p>
              </div>
            )}
          </div>
          
          {g.url && (
            <div className="flex gap-4">
              <a 
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                target="_blank" 
                href={g.url}
                rel="noopener noreferrer"
              >
                View Original Grant
              </a>
              <button className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all duration-200">
                Bookmark Grant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
