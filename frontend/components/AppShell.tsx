'use client'

import Sidebar from '@/components/Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh]">
      <Sidebar />
      <div className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</div>
    </div>
  )
}
