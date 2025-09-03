import { NextResponse } from 'next/server';

const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
// Point at the route that returns 200 in your Railway logs
const TARGET = `${BASE}/api/internal/grants`;

/** Pass-through GET -> backend GET */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  const targetUrl = qs ? `${TARGET}?${qs}` : TARGET;

  try {
    const res = await fetch(targetUrl, {
      // forward auth if you start requiring it server-side
      headers: {
        // Keep it harmless if header is missing
        Authorization: req.headers.get('authorization') ?? '',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ message: 'Upstream error contacting backend' }, { status: 502 });
  }
}

/** Pass-through POST -> backend POST (handy if you later add POST searches) */
export async function POST(req: Request) {
  try {
    const body = await req.text(); // forward raw body
    const res = await fetch(TARGET, {
      method: 'POST',
      headers: {
        'content-type': req.headers.get('content-type') ?? 'application/json',
        Authorization: req.headers.get('authorization') ?? '',
      },
      body,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ message: 'Upstream error contacting backend' }, { status: 502 });
  }
}
