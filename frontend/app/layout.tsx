import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Grantlytic',
  description: 'AI-Powered Grant Discovery for Universities',
  openGraph: {
    title: 'Grantlytic',
    description: 'AI-Powered Grant Discovery for Universities',
    // Update this to your live domain once set:
    url: 'https://grantlytic.vercel.app',
    siteName: 'Grantlytic',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grantlytic',
    description: 'AI-Powered Grant Discovery for Universities',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="text-text">
          <Navbar />
          <main>{children}</main>
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
