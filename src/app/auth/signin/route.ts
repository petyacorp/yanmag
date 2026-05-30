import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = url.origin;
    const nextParam = url.searchParams.get('next') || '/admin';

    const supabase = await createClient();
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
      return NextResponse.redirect(data.url);
    }

    return NextResponse.redirect(`${origin}/auth/login?error=signin_failed`);
  } catch (e) {
    console.error('Unexpected error in /auth/signin route', e);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/auth/login?error=signin_failed`);
  }
}
