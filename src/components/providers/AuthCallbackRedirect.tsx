'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AuthCallbackRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      // If code is in query params and we are not on the auth callback page,
      // redirect to the callback page with the code.
      if (code && pathname !== '/auth/callback') {
        const next = searchParams.get('next') || '';
        let targetUrl = `/auth/callback?code=${code}`;
        if (next) {
          targetUrl += `&next=${encodeURIComponent(next)}`;
        }
        window.location.href = targetUrl;
        return;
      }

      // Handle Supabase Hash Fragment (Implicit Grant Flow)
      if (window.location.hash) {
        const hash = window.location.hash.substring(1); // remove '#'
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          const supabase = createClient();
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          }).then(({ error }) => {
            if (!error) {
              // Clean the hash from the URL and redirect to admin
              window.location.hash = '';
              window.location.href = '/admin';
            } else {
              console.error('Failed to set session from hash:', error);
            }
          });
        }
      }
    }
  }, [pathname]);

  return null;
}
