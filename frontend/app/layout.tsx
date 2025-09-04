// frontend/app/layout.tsx
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Grantlytic',
  description: 'AI-powered grant discovery',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="mx-auto max-w-[1320px] px-4 py-6">
            <div className="flex gap-6">
              {/* Left rail */}
              <aside className="hidden md:block w-56 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 text-white/80">
                <div className="text-white font-semibold mb-4">GRANTALYTIC</div>
                <nav className="grid gap-1">
                  <a className="px-3 py-2 rounded-lg hover:bg-white/10" href="/discover">Discover</a>
                  <a className="px-3 py-2 rounded-lg hover:bg-white/10" href="/bookmarks">Bookmarks</a>
                  <a className="px-3 py-2 rounded-lg hover:bg-white/10" href="/notifications">Notifications</a>
                  <a className="px-3 py-2 rounded-lg hover:bg-white/10" href="/profile">Profile</a>
                </nav>
              </aside>

              {/* Main */}
              <div className="flex-1">
                {children}
              </div>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
