import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/features',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/debug(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  // Protects all routes including api/trpc routes
  // Please edit this to allow other routes to be public as needed.
  // See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring the Middleware
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
