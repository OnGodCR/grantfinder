'use client';

import { useState } from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';

interface TopNavbarProps {
  onSearch: (query: string) => void;
}

export default function TopNavbar({ onSearch }: TopNavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
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
          {/* Notifications */}
          <button className="relative p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:scale-105">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-3 p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 hover:scale-105">
              <div className="w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
