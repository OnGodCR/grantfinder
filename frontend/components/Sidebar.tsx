'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard', label: 'Discover' },
  { href: '/bookmarks', label: 'Bookmarks' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/profile', label: 'Profile' },
]

export default function Sidebar() {
  const pathname = usePathname() || '/'

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-white/5/0">
      <div className="px-5 py-4 text-sm uppercase tracking-wide text-body/70">
        Grantalytic
      </div>
      <nav className="px-3 pb-4">
        <ul className="space-y-1">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    'block rounded-lg px-3 py-2 text-sm ' +
                    (active
                      ? 'bg-white/10 text-white'
                      : 'text-body hover:bg-white/5')
                  }
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
