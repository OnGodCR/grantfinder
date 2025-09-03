// frontend/app/api/proxy/grants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// 1) Your Railway base URL (set this in Vercel env)
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

// 2) Change to /api/internal/grants if that's your real backend path
const UPSTREAM = `${BASE}/api/grants`;

async function forwardToBackend(query: string, req: NextRequest) {
  // Forward Authorization if client sent one
  let authHeader = req.headers.get('authorization') ?? '';

  // If missing, mint a Clerk token on the server (for logged-in users)
  if (!authHeader) {
    try {
      const { getToken } = auth();
      const jwt = await getToken(); // use getToken({ template: 'backend' }) if you made a custom template
      if (jwt) authHeader = `Bearer ${jwt}`;
    } catch {
      // not logged in → backend may 401 and that's okay
    }
  }

  const upstream = await fetch(UPSTREAM, {
    method: 'POST',                         // <-- switch to 'GET' if your backend expects GET
    headers: {
      'content-type': 'application/json',
      ...(authHeader ? { authorization: authHeader } : {}),
    },
    body: JSON.stringify({ q: query ?? '' }), // if you switch to GET upstream, put q in the URL and remove body
    cache: 'no-store',
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  return forwardToBackend(q, req);
}

export async function POST(req: NextRequest) {
  let q = '';
  try {
    const data = await req.json();
    if (typeof data?.q === 'string') q = data.q;
  } catch {}
  if (!q) q = new URL(req.url).searchParams.get('q') ?? '';

  return forwardToBackend(q, req);
}
