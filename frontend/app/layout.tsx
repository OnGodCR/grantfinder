import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* Make the entire site use the same dark navy background as the header */}
        <body className="bg-navy text-text min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="mt-20 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-4 py-10 text-body">
              © {new Date().getFullYear()} Grantlytic
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  )
}
