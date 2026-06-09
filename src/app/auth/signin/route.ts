import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
    const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = `${proto}://${host}`;
    const nextParam = url.searchParams.get('next') || '/admin';

    const cookieStore = await cookies();
    const cookiesToSetList: Array<{ name: string; value: string; options: any }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {
                // Safe ignore for GET Route Handlers
              }
              cookiesToSetList.push({ name, value, options });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextParam)}`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.error('Error initiating Google OAuth:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=signin_failed`);
    }

    if (data?.url) {
      const response = NextResponse.redirect(data.url);
      cookiesToSetList.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      
      // Store the destination in a cookie
      response.cookies.set('sb-oauth-next', nextParam, {
        path: '/',
        secure: proto === 'https',
        maxAge: 600,
        sameSite: 'lax',
      });
      
      return response;
    }

    return NextResponse.redirect(`${origin}/auth/login?error=signin_failed`);
  } catch (e) {
    console.error('Unexpected error in /auth/signin route', e);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
    const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = `${proto}://${host}`;
    return NextResponse.redirect(`${origin}/auth/login?error=signin_failed`);
  }
}
