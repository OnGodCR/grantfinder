// frontend/app/layout.tsx
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import OnboardingGate from '@/components/OnboardingGate';

export const metadata = {
  title: 'Grantlytic',
  description: 'AI-powered grant discovery',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-slate-900">
          {/* 🔒 Gate: forces onboarding if needed */}
          <OnboardingGate />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
