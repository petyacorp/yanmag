import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get('code');

  console.log(`[PROXY MIDDLEWARE] Path: ${url.pathname}, Search: ${url.search}, Code: ${code}`);

  if (code && url.pathname !== '/auth/callback') {
    console.log(`[PROXY MIDDLEWARE] Redirecting to /auth/callback with code`);
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
