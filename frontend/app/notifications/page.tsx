// frontend/app/notifications/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function NotificationsPage() {
  return (
    <div className="text-white space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>

      <SignedIn>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          (Coming soon) Deadline alerts and new matches will appear here.
        </div>
      </SignedIn>

      <SignedOut>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          Please sign in to see notifications. <SignInButton />
        </div>
      </SignedOut>
    </div>
  );
}
