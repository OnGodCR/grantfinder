import { NextResponse } from 'next/server';

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').toString();
  return NextResponse.json({
    NEXT_PUBLIC_BACKEND_URL: base,
    ok: !!base && base.startsWith('http'),
  });
}
