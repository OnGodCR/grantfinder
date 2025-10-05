'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import DashboardSidebar from '@/components/DashboardSidebar';
import TopNavbar from '@/components/TopNavbar';
import FilterTabs from '@/components/FilterTabs';
import ModernGrantCard from '@/components/ModernGrantCard';
import InsightsSidebar from '@/components/InsightsSidebar';
import { fetchGrantsAuto } from '@/lib/grants';
import { calculateBatchMatchScores, getDefaultUserProfile } from '@/lib/matchScore';
import { getBookmarks, removeBookmark } from '@/lib/bookmarks';
import { Bookmark, Search, Filter, SortAsc } from 'lucide-react';

export default function BookmarksPage() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [bookmarkedGrants, setBookmarkedGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    if (!isLoaded) return;
    
    const loadBookmarks = () => {
      try {
        setLoading(true);
        const bookmarks = getBookmarks();
        setBookmarkedGrants(bookmarks);
      } catch (err: any) {
        setError(err.message || 'Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, [isLoaded]);

  const handleRemoveBookmark = (grantId: string) => {
    if (removeBookmark(grantId)) {
      setBookmarkedGrants(prev => prev.filter(grant => grant.grantId !== grantId));
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleBookmark = (grantId: string) => {
    setBookmarkedGrants(prev => prev.filter(grant => grant.id !== grantId));
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
  };

  const filteredAndSortedGrants = bookmarkedGrants
    .filter(grant => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'high-match') return (grant.matchScore || 0) >= 80;
      if (activeFilter === 'deadline-soon') {
        if (!grant.deadline) return false;
        const daysUntilDeadline = Math.ceil((new Date(grant.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline <= 30;
      }
      if (activeFilter === 'recent') {
        const daysSinceBookmarked = Math.ceil((new Date().getTime() - new Date(grant.bookmarkedAt).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceBookmarked <= 7;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'deadline':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'recent':
          return new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime();
        default:
          return 0;
      }
    });

  const bookmarkFilters = [
    { id: 'all', label: 'All Bookmarks', count: bookmarkedGrants.length },
    { id: 'high-match', label: 'High Match', count: bookmarkedGrants.filter(g => (g.matchScore || 0) >= 80).length },
    { id: 'deadline-soon', label: 'Deadline Soon', count: bookmarkedGrants.filter(g => {
      if (!g.deadline) return false;
      const daysUntilDeadline = Math.ceil((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 30;
    }).length },
    { id: 'recent', label: 'Recently Added', count: bookmarkedGrants.filter(g => {
      const daysSinceBookmarked = Math.ceil((new Date().getTime() - new Date(g.bookmarkedAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceBookmarked <= 7;
    }).length },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardSidebar />
      
      <div className="ml-56">
        <TopNavbar onSearch={handleSearch} showSearch={false} />
        
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 bg-slate-900">
            <div className="w-full p-4">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Bookmark className="w-8 h-8 text-teal-400 mr-3" />
                  <h1 className="text-4xl font-bold text-white">My Bookmarks</h1>
                </div>
                <p className="text-slate-400 text-lg">Your saved grant opportunities and research funding</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Bookmarks</p>
                      <p className="text-2xl font-bold text-white">{bookmarkedGrants.length}</p>
                    </div>
                    <Bookmark className="w-8 h-8 text-teal-400" />
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">High Match</p>
                      <p className="text-2xl font-bold text-white">
                        {bookmarkedGrants.filter(g => (g.matchScore || 0) >= 80).length}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-teal-400/20 rounded-lg flex items-center justify-center">
                      <span className="text-teal-400 font-bold text-sm">80+</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Due Soon</p>
                      <p className="text-2xl font-bold text-white">
                        {bookmarkedGrants.filter(g => {
                          if (!g.deadline) return false;
                          const daysUntilDeadline = Math.ceil((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return daysUntilDeadline <= 30;
                        }).length}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-orange-400/20 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 font-bold text-sm">30d</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">This Week</p>
                      <p className="text-2xl font-bold text-white">
                        {bookmarkedGrants.filter(g => {
                          const daysSinceBookmarked = Math.ceil((new Date().getTime() - new Date(g.bookmarkedAt).getTime()) / (1000 * 60 * 60 * 24));
                          return daysSinceBookmarked <= 7;
                        }).length}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">7d</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters and Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div className="flex-1">
                  <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} filters={bookmarkFilters} />
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 text-sm font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="match">Match Score</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
              </div>
              
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                  <span className="ml-4 text-slate-300 text-lg font-medium">Loading bookmarks...</span>
                </div>
              )}
              
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-8">
                  <p className="text-red-300 text-lg font-medium">Error: {error}</p>
                </div>
              )}
              
              {!loading && !error && filteredAndSortedGrants.length === 0 && (
                <div className="text-center py-16">
                  <Bookmark className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-300 text-xl font-medium">No bookmarks found</p>
                  <p className="text-slate-500 mt-2">Start bookmarking grants to see them here</p>
                </div>
              )}
              
              {!loading && !error && filteredAndSortedGrants.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredAndSortedGrants.map((grant) => (
                    <ModernGrantCard
                      key={grant.grantId || grant.id}
                      grant={{
                        id: grant.grantId || grant.id,
                        title: grant.title,
                        description: grant.description || '',
                        summary: grant.summary,
                        agency: grant.agency,
                        deadline: grant.deadline,
                        fundingMin: grant.fundingMin,
                        fundingMax: grant.fundingMax,
                        currency: grant.currency,
                        url: grant.url,
                        matchScore: grant.matchScore,
                      }}
                      onBookmark={handleRemoveBookmark}
                      isBookmarked={true}
                    />
                  ))}
                </div>
              )}
            </div>
        </div>
          
          {/* Insights Sidebar */}
          <InsightsSidebar 
            recommendedGrants={bookmarkedGrants.slice(0, 4).map(g => ({ id: g.id, title: g.title, score: g.matchScore || 0 }))}
            upcomingDeadlines={bookmarkedGrants.filter(g => {
              if (!g.deadline) return false;
              const daysUntilDeadline = Math.ceil((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return daysUntilDeadline <= 14;
            }).length}
          />
        </div>
      </div>
    </div>
  );
}