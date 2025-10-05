'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, DollarSign, ExternalLink, Bookmark, Building } from 'lucide-react';
import MatchScoreDetails from './MatchScoreDetails';
import { addBookmark, removeBookmark, isBookmarked } from '@/lib/bookmarks';

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

export default function ModernGrantCard({ grant, onBookmark, isBookmarked: propIsBookmarked = false }: ModernGrantCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(grant.id));
  }, [grant.id]);

  const handleBookmarkToggle = () => {
    if (bookmarked) {
      if (removeBookmark(grant.id)) {
        setBookmarked(false);
        onBookmark?.(grant.id);
      }
    } else {
      if (addBookmark(grant)) {
        setBookmarked(true);
        onBookmark?.(grant.id);
      }
    }
  };

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
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-700/50 hover:border-teal-400/50 hover:-translate-y-1 group h-full min-h-[400px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1 pr-6">
          <h3 className="text-2xl font-bold text-white mb-4 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'}}>
            {grant.title}
          </h3>
          <p className="text-lg text-slate-300 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical'}}>
            {grant.summary || grant.description}
          </p>
        </div>
        
        {/* Match Score Circle */}
        <div className="ml-6 flex-shrink-0">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
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
              <span className="text-lg font-bold text-white">{matchScore}%</span>
            </div>
          </div>
          <p className="text-base text-slate-400 text-center mt-3 font-medium">Match Score</p>
        </div>
      </div>

      {/* Grant Details */}
      <div className="space-y-6 mb-10">
        {grant.agency && (
          <div className="flex items-center text-lg text-slate-300">
            <Building className="w-6 h-6 mr-4 text-slate-400" />
            <span className="font-semibold">{grant.agency}</span>
          </div>
        )}
        
        {(grant.fundingMin || grant.fundingMax) && (
          <div className="flex items-center text-lg text-slate-300">
            <DollarSign className="w-6 h-6 mr-4 text-slate-400" />
            <span className="font-semibold">{formatFunding(grant.fundingMin, grant.fundingMax, grant.currency)}</span>
          </div>
        )}
        
        {grant.deadline && (
          <div className="flex items-center text-lg">
            <Calendar className="w-6 h-6 mr-4 text-slate-400" />
            <span className="text-slate-300 font-semibold">Deadline:</span>
            <span className={`ml-3 font-bold ${getUrgencyColor(daysUntilDeadline!)}`}>
              {new Date(grant.deadline).toLocaleDateString()}
            </span>
            {daysUntilDeadline && (
              <span className={`ml-4 text-base px-4 py-2 rounded-full font-bold ${
                daysUntilDeadline <= 7 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                daysUntilDeadline <= 14 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                daysUntilDeadline <= 30 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}>
                {daysUntilDeadline} days left
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-700/50">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBookmarkToggle}
            className={`p-4 rounded-xl transition-all duration-200 ${
              bookmarked
                ? 'bg-teal-500/20 text-teal-400 shadow-sm border border-teal-500/30'
                : 'text-slate-400 hover:text-teal-400 hover:bg-teal-500/10'
            }`}
          >
            <Bookmark className={`w-6 h-6 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
          
          {grant.url && (
            <a
              href={grant.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-xl transition-all duration-200"
            >
              <ExternalLink className="w-6 h-6" />
            </a>
          )}
        </div>
        
        <Link
          href={`/grants/${grant.id}`}
          className="px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-lg font-bold rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl inline-block text-center"
        >
          View Details
        </Link>
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
