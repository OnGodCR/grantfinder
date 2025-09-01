'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Discover' },
  { href: '/bookmarks', label: 'Bookmarks' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/profile', label: 'Profile' },
]

export default function Sidebar() {
  const pathname = usePathname() || '/'

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-white/5">
      <div className="px-5 py-4">
        <div className="text-xl font-bold tracking-tight">Grantalytic</div>
      </div>
      <nav className="mt-2 px-2 pb-6">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'block rounded-xl px-3 py-2 text-sm font-medium transition',
                active
                  ? 'bg-mint text-navy'
                  : 'text-text hover:bg-white/10',
              ].join(' ')}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
