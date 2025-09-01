'use client'

import { usePathname } from 'next/navigation'

/** Routes where the public navbar should be hidden (signed-in app shell) */
const HIDE_ON = [
  /^\/dashboard(\/.*)?$/,
  /^\/bookmarks(\/.*)?$/,
  /^\/notifications(\/.*)?$/,
  /^\/profile(\/.*)?$/,
]

export default function HideOnAuthedRoutes({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() || '/'
  const isAuthedArea = HIDE_ON.some((rx) => rx.test(pathname))
  if (isAuthedArea) return null
  return <>{children}</>
}
