import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporarily disable Clerk middleware to debug the 500 error
export function middleware(request: NextRequest) {
  // Just pass through all requests for now
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
