import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const code = searchParams.get('code');

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const headerOrigin = `${proto}://${host}`;

  // Use NEXT_PUBLIC_SITE_URL as the authoritative origin in production
  // to keep cookies on the correct domain (yanmag.cl, not yanmag.vercel.app)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = siteUrl && siteUrl.startsWith('http') ? siteUrl.replace(/\/$/, '') : headerOrigin;

  const cookieStore = await cookies();
  const next = searchParams.get('next') || cookieStore.get('sb-oauth-next')?.value || '/admin';

  let redirectUrl = `${origin}${next}`;
  const response = NextResponse.redirect(redirectUrl);

  if (code) {
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
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Auto-assign admin role to authorized emails
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const ADMIN_EMAILS = ['nicko.pereira@gmail.com', 'micko.pereira@gmail.com', 'gianfrandres@gmail.com', 'petyacorp@gmail.com'];
          if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
            const { error: roleError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', user.id);
            if (roleError) {
              console.error('[CALLBACK] Failed to auto-assign admin role:', roleError);
            } else {
              console.log(`[CALLBACK] Successfully auto-assigned admin role to ${user.email}`);
            }
          }
        }
      } catch (roleErr) {
        console.error('[CALLBACK] Error during auto-role assignment:', roleErr);
      }

      response.cookies.delete('sb-oauth-next');
      return response;
    } else {
      console.error('exchangeCodeForSession error:', error);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}

