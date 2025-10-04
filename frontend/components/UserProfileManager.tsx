'use client';

import { useState, useEffect } from 'react';
import { UserProfile, getDefaultUserProfile } from '@/lib/matchScore';
import { Settings, Save, RotateCcw } from 'lucide-react';

interface UserProfileManagerProps {
  onProfileChange: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

export default function UserProfileManager({ onProfileChange, initialProfile }: UserProfileManagerProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile || getDefaultUserProfile());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    onProfileChange(profile);
  }, [profile, onProfileChange]);

  const handleInterestAdd = (interest: string) => {
    if (interest.trim() && !profile.researchInterests.includes(interest.trim())) {
      setProfile(prev => ({
        ...prev,
        researchInterests: [...prev.researchInterests, interest.trim()]
      }));
    }
  };

  const handleInterestRemove = (index: number) => {
    setProfile(prev => ({
      ...prev,
      researchInterests: prev.researchInterests.filter((_, i) => i !== index)
    }));
  };

  const handleAgencyAdd = (agency: string) => {
    if (agency.trim() && !profile.preferredAgencies.includes(agency.trim())) {
      setProfile(prev => ({
        ...prev,
        preferredAgencies: [...prev.preferredAgencies, agency.trim()]
      }));
    }
  };

  const handleAgencyRemove = (index: number) => {
    setProfile(prev => ({
      ...prev,
      preferredAgencies: prev.preferredAgencies.filter((_, i) => i !== index)
    }));
  };

  const handleGrantTypeAdd = (type: string) => {
    if (type.trim() && !profile.preferredGrantTypes.includes(type.trim())) {
      setProfile(prev => ({
        ...prev,
        preferredGrantTypes: [...prev.preferredGrantTypes, type.trim()]
      }));
    }
  };

  const handleGrantTypeRemove = (index: number) => {
    setProfile(prev => ({
      ...prev,
      preferredGrantTypes: prev.preferredGrantTypes.filter((_, i) => i !== index)
    }));
  };

  const resetToDefault = () => {
    setProfile(getDefaultUserProfile());
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Match Score Preferences</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetToDefault}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title={isEditing ? "Save changes" : "Edit preferences"}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Research Interests */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-3">
            Research Interests
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.researchInterests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-sm font-medium flex items-center space-x-2"
              >
                <span>{interest}</span>
                {isEditing && (
                  <button
                    onClick={() => handleInterestRemove(index)}
                    className="text-teal-300 hover:text-red-400"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <input
              type="text"
              placeholder="Add research interest..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleInterestAdd((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          )}
        </div>

        {/* Funding Range */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-3">
            Preferred Funding Range (USD)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Minimum</label>
              <input
                type="number"
                value={profile.fundingRange.min}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  fundingRange: { ...prev.fundingRange, min: parseInt(e.target.value) || 0 }
                }))}
                disabled={!isEditing}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Maximum</label>
              <input
                type="number"
                value={profile.fundingRange.max}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  fundingRange: { ...prev.fundingRange, max: parseInt(e.target.value) || 0 }
                }))}
                disabled={!isEditing}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Preferred Agencies */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-3">
            Preferred Funding Agencies
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.preferredAgencies.map((agency, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium flex items-center space-x-2"
              >
                <span>{agency}</span>
                {isEditing && (
                  <button
                    onClick={() => handleAgencyRemove(index)}
                    className="text-blue-300 hover:text-red-400"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <input
              type="text"
              placeholder="Add agency..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAgencyAdd((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          )}
        </div>

        {/* Preferred Grant Types */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-3">
            Preferred Grant Types
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.preferredGrantTypes.map((type, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium flex items-center space-x-2"
              >
                <span>{type}</span>
                {isEditing && (
                  <button
                    onClick={() => handleGrantTypeRemove(index)}
                    className="text-purple-300 hover:text-red-400"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <input
              type="text"
              placeholder="Add grant type..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleGrantTypeAdd((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          )}
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-3">
            Experience Level
          </label>
          <select
            value={profile.experienceLevel}
            onChange={(e) => setProfile(prev => ({
              ...prev,
              experienceLevel: e.target.value as UserProfile['experienceLevel']
            }))}
            disabled={!isEditing}
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Deadline Buffer */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-3">
            Minimum Days Before Deadline
          </label>
          <input
            type="number"
            value={profile.deadlineBuffer}
            onChange={(e) => setProfile(prev => ({
              ...prev,
              deadlineBuffer: parseInt(e.target.value) || 30
            }))}
            disabled={!isEditing}
            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
