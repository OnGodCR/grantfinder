import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'

export const metadata = {
export const metadata = {
  title: 'Grantlytic',
  description: 'AI-Powered Grant Discovery for Universities',
  openGraph: {
    title: 'Grantlytic',
    description: 'AI-Powered Grant Discovery for Universities',
    url: 'grantlytic.com',   // update after you set the domain
    siteName: 'Grantlytic',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grantlytic',
    description: 'AI-Powered Grant Discovery for Universities',
  },
};

}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
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
