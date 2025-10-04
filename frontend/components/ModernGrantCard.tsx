'use client';

import { useState } from 'react';
import { Calendar, DollarSign, ExternalLink, Bookmark, Building } from 'lucide-react';
import MatchScoreDetails from './MatchScoreDetails';

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
  matchResult?: any; // MatchResult from matchScore.ts
}

interface ModernGrantCardProps {
  grant: Grant;
  onBookmark?: (grantId: string) => void;
  isBookmarked?: boolean;
}

export default function ModernGrantCard({ grant, onBookmark, isBookmarked = false }: ModernGrantCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get urgency color based on days remaining
  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'text-red-500';
    if (days <= 14) return 'text-orange-500';
    if (days <= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Format funding amount
  const formatFunding = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Amount varies';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Amount varies';
  };

  const daysUntilDeadline = grant.deadline ? getDaysUntilDeadline(grant.deadline) : null;
  const matchScore = grant.matchScore || 0;

  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200/50 hover:border-teal-200/50 hover:-translate-y-1 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
            {grant.title}
          </h3>
          <p className="text-sm text-slate-600 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>
            {grant.summary || grant.description}
          </p>
        </div>
        
        {/* Match Score Circle */}
        <div className="ml-6 flex-shrink-0">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={matchScore >= 80 ? 'text-teal-500' : matchScore >= 60 ? 'text-blue-500' : 'text-orange-500'}
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={`${matchScore}, 100`}
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-800">{matchScore}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2 font-medium">Match Score</p>
        </div>
      </div>

      {/* Grant Details */}
      <div className="space-y-4 mb-6">
        {grant.agency && (
          <div className="flex items-center text-sm text-slate-600">
            <Building className="w-4 h-4 mr-3 text-slate-400" />
            <span className="font-medium">{grant.agency}</span>
          </div>
        )}
        
        {(grant.fundingMin || grant.fundingMax) && (
          <div className="flex items-center text-sm text-slate-600">
            <DollarSign className="w-4 h-4 mr-3 text-slate-400" />
            <span className="font-medium">{formatFunding(grant.fundingMin, grant.fundingMax, grant.currency)}</span>
          </div>
        )}
        
        {grant.deadline && (
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-3 text-slate-400" />
            <span className="text-slate-600 font-medium">Deadline:</span>
            <span className={`ml-2 font-semibold ${getUrgencyColor(daysUntilDeadline!)}`}>
              {new Date(grant.deadline).toLocaleDateString()}
            </span>
            {daysUntilDeadline && (
              <span className={`ml-3 text-xs px-3 py-1 rounded-full font-semibold ${
                daysUntilDeadline <= 7 ? 'bg-red-100 text-red-700' :
                daysUntilDeadline <= 14 ? 'bg-orange-100 text-orange-700' :
                daysUntilDeadline <= 30 ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {daysUntilDeadline} days left
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-200/50">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onBookmark?.(grant.id)}
            className={`p-3 rounded-xl transition-all duration-200 ${
              isBookmarked
                ? 'bg-teal-100 text-teal-600 shadow-sm'
                : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          
          {grant.url && (
            <a
              href={grant.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        
        <button className="px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-semibold rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl">
          View Details
        </button>
      </div>

      {/* Match Score Details */}
      {grant.matchResult && (
        <div className="mt-4">
          <MatchScoreDetails matchResult={grant.matchResult} grantTitle={grant.title} />
        </div>
      )}
    </div>
  );
}
