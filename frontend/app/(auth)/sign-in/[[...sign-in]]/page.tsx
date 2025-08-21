'use client'
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return <div className="max-w-md mx-auto mt-20 card"><SignIn /></div>
}
