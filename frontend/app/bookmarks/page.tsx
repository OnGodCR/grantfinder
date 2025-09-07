// frontend/app/bookmarks/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function BookmarksPage() {
  return (
    <div className="text-white space-y-4">
      <h1 className="text-2xl font-semibold">Bookmarks</h1>

      <SignedIn>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          (Coming soon) Your saved grants will appear here.
        </div>
      </SignedIn>

      <SignedOut>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          Please sign in to see bookmarks. <SignInButton />
        </div>
      </SignedOut>
    </div>
  );
}
