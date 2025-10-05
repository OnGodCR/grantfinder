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
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 space-y-6">
      {/* Recommended for You */}
      <div>
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-teal-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Recommended for You</h3>
        </div>
        <div className="space-y-3">
          {recommended.map((grant) => (
            <div
              key={grant.id}
              className="p-3 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                  {grant.title}
                </span>
                <span className="text-xs font-bold text-teal-600 ml-2 flex-shrink-0 px-2 py-1 bg-teal-100 rounded-full">
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
          <Calendar className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Deadline Tracker</h3>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 font-medium">Upcoming Deadlines</span>
            <span className="text-xl font-bold text-gray-900">{upcomingDeadlines}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((upcomingDeadlines / 10) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2 font-medium">
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
          <Tag className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Keyword Trends</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <button
              key={keyword}
              className="px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg transition-all duration-200 border border-gray-200"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <div className="flex items-center mb-4">
          <Award className="w-5 h-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Quick Stats</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 font-medium">Grants Found</span>
            </div>
            <span className="text-lg font-bold text-gray-900">247</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 font-medium">This Week</span>
            </div>
            <span className="text-lg font-bold text-gray-900">+23</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 font-medium">Due Soon</span>
            </div>
            <span className="text-lg font-bold text-red-600">12</span>
          </div>
        </div>
      </div>
    </div>
  );
}
