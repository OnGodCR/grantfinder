import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/about',
    '/contact',
    '/features',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/debug(.*)',
  ],
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
