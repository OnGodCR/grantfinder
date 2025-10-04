'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchGrantsAuto } from '@/lib/grants';
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

  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);
        const token = isSignedIn ? await getToken() : undefined;
        const response = await fetchGrantsAuto(searchQuery, token);
        
        if (response.ok && response.body) {
          const grantsData = response.body.items || response.body.grants || [];
          setGrants(grantsData);
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
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar />
      
      <div className="ml-64">
        <TopNavbar onSearch={handleSearch} />
        
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">Discover Grants</h1>
              
              <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />
              
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                  <span className="ml-3 text-slate-600">Loading grants...</span>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">Error: {error}</p>
                </div>
              )}
              
              {!loading && !error && filteredGrants.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-lg">No grants found</p>
                  <p className="text-slate-400 mt-2">Try adjusting your search or filters</p>
                </div>
              )}
              
              {!loading && !error && filteredGrants.length > 0 && (
                <div className="grid gap-6">
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