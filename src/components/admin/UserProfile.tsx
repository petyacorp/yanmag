'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User } from 'lucide-react';

interface ProfileState {
  name: string;
  email: string;
  avatar_url: string;
}

export function UserProfile() {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Query database profile
        const { data: dbProfile, error } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('id', user.id)
          .single();

        if (dbProfile) {
          setProfile({
            name: dbProfile.full_name || user.email?.split('@')[0] || 'Usuario',
            email: dbProfile.email || user.email || '',
            avatar_url: dbProfile.avatar_url || '',
          });
        } else {
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
          setProfile({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: user.email || '',
            avatar_url: '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // Listen to custom profile update event
    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block space-y-1">
          <div className="h-4 w-24 bg-[var(--color-yan-border-light)] animate-pulse rounded-none" />
          <div className="h-3 w-16 bg-[var(--color-yan-border-light)] animate-pulse rounded-none" />
        </div>
        <div className="h-9 w-9 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] animate-pulse rounded-none" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden md:block">
        <p className="text-[13px] font-medium text-[var(--color-yan-charcoal)]">{profile.name}</p>
        <p className="text-[11px] text-[var(--color-yan-stone)] font-mono uppercase tracking-widest mt-0.5 truncate max-w-[120px]">
          {profile.email}
        </p>
      </div>
      <Link
        href="/admin/perfil"
        className="h-9 w-9 rounded-none bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] flex items-center justify-center cursor-pointer hover:border-[var(--color-yan-red)] transition-colors overflow-hidden relative"
        title="Mi Perfil"
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-[18px] h-[18px] text-[var(--color-yan-charcoal)]" strokeWidth={1.5} />
        )}
      </Link>
    </div>
  );
}

