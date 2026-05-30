'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function UserProfile() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
          setUser({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: user.email || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="h-9 w-9 rounded-none bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="text-right hidden md:block">
        <p className="text-[13px] font-medium text-[var(--color-yan-charcoal)]">{user.name}</p>
        <p className="text-[11px] text-[var(--color-yan-stone)] font-mono uppercase tracking-widest mt-0.5 truncate max-w-[120px]">
          {user.email}
        </p>
      </div>
    </>
  );
}
