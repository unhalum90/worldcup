import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ done: true });
  // 30-day cookie to bypass onboarding prompts
  res.cookies.set('wc26-onboarded', 'true', { maxAge: 60 * 60 * 24 * 30, path: '/' });
  return res;
}
