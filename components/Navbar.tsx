'use client'

import Link from 'next/link'
import Logo from './Logo'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useState } from 'react'
import { Menu } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[rgba(12,35,64,0.8)] backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/"><Logo /></Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8 text-body">
          <Link href="/features">Features</Link>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact Us</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in"
              className="rounded-full bg-mint px-5 py-2 font-medium text-navy hover:opacity-90">
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

        {/* Mobile */}
        <button
          className="md:hidden inline-flex items-center p-2 rounded-xl border border-white/10"
          onClick={() => setOpen(v => !v)}
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* Mobile sheet */}
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
