'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { 
  Search, 
  Bookmark, 
  Bell, 
  User, 
  Home,
  TrendingUp,
  Calendar,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Discover', href: '/discover', icon: Search },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-56 bg-slate-900 border-r border-slate-800/50">
      {/* Logo */}
      <div className="flex items-center px-6 py-5 border-b border-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Grantlytic</span>
            <p className="text-xs text-slate-400 -mt-1">AI Grant Discovery</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-xl",
                userButtonPopoverCard: "bg-slate-800 border border-slate-700",
                userButtonPopoverText: "text-slate-200",
                userButtonPopoverActions: "text-slate-300"
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">User Profile</p>
            <p className="text-xs text-slate-400 truncate">Click avatar to manage account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
