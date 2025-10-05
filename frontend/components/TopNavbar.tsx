'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, ChevronDown, Bookmark, Trash2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

interface TopNavbarProps {
  onSearch: (query: string) => void;
}

export default function TopNavbar({ onSearch }: TopNavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileDropdown(false);
      // Redirect to the main site after sign out
      window.location.href = 'https://grantalytic.com';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
    setShowProfileDropdown(false);
  };

  const confirmDeleteAccount = async () => {
    try {
      // In a real app, you'd call an API to delete the account
      console.log('Account deletion requested');
      alert('Account deletion feature would be implemented here');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };


  return (
    <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800/50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search for grants, keywords, or agencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 border border-slate-700/50 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-slate-800 transition-all duration-200"
            />
          </form>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Bookmarks */}
          <Link href="/bookmarks" className="p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:scale-105">
            <Bookmark className="h-5 w-5" />
          </Link>

          {/* Notifications */}
          <Link href="/notifications" className="relative p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:scale-105">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 py-2 z-50">
                <Link 
                  href="/profile" 
                  className="flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile Settings
                </Link>
                <Link 
                  href="/bookmarks" 
                  className="flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <Bookmark className="w-4 h-4 mr-3" />
                  My Bookmarks
                </Link>
                <Link 
                  href="/notifications" 
                  className="flex items-center px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                </Link>
                <div className="border-t border-slate-700/50 my-2"></div>
                <button 
                  onClick={handleDeleteAccount}
                  className="flex items-center w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Account
                </button>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700/50">
            <div className="flex items-center mb-4">
              <Trash2 className="w-6 h-6 text-red-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Delete Account</h3>
            </div>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
