// frontend/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Keep middleware minimal and fail-open to avoid 500s.
 * We are NOT doing any user lookups or redirects here.
 * Clerk will attach auth to the request and we pass through.
 */
export default clerkMiddleware(() => {
  return NextResponse.next()
})

/**
 * Recommended matcher from Clerk/Next.js so middleware runs on app routes
 * but skips static assets and _next files.
 */
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
