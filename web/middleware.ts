import { NextResponse, NextRequest } from 'next/server';

// No-op middleware — avoids runtime issues in production while we iterate.
// This passes requests through without modifying them. We'll re-enable
// full i18n middleware after confirming the deployment is serving.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
