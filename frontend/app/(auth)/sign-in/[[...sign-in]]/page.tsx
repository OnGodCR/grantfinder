'use client'
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Access your personalized grant recommendations
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-mint hover:bg-mint/90 text-navy text-sm normal-case',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-white',
                headerSubtitle: 'text-slate-400',
                socialButtonsBlockButton: 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600',
                formFieldInput: 'bg-slate-700 border-slate-600 text-white',
                footerActionLink: 'text-mint hover:text-mint/80',
                identityPreviewText: 'text-slate-300',
                formFieldLabel: 'text-slate-300',
                dividerLine: 'bg-slate-600',
                dividerText: 'text-slate-400',
              }
            }}
            redirectUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  )
}
