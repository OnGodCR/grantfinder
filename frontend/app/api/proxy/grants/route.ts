import { NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';

export async function GET(req: Request) {
  const { search } = new URL(req.url);
  const url = `${API}/grants${search}`;

  const res = await fetch(url, {
    // Forward auth if you need it:
    // headers: { Authorization: req.headers.get('authorization') || '' },
    // Make sure backend allows server requests with no Origin
    cache: 'no-store',
  });

  const data = await res.text(); // keep as text to pass through status
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
  });
}
