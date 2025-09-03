// frontend/app/api/proxy/grants/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ✅ Your Railway backend URL comes from env variable
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

// ✅ Point to the right backend endpoint
// Change to /api/internal/grants if that's really your backend path
const UPSTREAM = `${BASE}/api/grants`;

// Function to forward requests to your backend
async function forwardToBackend(query: string, req: NextRequest) {
  // Forward Authorization header if present (for Clerk tokens)
  const auth = req.headers.get('authorization') ?? undefined;
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (auth) headers.authorization = auth;

  // Send POST { q } to your backend
  const upstreamRes = await fetch(UPSTREAM, {
    method: 'POST',
    headers,
    body: JSON.stringify({ q: query ?? '' }),
  });

  // Return backend response to the client
  const text = await upstreamRes.text();
  return new NextResponse(text, {
    status: upstreamRes.status,
    headers: { 'content-type': upstreamRes.headers.get('content-type') ?? 'application/json' },
  });
}

// Handle GET /api/proxy/grants?q=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  return forwardToBackend(q, req);
}

// Handle POST /api/proxy/grants with { q }
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
