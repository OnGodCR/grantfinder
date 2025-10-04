'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import DashboardSidebar from '@/components/DashboardSidebar';
import TopNavbar from '@/components/TopNavbar';
import { User, Mail, Calendar, Award, Bookmark, TrendingUp, Settings, Bell, Shield, HelpCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, isSignedIn, isLoaded } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState({
    totalGrants: 247,
    bookmarkedGrants: 23,
    applicationsSubmitted: 8,
    successfulApplications: 3,
    researchInterests: ['Machine Learning', 'AI Research', 'Data Science', 'Computer Vision'],
    notifications: {
      email: true,
      deadlineReminders: true,
      newMatches: true,
      weeklyDigest: false,
    },
    preferences: {
      fundingRange: { min: 50000, max: 500000 },
      deadlineBuffer: 30,
      matchThreshold: 70,
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const stats = [
    { label: 'Total Grants Found', value: profileData.totalGrants, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Bookmarked Grants', value: profileData.bookmarkedGrants, icon: Bookmark, color: 'text-teal-400' },
    { label: 'Applications Submitted', value: profileData.applicationsSubmitted, icon: Award, color: 'text-green-400' },
    { label: 'Successful Applications', value: profileData.successfulApplications, icon: Award, color: 'text-yellow-400' },
  ];

  const handleNotificationToggle = (key: string) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardSidebar />
      
      <div className="ml-64">
        <TopNavbar onSearch={() => {}} />
        
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
              <p className="text-slate-400 text-lg">Manage your account and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mr-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {user?.firstName || 'User'} {user?.lastName || ''}
                      </h3>
                      <p className="text-slate-400 text-sm">{user?.emailAddresses?.[0]?.emailAddress}</p>
                    </div>
                  </div>
                  
                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-teal-500 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        <tab.icon className="w-5 h-5 mr-3" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {stats.map((stat, index) => (
                        <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                          <div className="flex items-center justify-between mb-4">
                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                          </div>
                          <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Research Interests */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                      <h3 className="text-xl font-bold text-white mb-4">Research Interests</h3>
                      <div className="flex flex-wrap gap-3">
                        {profileData.researchInterests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-teal-500/20 text-teal-300 rounded-full text-sm font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                      <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
                          <div className="flex items-center">
                            <Bookmark className="w-5 h-5 text-teal-400 mr-3" />
                            <span className="text-slate-300">Bookmarked "AI Research Grant"</span>
                          </div>
                          <span className="text-slate-400 text-sm">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
                          <div className="flex items-center">
                            <Award className="w-5 h-5 text-green-400 mr-3" />
                            <span className="text-slate-300">Applied to "Machine Learning Fellowship"</span>
                          </div>
                          <span className="text-slate-400 text-sm">1 day ago</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center">
                            <TrendingUp className="w-5 h-5 text-blue-400 mr-3" />
                            <span className="text-slate-300">Found 12 new matching grants</span>
                          </div>
                          <span className="text-slate-400 text-sm">3 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-8">
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                      <h3 className="text-xl font-bold text-white mb-6">Grant Preferences</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-3">
                            Funding Range (USD)
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-400 text-xs mb-1">Minimum</label>
                              <input
                                type="number"
                                value={profileData.preferences.fundingRange.min}
                                onChange={(e) => handlePreferenceChange('fundingRange', {
                                  ...profileData.preferences.fundingRange,
                                  min: parseInt(e.target.value)
                                })}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 text-xs mb-1">Maximum</label>
                              <input
                                type="number"
                                value={profileData.preferences.fundingRange.max}
                                onChange={(e) => handlePreferenceChange('fundingRange', {
                                  ...profileData.preferences.fundingRange,
                                  max: parseInt(e.target.value)
                                })}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-3">
                            Deadline Buffer (days)
                          </label>
                          <input
                            type="number"
                            value={profileData.preferences.deadlineBuffer}
                            onChange={(e) => handlePreferenceChange('deadlineBuffer', parseInt(e.target.value))}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 text-sm font-medium mb-3">
                            Minimum Match Score (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={profileData.preferences.matchThreshold}
                            onChange={(e) => handlePreferenceChange('matchThreshold', parseInt(e.target.value))}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                      <h3 className="text-xl font-bold text-white mb-6">Notification Settings</h3>
                      
                      <div className="space-y-6">
                        {Object.entries(profileData.notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-b-0">
                            <div>
                              <h4 className="text-slate-300 font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </h4>
                              <p className="text-slate-400 text-sm">
                                {key === 'email' && 'Receive email notifications'}
                                {key === 'deadlineReminders' && 'Get reminded about upcoming deadlines'}
                                {key === 'newMatches' && 'Notify when new grants match your profile'}
                                {key === 'weeklyDigest' && 'Receive weekly summary of new opportunities'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleNotificationToggle(key)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                value ? 'bg-teal-500' : 'bg-slate-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/30">
                      <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between py-4 border-b border-slate-700/30">
                          <div>
                            <h4 className="text-slate-300 font-medium">Change Password</h4>
                            <p className="text-slate-400 text-sm">Update your account password</p>
                          </div>
                          <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                            Change
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between py-4 border-b border-slate-700/30">
                          <div>
                            <h4 className="text-slate-300 font-medium">Two-Factor Authentication</h4>
                            <p className="text-slate-400 text-sm">Add an extra layer of security</p>
                          </div>
                          <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                            Enable
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between py-4">
                          <div>
                            <h4 className="text-slate-300 font-medium">Account Deletion</h4>
                            <p className="text-slate-400 text-sm">Permanently delete your account</p>
                          </div>
                          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}