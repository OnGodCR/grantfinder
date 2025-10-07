import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Disable Clerk middleware to avoid 500 error
export function middleware(request: NextRequest) {
  // Just pass through all requests
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
