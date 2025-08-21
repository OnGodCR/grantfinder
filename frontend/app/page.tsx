import Link from 'next/link'

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto mt-20 space-y-6">
      <h1 className="text-4xl font-bold">GrantFinder</h1>
      <p className="opacity-80">AI-powered discovery and collaboration for research funding.</p>
      <div className="flex gap-4">
        <Link className="btn" href="/dashboard">Go to Dashboard</Link>
        <Link className="btn" href="/sign-in">Sign in</Link>
      </div>
    </main>
  )
}
