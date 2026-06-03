import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = url.origin;
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
              cookieStore.set(name, value, options);
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
      return response;
    }

    return NextResponse.redirect(`${origin}/auth/login?error=signin_failed`);
  } catch (e) {
    console.error('Unexpected error in /auth/signin route', e);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/auth/login?error=signin_failed`);
  }
}
