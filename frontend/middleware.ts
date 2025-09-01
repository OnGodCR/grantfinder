// Minimal, fail-safe middleware that can’t crash the site.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_req: NextRequest) {
  // Always pass through
  return NextResponse.next()
}

// Recommended matcher: run on app routes but skip static assets and _next files.
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
