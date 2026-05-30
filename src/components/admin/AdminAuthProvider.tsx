'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          setError('No estás autenticado');
          router.push('/auth/login?error=not_authenticated');
          return;
        }

        setUser({
          id: user.id,
          email: user.email || '',
          user_metadata: user.user_metadata,
        });
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Error al verificar autenticación');
        router.push('/auth/login?error=auth_check_failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-yan-ivory)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[var(--color-yan-border)] border-t-[var(--color-yan-red)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-yan-stone)]">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return null;
  }

  return <>{children}</>;
}
