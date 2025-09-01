'use client'

import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import HideOnAuthedRoutes from '@/components/HideOnAuthedRoutes'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-gradient-to-b from-[#0A0F1F] to-[#0F1B2D] text-text antialiased">
        <ClerkProvider>
          {/* Show the public navbar on marketing pages only */}
          <HideOnAuthedRoutes>
            <Navbar />
          </HideOnAuthedRoutes>

          <main>{children}</main>

          <footer className="mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-4 py-10 text-body">
              © {new Date().getFullYear()} Grantlytic
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  )
}
