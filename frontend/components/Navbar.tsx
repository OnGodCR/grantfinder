'use client'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useState } from 'react'

function Logo() {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-mint text-navy">↗</span>
      <span>Grantlytic AI</span>
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-[rgba(12,35,64,0.8)] backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/"><Logo /></Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-body">
          <Link href="/features">Features</Link>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact Us</Link>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in" className="rounded-full bg-mint px-5 py-2 font-medium text-navy hover:opacity-90">
              Log in
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="rounded-full border border-mint px-5 py-2 font-medium hover:bg-white/5">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center p-2 rounded-xl border border-white/10"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {/* simple hamburger icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-4 text-body">
            <Link href="/features" onClick={() => setOpen(false)}>Features</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About Us</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact Us</Link>
            <SignedOut>
              <Link href="/sign-in" onClick={() => setOpen(false)}
                className="rounded-xl bg-mint px-5 py-2 font-medium text-navy w-max">Log in</Link>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3">
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="rounded-xl border border-mint px-5 py-2 font-medium w-max hover:bg-white/5">Dashboard</Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  )
}
