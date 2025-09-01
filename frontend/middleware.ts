// frontend/middleware.ts
import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Only gate /dashboard (and anything under it)
const needsOnboarding = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  try {
    // If this path isn't protected, just continue
    if (!needsOnboarding(req)) {
      return NextResponse.next()
    }

    const { userId, redirectToSignIn } = auth()

    // Not signed in -> send to sign-in
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url })
    }

    // Read the onboarding flag (either public or unsafe)
    const user = await clerkClient.users.getUser(userId)
    const hasOnboarded =
      Boolean((user.publicMetadata as any)?.hasOnboarded) ||
      Boolean((user.unsafeMetadata as any)?.hasOnboarded)

    if (!hasOnboarded) {
      const url = new URL('/onboarding', req.url)
      return NextResponse.redirect(url)
    }

    // User is good, continue
    return NextResponse.next()
  } catch {
    // Fail open so your site never goes down because of middleware
    return NextResponse.next()
  }
})

// Clerk’s recommended matcher: run on everything except static files and _next,
// and also include root + api routes.
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
