// frontend/app/onboarding/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function OnboardingPage() {
  return (
    <div className="text-white space-y-4">
      <h1 className="text-2xl font-semibold">Onboarding</h1>

      <SignedIn>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          (Coming soon) We’ll ask a few questions to tailor your grant matches.
        </div>
      </SignedIn>

      <SignedOut>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          Please sign in to start onboarding. <SignInButton />
        </div>
      </SignedOut>
    </div>
  );
}
