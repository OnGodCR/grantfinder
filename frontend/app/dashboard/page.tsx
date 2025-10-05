'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchGrantsAuto } from '@/lib/grants';
import { calculateBatchMatchScores, getDefaultUserProfile, UserProfile } from '@/lib/matchScore';
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

export default function DashboardPage() {
  const { getToken, isSignedIn } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>(getDefaultUserProfile());

  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);
        const token = isSignedIn ? await getToken() : undefined;
        const response = await fetchGrantsAuto(searchQuery, token || undefined);
        
        if (response.ok && response.body) {
          const grantsData = response.body.items || response.body.grants || [];
          
          // Calculate match scores for all grants
          const grantsWithScores = calculateBatchMatchScores(grantsData, userProfile);
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

    if (isSignedIn !== undefined) {
      fetchGrants();
    }
  }, [getToken, isSignedIn, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    // In a real app, you'd filter the grants here
  };

  const handleBookmark = (grantId: string) => {
    // Implement bookmark functionality
    console.log('Bookmarking grant:', grantId);
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

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardSidebar />
      
      <div className="ml-64">
        <TopNavbar onSearch={handleSearch} />
        
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6 bg-slate-900">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-white">Discover Grants</h1>
                <p className="text-slate-400 text-lg">Find the perfect funding opportunities for your research</p>
              </div>
              
              <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />
              
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                  <span className="ml-4 text-slate-300 text-lg font-medium">Loading grants...</span>
                </div>
              )}
              
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-8">
                  <p className="text-red-300 text-lg font-medium">Error: {error}</p>
                </div>
              )}
              
              {!loading && !error && filteredGrants.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-slate-300 text-xl font-medium">No grants found</p>
                  <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
                </div>
              )}
              
              {!loading && !error && filteredGrants.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredGrants.map((grant) => (
                    <ModernGrantCard
                      key={grant.id}
                      grant={grant}
                      onBookmark={handleBookmark}
                    />
                  ))}
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
          />
        </div>
      </div>
    </div>
  );
}