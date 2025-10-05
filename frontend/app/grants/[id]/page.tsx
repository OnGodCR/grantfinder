'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { fetchGrantsAuto } from '@/lib/grants'
import { Calendar, DollarSign, Building, ExternalLink, Bookmark, ArrowLeft, Clock, Award, Users, FileText, CheckCircle } from 'lucide-react'
import { addBookmark, removeBookmark, isBookmarked } from '@/lib/bookmarks'

export default function GrantDetail() {
  const params = useParams()
  const router = useRouter()
  const [g, setG] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const { getToken } = useAuth()

  useEffect(() => {
    if (g?.id) {
      setBookmarked(isBookmarked(g.id))
    }
  }, [g?.id])

  const handleBookmarkToggle = () => {
    if (bookmarked) {
      if (removeBookmark(g.id)) {
        setBookmarked(false)
      }
    } else {
      if (addBookmark(g)) {
        setBookmarked(true)
      }
    }
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'text-red-400'
    if (days <= 30) return 'text-orange-400'
    if (days <= 90) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getUrgencyBg = (days: number) => {
    if (days <= 7) return 'bg-red-500/20 border-red-500/30'
    if (days <= 30) return 'bg-orange-500/20 border-orange-500/30'
    if (days <= 90) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-green-500/20 border-green-500/30'
  }

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

  const daysUntilDeadline = g.deadline ? getDaysUntilDeadline(g.deadline) : null

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header with back button */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Grants
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              {/* Title and Actions */}
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-4xl font-bold text-white leading-tight pr-4">{g.title}</h1>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBookmarkToggle}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      bookmarked
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 border border-slate-700/50'
                    }`}
                  >
                    <Bookmark className={`w-6 h-6 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                  {g.url && (
                    <a
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-xl transition-all duration-200 border border-slate-700/50"
                    >
                      <ExternalLink className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="text-slate-300 text-lg leading-relaxed mb-8">
                {g.summary ? g.summary : g.description}
              </div>

              {/* Eligibility */}
              {g.eligibility && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-teal-400" />
                    Eligibility
                  </h3>
                  <div className="bg-slate-700/30 rounded-xl p-6">
                    <p className="text-slate-300 leading-relaxed">{g.eligibility}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {g.url && (
                  <a 
                    className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                    target="_blank" 
                    href={g.url}
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Original Grant
                  </a>
                )}
                <button 
                  onClick={handleBookmarkToggle}
                  className={`px-8 py-4 font-bold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    bookmarked
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600/50'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                  {bookmarked ? 'Bookmarked' : 'Bookmark Grant'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Match Score */}
            {g.matchScore && (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-400" />
                  Match Score
                </h3>
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-700/50"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={g.matchScore >= 80 ? 'text-emerald-500' : g.matchScore >= 60 ? 'text-blue-500' : g.matchScore >= 40 ? 'text-yellow-500' : 'text-orange-500'}
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${g.matchScore}, 100`}
                        strokeLinecap="round"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{g.matchScore}%</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">Relevance to your profile</p>
                </div>
              </div>
            )}

            {/* Grant Details */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                Grant Details
              </h3>
              <div className="space-y-4">
                {g.deadline && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Deadline</p>
                      <p className="text-white font-semibold">{new Date(g.deadline).toLocaleDateString()}</p>
                      {daysUntilDeadline && (
                        <span className={`text-sm ${getUrgencyColor(daysUntilDeadline)}`}>
                          {daysUntilDeadline} days remaining
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {(g.fundingMin || g.fundingMax) && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Funding Amount</p>
                      <p className="text-white font-semibold">
                        {g.fundingMin ? `${g.currency || 'USD'}${g.fundingMin.toLocaleString()}` : '—'} 
                        {g.fundingMin && g.fundingMax ? ' - ' : ''}
                        {g.fundingMax ? `${g.currency || 'USD'}${g.fundingMax.toLocaleString()}` : ''}
                      </p>
                    </div>
                  </div>
                )}

                {g.agency && (
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Agency</p>
                      <p className="text-white font-semibold">{g.agency}</p>
                    </div>
                  </div>
                )}

                {g.source && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Source</p>
                      <p className="text-white font-semibold">{g.source}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Urgency Alert */}
            {daysUntilDeadline && daysUntilDeadline <= 30 && (
              <div className={`rounded-2xl p-6 border ${getUrgencyBg(daysUntilDeadline)}`}>
                <div className="flex items-center gap-3">
                  <Clock className={`w-6 h-6 ${getUrgencyColor(daysUntilDeadline)}`} />
                  <div>
                    <h4 className="font-bold text-white">Deadline Approaching</h4>
                    <p className={`text-sm ${getUrgencyColor(daysUntilDeadline)}`}>
                      {daysUntilDeadline} days left to apply
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
