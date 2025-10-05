'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { fetchGrantsAuto } from '@/lib/grants';
import { calculateBatchMatchScores, getDefaultUserProfile } from '@/lib/matchScore';
import DashboardSidebar from '@/components/DashboardSidebar';
import TopNavbar from '@/components/TopNavbar';
import ModernGrantCard from '@/components/ModernGrantCard';
import InsightsSidebar from '@/components/InsightsSidebar';
import FilterTabs from '@/components/FilterTabs';

interface Grant {
  id: string;
  title: string;
  description: string;
  summary?: string;
  deadline?: string;
  fundingMin?: number;
  fundingMax?: number;
  currency?: string;
  url?: string;
  agency?: string;
  matchScore?: number;
}

export default function DiscoverPage() {
  const { user, isLoaded } = useUser();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    
    const fetchGrants = async () => {
      try {
        setLoading(true);
        const response = await fetchGrantsAuto(searchQuery, user?.id || undefined);
        
        if (response.ok && response.body) {
          const grantsData = response.body.items || response.body.grants || [];
          console.log('Raw grants data:', grantsData.slice(0, 2)); // Debug: log first 2 grants
          
          // Calculate match scores for all grants
          const userProfile = getDefaultUserProfile();
          console.log('User profile:', userProfile); // Debug: log user profile
          
          const grantsWithScores = calculateBatchMatchScores(grantsData, userProfile);
          console.log('Grants with scores:', grantsWithScores.slice(0, 2)); // Debug: log first 2 with scores
          
          setGrants(grantsWithScores);
        } else {
          setError(response.error || 'Failed to fetch grants');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGrants();
  }, [isLoaded, user, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleBookmark = (grantId: string) => {
    console.log('Bookmarking grant:', grantId);
  };

  // Calculate filter counts based on actual grant data
  const getFilterCounts = () => {
    const allCount = grants.length;
    const nsfCount = grants.filter(grant => grant.agency?.toLowerCase().includes('nsf')).length;
    const nihCount = grants.filter(grant => grant.agency?.toLowerCase().includes('nih')).length;
    const foundationsCount = grants.filter(grant => 
      !grant.agency?.toLowerCase().includes('nsf') && 
      !grant.agency?.toLowerCase().includes('nih')
    ).length;
    const deadlineSoonCount = grants.filter(grant => {
      if (!grant.deadline) return false;
      const daysUntilDeadline = Math.ceil((new Date(grant.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 14;
    }).length;
    const highMatchCount = grants.filter(grant => (grant.matchScore || 0) >= 80).length;

    return [
      { id: 'all', label: 'All Grants', count: allCount },
      { id: 'nsf', label: 'NSF', count: nsfCount },
      { id: 'nih', label: 'NIH', count: nihCount },
      { id: 'foundations', label: 'Foundations', count: foundationsCount },
      { id: 'deadline-soon', label: 'Deadline Soon', count: deadlineSoonCount },
      { id: 'high-match', label: 'High Match', count: highMatchCount },
    ];
  };

  const filteredGrants = grants.filter(grant => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'nsf') return grant.agency?.toLowerCase().includes('nsf');
    if (activeFilter === 'nih') return grant.agency?.toLowerCase().includes('nih');
    if (activeFilter === 'foundations') return !grant.agency?.toLowerCase().includes('nsf') && !grant.agency?.toLowerCase().includes('nih');
    if (activeFilter === 'deadline-soon') {
      if (!grant.deadline) return false;
      const daysUntilDeadline = Math.ceil((new Date(grant.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 14;
    }
    if (activeFilter === 'high-match') return (grant.matchScore || 0) >= 80;
    return true;
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardSidebar />
      
      <div className="ml-56">
        <TopNavbar onSearch={handleSearch} />
        
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 bg-slate-900">
            <div className="w-full p-6">
              <h1 className="text-3xl font-bold text-white mb-6">Discover Grants</h1>
              
              <FilterTabs 
                activeFilter={activeFilter} 
                onFilterChange={handleFilterChange}
                filters={getFilterCounts()}
              />
              
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                  <span className="ml-3 text-slate-300">Loading grants...</span>
                </div>
              )}
              
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-red-300">Error: {error}</p>
                </div>
              )}
              
              {!loading && !error && filteredGrants.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-300 text-lg">No grants found</p>
                  <p className="text-slate-400 mt-2">Try adjusting your search or filters</p>
                </div>
              )}
              
              {!loading && !error && filteredGrants.length > 0 && (
                <div className="mt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                    {filteredGrants.map((grant) => (
                      <ModernGrantCard
                        key={grant.id}
                        grant={grant}
                        onBookmark={handleBookmark}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Insights Sidebar */}
          <InsightsSidebar
            recommendedGrants={grants.slice(0, 4).map(g => ({ id: g.id, title: g.title, score: g.matchScore || 0 }))}
            upcomingDeadlines={grants.filter(g => {
              if (!g.deadline) return false;
              const daysUntilDeadline = Math.ceil((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return daysUntilDeadline <= 14;
            }).length}
            totalGrants={grants.length}
            grantsThisWeek={grants.filter(g => {
              if (!g.deadline) return false;
              const daysUntilDeadline = Math.ceil((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return daysUntilDeadline <= 7;
            }).length}
            grantsDueSoon={grants.filter(g => {
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