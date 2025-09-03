// frontend/app/api/proxy/grants/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
const UPSTREAM = `${BASE}/api/internal/grants`; // <-- this is the one that returns 200 on Railway

async function forwardToBackend(query: string, req: NextRequest) {
  // Pass through an auth header if the frontend has one (Clerk etc.)
  const auth = req.headers.get('authorization') ?? undefined;
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (auth) headers.authorization = auth;

  // Your backend expects POST here
  const upstreamRes = await fetch(UPSTREAM, {
    method: 'POST',
    headers,
    body: JSON.stringify({ q: query ?? '' }),
  });

  // Bubble up backend status/body
  const text = await upstreamRes.text();
  return new NextResponse(text, {
    status: upstreamRes.status,
    headers: { 'content-type': upstreamRes.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  return forwardToBackend(q, req);
}

export async function POST(req: NextRequest) {
  // Accept either ?q=… or { q } in body
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
