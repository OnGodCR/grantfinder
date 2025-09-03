// frontend/app/api/proxy/grants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

// 1) Read your Railway base URL from env (set on Vercel)
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

// 2) Point to the REAL backend route.
//    If your backend route is /api/internal/grants, change the line below accordingly.
const UPSTREAM = `${BASE}/api/grants`;

// Helper: forward a query string to the backend as POST { q }
async function forwardToBackend(query: string, req: NextRequest) {
  // (A) If the client already sent Authorization, forward it.
  let authHeader = req.headers.get('authorization') ?? '';

  // (B) If not, mint a Clerk token server-side and use it.
  if (!authHeader) {
    try {
      const { getToken } = auth();
      const jwt = await getToken(); // if you use a custom template, do getToken({ template: 'backend' })
      if (jwt) authHeader = `Bearer ${jwt}`;
    } catch {
      // No Clerk session available (public page / logged out). That's OK; backend may still 401.
    }
  }

  const upstream = await fetch(UPSTREAM, {
    method: 'POST', // <-- change to 'GET' if your backend expects GET
    headers: {
      'content-type': 'application/json',
      ...(authHeader ? { authorization: authHeader } : {}),
    },
    body: JSON.stringify({ q: query ?? '' }), // if you switch to GET upstream, move q into the URL instead
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  return forwardToBackend(q, req);
}

export async function POST(req: NextRequest) {
  let q = '';
  try {
    const data = await req.json();
    if (typeof data?.q === 'string') q = data.q;
  } catch {}

  if (!q) {
    const { searchParams } = new URL(req.url);
    q = searchParams.get('q') ?? '';
  }

  return forwardToBackend(q, req);
}
