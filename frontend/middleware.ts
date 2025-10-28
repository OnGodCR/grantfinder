// Authentication is handled by client-side guards in components like:
// - SidebarShell: protects authenticated routes
// - OnboardingGate: ensures users complete onboarding
// This middleware passes through all requests

export function middleware() {
  // No middleware logic needed - handled by components
}

export const config = {
  matcher: [],
}
