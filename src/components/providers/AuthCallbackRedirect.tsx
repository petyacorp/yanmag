'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthCallbackRedirect() {
  const router = useRouter();
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
      }
    }
  }, [pathname]);

  return null;
}
