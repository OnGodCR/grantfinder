'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Sidebar from './Sidebar'

export default function SidebarShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()

  // Gate all researcher pages: signed-in + onboarded only
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }
    const hasOnboarded = Boolean((user?.unsafeMetadata as any)?.hasOnboarded)
    if (!hasOnboarded) {
      router.replace('/onboarding')
    }
  }, [isLoaded, isSignedIn, user, router])

  if (!isLoaded || !isSignedIn) {
    return <div className="p-6">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex gap-6">
        <Sidebar />
        <main className="min-h-[70vh] flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
