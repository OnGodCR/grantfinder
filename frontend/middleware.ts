import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'

/** Protect dashboard (and anything under it). Add more paths if needed. */
const needsOnboarding = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!needsOnboarding(req)) return

  const { userId, redirectToSignIn } = auth()

  // Not signed in? Send them to sign in first.
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // Look up the current user and read the flag we set during onboarding
  const user = await clerkClient.users.getUser(userId)
  const hasOnboarded = Boolean((user.publicMetadata as any)?.hasOnboarded)

  if (!hasOnboarded) {
    const url = new URL('/onboarding', req.url)
    return Response.redirect(url)
  }
})

/** Run on all routes except Next.js assets and static files */
export const config = {
  matcher: [
    '/((?!_next|favicon.ico|icon.png|apple-icon|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)).*)',
  ],
}
