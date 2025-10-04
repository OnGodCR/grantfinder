'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, TrendingUp, DollarSign, Calendar, Building, Tag, MapPin, User } from 'lucide-react';
import { MatchResult } from '@/lib/matchScore';

interface MatchScoreDetailsProps {
  matchResult: MatchResult;
  grantTitle: string;
}

export default function MatchScoreDetails({ matchResult, grantTitle }: MatchScoreDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const factorDetails = [
    {
      name: 'Research Interests',
      score: matchResult.factors.keywordMatch,
      weight: 30,
      icon: TrendingUp,
      description: 'How well the grant matches your research interests and keywords'
    },
    {
      name: 'Funding Amount',
      score: matchResult.factors.fundingMatch,
      weight: 20,
      icon: DollarSign,
      description: 'How well the funding amount aligns with your preferences'
    },
    {
      name: 'Deadline Timing',
      score: matchResult.factors.deadlineMatch,
      weight: 15,
      icon: Calendar,
      description: 'Whether the deadline gives you enough time to prepare'
    },
    {
      name: 'Agency Type',
      score: matchResult.factors.agencyMatch,
      weight: 15,
      icon: Building,
      description: 'How well the funding agency matches your preferences'
    },
    {
      name: 'Grant Type',
      score: matchResult.factors.typeMatch,
      weight: 10,
      icon: Tag,
      description: 'How well the grant type matches your preferences'
    },
    {
      name: 'Location',
      score: matchResult.factors.locationMatch,
      weight: 5,
      icon: MapPin,
      description: 'Geographic compatibility with your location'
    },
    {
      name: 'Experience Level',
      score: matchResult.factors.experienceMatch,
      weight: 5,
      icon: User,
      description: 'How well the grant matches your experience level'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    if (score >= 0.3) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-400';
    if (score >= 0.6) return 'bg-yellow-400';
    if (score >= 0.3) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/30 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">{matchResult.score}%</span>
              <span className="text-slate-400 text-sm">Match Score</span>
            </div>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getScoreBarColor(matchResult.score / 100)}`}
                style={{ width: `${matchResult.score}%` }}
              />
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-700/30 p-4 space-y-4">
          {/* Overall Score Breakdown */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Score Breakdown</h4>
            <div className="space-y-3">
              {factorDetails.map((factor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <factor.icon className="w-4 h-4 text-slate-400" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-300">{factor.name}</span>
                        <span className={`text-sm font-bold ${getScoreColor(factor.score)}`}>
                          {Math.round(factor.score * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${getScoreBarColor(factor.score)}`}
                          style={{ width: `${factor.score * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{factor.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 ml-2">{factor.weight}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {matchResult.explanation.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white mb-3">Why This Score?</h4>
              <ul className="space-y-2">
                {matchResult.explanation.map((explanation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{explanation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {matchResult.recommendations.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {matchResult.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
