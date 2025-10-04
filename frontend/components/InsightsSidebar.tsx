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
}

export default function InsightsSidebar({ 
  recommendedGrants = [], 
  trendingKeywords = [],
  upcomingDeadlines = 0 
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
    <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 space-y-8">
      {/* Recommended for You */}
      <div>
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-teal-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
        </div>
        <div className="space-y-3">
          {recommended.map((grant) => (
            <div
              key={grant.id}
              className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white line-clamp-2">
                  {grant.title}
                </span>
                <span className="text-xs font-semibold text-teal-400 ml-2 flex-shrink-0">
                  {grant.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deadline Tracker */}
      <div>
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Deadline Tracker</h3>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Upcoming Deadlines</span>
            <span className="text-sm font-semibold text-white">{upcomingDeadlines}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((upcomingDeadlines / 10) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
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
          <Tag className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Keyword Trends</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <button
              key={keyword}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-full transition-colors"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <div className="flex items-center mb-4">
          <Award className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-sm text-slate-300">Grants Found</span>
            </div>
            <span className="text-sm font-semibold text-white">247</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-sm text-slate-300">This Week</span>
            </div>
            <span className="text-sm font-semibold text-white">+23</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <span className="text-sm text-slate-300">Due Soon</span>
            </div>
            <span className="text-sm font-semibold text-red-400">12</span>
          </div>
        </div>
      </div>
    </div>
  );
}
