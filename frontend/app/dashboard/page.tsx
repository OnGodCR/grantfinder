'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { fetchGrantsWithMatching, fetchGrantsAuto } from '@/lib/grants';
import { calculateBatchMatchScores, getDefaultUserProfile, UserProfile } from '@/lib/matchScore';
import { getMyPreferences, convertToMatchProfile } from '@/lib/me';
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
  const { user } = useUser();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>(getDefaultUserProfile());
  const [hasUserProfile, setHasUserProfile] = useState(false);

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isSignedIn || !user?.id) return;

      try {
        const token = await getToken();
        const profileResponse = await getMyPreferences(token || undefined, user.id);
        
        if (profileResponse.exists) {
          const matchProfile = convertToMatchProfile(profileResponse.profile);
          setUserProfile(matchProfile);
          setHasUserProfile(true);
          console.log('Loaded user profile:', matchProfile);
        } else {
          // User hasn't completed onboarding yet
          setUserProfile(getDefaultUserProfile());
          setHasUserProfile(false);
          console.log('No user profile found, using default');
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUserProfile(getDefaultUserProfile());
        setHasUserProfile(false);
      }
    };

    if (isSignedIn !== undefined) {
      loadUserProfile();
    }
  }, [getToken, isSignedIn, user?.id]);

  // Fetch grants with matching when profile is loaded or search changes
  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);
        const token = isSignedIn ? await getToken() : undefined;
        
        // Use enhanced search with match scoring if user has profile
        let response;
        if (hasUserProfile && user?.id) {
          response = await fetchGrantsWithMatching(searchQuery, token || undefined, user.id);
        } else {
          // Fallback to basic search for users without profiles
          response = await fetchGrantsAuto(searchQuery, token || undefined);
        }
        
        if (response.ok && response.body) {
          let grantsData = response.body.items || response.body.grants || [];
          
          // If using basic search, calculate match scores on frontend
          if (!hasUserProfile || !grantsData[0]?.matchScore) {
            grantsData = calculateBatchMatchScores(grantsData, userProfile);
          }
          
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

    if (isSignedIn !== undefined && userProfile) {
      fetchGrants();
    }
  }, [getToken, isSignedIn, searchQuery, userProfile, hasUserProfile, user?.id]);

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

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardSidebar />
      
      <div className="ml-56">
        <TopNavbar onSearch={handleSearch} />
        
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 bg-slate-900">
            <div className="w-full p-4">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-white">Discover Grants</h1>
                <p className="text-slate-400 text-lg">Find the perfect funding opportunities for your research</p>
              </div>
              
              <FilterTabs 
                activeFilter={activeFilter} 
                onFilterChange={handleFilterChange}
                filters={getFilterCounts()}
              />
              
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
              
              {!loading && !hasUserProfile && isSignedIn && (
                <div className="bg-teal-900/20 border border-teal-500/30 rounded-xl p-6 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-teal-300 text-lg font-medium">Complete your profile for better matches</h3>
                      <p className="text-slate-300 mt-1">
                        To get personalized grant recommendations, complete your research profile in onboarding.
                      </p>
                      <a 
                        href="/onboarding" 
                        className="inline-flex items-center mt-3 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Complete Profile
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {!loading && !error && filteredGrants.length > 0 && (
                <div className="mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          />
        </div>
      </div>
    </div>
  );
}