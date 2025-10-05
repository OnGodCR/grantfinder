'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ArrowLeft, User, Bell, Shield, Key, Trash2, Save } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    notifications: {
      email: true,
      push: false,
      grantUpdates: true,
      deadlineReminders: true,
    },
    privacy: {
      profileVisible: true,
      showMatchScores: true,
    },
  });

  const handleSave = () => {
    // In a real app, you'd save these settings to your backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, you'd call an API to delete the account
      console.log('Account deletion requested');
      alert('Account deletion feature would be implemented here');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/discover" 
            className="mr-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Account Settings</h1>
            <p className="text-slate-400 mt-1">Manage your account preferences and security</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button className="w-full flex items-center px-4 py-3 text-left text-white bg-slate-800/50 rounded-lg border border-slate-700/50">
                <User className="w-5 h-5 mr-3" />
                Profile
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                <Bell className="w-5 h-5 mr-3" />
                Notifications
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                <Shield className="w-5 h-5 mr-3" />
                Security
              </button>
              <button className="w-full flex items-center px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                <Key className="w-5 h-5 mr-3" />
                API Keys
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={settings.firstName}
                      onChange={(e) => setSettings({...settings, firstName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={settings.lastName}
                      onChange={(e) => setSettings({...settings, lastName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed here. Contact support if needed.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, email: e.target.checked}
                        })}
                        className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="ml-3 text-slate-300">Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, push: e.target.checked}
                        })}
                        className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="ml-3 text-slate-300">Push notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.grantUpdates}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, grantUpdates: e.target.checked}
                        })}
                        className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="ml-3 text-slate-300">Grant updates</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.deadlineReminders}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, deadlineReminders: e.target.checked}
                        })}
                        className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="ml-3 text-slate-300">Deadline reminders</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.profileVisible}
                        onChange={(e) => setSettings({
                          ...settings,
                          privacy: {...settings.privacy, profileVisible: e.target.checked}
                        })}
                        className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="ml-3 text-slate-300">Make profile visible to other users</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showMatchScores}
                        onChange={(e) => setSettings({
                          ...settings,
                          privacy: {...settings.privacy, showMatchScores: e.target.checked}
                        })}
                        className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="ml-3 text-slate-300">Show match scores on grant cards</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center px-6 py-3 bg-red-600/20 text-red-400 font-semibold rounded-lg hover:bg-red-600/30 transition-colors border border-red-600/30"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
