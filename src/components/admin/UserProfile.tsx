'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileState {
  name: string;
  email: string;
  avatar_url: string;
}

export function UserProfile() {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <div className="text-right hidden md:block">
          <p className="text-[13px] font-medium text-[var(--color-yan-charcoal)] group-hover:text-[var(--color-yan-red)] transition-colors">
            {profile.name}
          </p>
          <p className="text-[11px] text-[var(--color-yan-stone)] font-mono uppercase tracking-widest mt-0.5 truncate max-w-[120px]">
            {profile.email}
          </p>
        </div>
        <div
          className={`h-9 w-9 rounded-none bg-[var(--color-yan-surface-elevated)] border flex items-center justify-center overflow-hidden relative transition-colors ${
            dropdownOpen ? 'border-[var(--color-yan-red)]' : 'border-[var(--color-yan-border)] group-hover:border-[var(--color-yan-red)]'
          }`}
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-[18px] h-[18px] text-[var(--color-yan-charcoal)]" strokeWidth={1.5} />
          )}
        </div>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-[var(--color-yan-stone)] transition-transform duration-200 ${
            dropdownOpen ? 'rotate-180 text-[var(--color-yan-red)]' : 'group-hover:text-[var(--color-yan-charcoal)]'
          }`} 
          strokeWidth={1.5} 
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2.5 w-52 bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 rounded-none">
          <div className="p-3 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] md:hidden">
            <p className="text-[12px] font-medium text-[var(--color-yan-charcoal)] truncate">{profile.name}</p>
            <p className="text-[10px] text-[var(--color-yan-stone)] font-mono truncate mt-0.5">{profile.email}</p>
          </div>
          
          <ul className="py-1.5">
            <li>
              <Link
                href="/admin/perfil"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] hover:bg-[var(--color-yan-surface-elevated)] transition-colors font-mono uppercase tracking-wider"
              >
                <User className="w-4 h-4 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
                Mi Perfil
              </Link>
            </li>
            <li>
              <Link
                href="/admin"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] hover:bg-[var(--color-yan-surface-elevated)] transition-colors font-mono uppercase tracking-wider"
              >
                <LayoutDashboard className="w-4 h-4 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
                Dashboard
              </Link>
            </li>
            <li>
              <button
                onClick={async () => {
                  setDropdownOpen(false);
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-left text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] hover:bg-[var(--color-yan-surface-elevated)] transition-colors font-mono uppercase tracking-wider cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}


