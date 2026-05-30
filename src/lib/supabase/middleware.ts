import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // IMPORTANT: Do not remove this line. It refreshes the auth token.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect admin routes - must have user
    if (isAdminRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  } catch (e) {
    // If Supabase fails on admin routes, BLOCK access
    if (isAdminRoute) {
      console.error("Supabase auth check failed for admin route:", e);
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('error', 'auth_config_failed');
      return NextResponse.redirect(url);
    }
    // For public routes, just log and continue
    console.warn("Supabase middleware warning for non-admin route:", e);
  }

  return supabaseResponse;
}
