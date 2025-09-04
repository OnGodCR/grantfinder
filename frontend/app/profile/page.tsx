// frontend/app/profile/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <div className="text-white space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <SignedIn>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div><strong>Name:</strong> {user?.fullName ?? '—'}</div>
          <div><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress ?? '—'}</div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          Please sign in to view your profile. <SignInButton />
        </div>
      </SignedOut>
    </div>
  );
}
