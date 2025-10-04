'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Grantalytic</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-500 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">User Profile</p>
            <p className="text-xs text-slate-400 truncate">View settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
