'use client';

import { TrendingUp, Calendar, Tag, Award, Clock } from 'lucide-react';

interface RecommendedGrant {
  id: string;
  title: string;
  score: number;
}

interface InsightsSidebarProps {
  recommendedGrants?: RecommendedGrant[];
  trendingKeywords?: string[];
  upcomingDeadlines?: number;
  totalGrants?: number;
  grantsThisWeek?: number;
  grantsDueSoon?: number;
}

export default function InsightsSidebar({ 
  recommendedGrants = [], 
  trendingKeywords = [],
  upcomingDeadlines = 0,
  totalGrants = 0,
  grantsThisWeek = 0,
  grantsDueSoon = 0
}: InsightsSidebarProps) {
  const defaultRecommended = [
    { id: '1', title: 'Advanced AI for Climate Solutions', score: 92 },
    { id: '2', title: 'Neural Interface Development Project', score: 80 },
    { id: '3', title: 'Precision Medicine Research Initiative', score: 75 },
    { id: '4', title: 'Sustainable Energy Technology Grant', score: 68 },
  ];

  const defaultKeywords = [
    'Machine Learning',
    'Neurobiology',
    'Precision Medicine',
    'Climate Science',
    'Renewable Energy',
    'Data Analytics',
    'Biotechnology',
    'Environmental Research',
  ];

  const recommended = recommendedGrants.length > 0 ? recommendedGrants : defaultRecommended;
  const keywords = trendingKeywords.length > 0 ? trendingKeywords : defaultKeywords;

  return (
    <div className="w-72 bg-slate-900 p-4 space-y-6">
      {/* Recommended for You */}
      <div>
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-teal-400 mr-2" />
          <h3 className="text-lg font-bold text-white">Recommended for You</h3>
        </div>
        <div className="space-y-3">
          {recommended.map((grant) => (
            <div
              key={grant.id}
              className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all duration-200 cursor-pointer border border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                  {grant.title}
                </span>
                <span className="text-xs font-bold text-teal-400 ml-2 flex-shrink-0 px-2 py-1 bg-teal-400/10 rounded-full">
                  {grant.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deadline Tracker */}
      <div>
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-bold text-white">Deadline Tracker</h3>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-300 font-medium">Upcoming Deadlines</span>
            <span className="text-xl font-bold text-white">{upcomingDeadlines}</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((upcomingDeadlines / 10) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            {upcomingDeadlines > 0
              ? `${upcomingDeadlines} grants due soon`
              : 'No urgent deadlines'
            }
          </p>
        </div>
      </div>

      {/* Keyword Trends */}
      <div>
        <div className="flex items-center mb-4">
          <Tag className="w-5 h-5 text-purple-400 mr-2" />
          <h3 className="text-lg font-bold text-white">Keyword Trends</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <button
              key={keyword}
              className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all duration-200 border border-slate-700/30"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <div className="flex items-center mb-4">
          <Award className="w-5 h-5 text-yellow-400 mr-2" />
          <h3 className="text-lg font-bold text-white">Quick Stats</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-sm text-slate-300 font-medium">Grants Found</span>
            </div>
            <span className="text-lg font-bold text-white">{totalGrants}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-sm text-slate-300 font-medium">This Week</span>
            </div>
            <span className="text-lg font-bold text-white">+{grantsThisWeek}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-sm text-slate-300 font-medium">Due Soon</span>
            </div>
            <span className="text-lg font-bold text-red-400">{grantsDueSoon}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
