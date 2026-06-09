'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, LogOut, LayoutDashboard, ChevronDown, Settings } from 'lucide-react';
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

  const fetchProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Auth error in UserProfile:', authError);
      }

      if (user) {
        // Query database profile
        const { data: dbProfile, error } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Profile query error:', error);
        }

        if (dbProfile) {
          setProfile({
            name: dbProfile.full_name || user.email?.split('@')[0] || 'Usuario',
            email: dbProfile.email || user.email || '',
            avatar_url: dbProfile.avatar_url || '',
          });
        } else {
          // Fallback to auth metadata
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
          setProfile({
            name: typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : 'Usuario',
            email: user.email || '',
            avatar_url: user.user_metadata?.avatar_url || '',
          });
        }
      } else {
        // No user - set a fallback so the button still renders
        setProfile({
          name: 'Usuario',
          email: '',
          avatar_url: '',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set fallback profile so the component still renders
      setProfile({
        name: 'Usuario',
        email: '',
        avatar_url: '',
      });
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [fetchProfile]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    // Use setTimeout to avoid the same click that opens the dropdown from closing it
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [dropdownOpen]);

  const displayName = profile?.name || 'Usuario';
  const displayEmail = profile?.email || '';
  const avatarUrl = profile?.avatar_url || '';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile trigger button - always visible */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDropdownOpen((prev) => !prev);
        }}
        className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        id="user-profile-button"
      >
        {!loading && (
          <div className="text-right hidden md:block">
            <p className="text-[13px] font-medium text-[var(--color-yan-charcoal)] group-hover:text-[var(--color-yan-red)] transition-colors">
              {displayName}
            </p>
            {displayEmail && (
              <p className="text-[11px] text-[var(--color-yan-stone)] font-mono uppercase tracking-widest mt-0.5 truncate max-w-[120px]">
                {displayEmail}
              </p>
            )}
          </div>
        )}

        {loading && (
          <div className="text-right hidden md:block space-y-1">
            <div className="h-4 w-24 bg-[var(--color-yan-border)] animate-pulse" />
            <div className="h-3 w-16 bg-[var(--color-yan-border)] animate-pulse" />
          </div>
        )}

        <div
          className={`h-9 w-9 bg-[var(--color-yan-surface-elevated)] border flex items-center justify-center overflow-hidden relative transition-colors ${
            dropdownOpen ? 'border-[var(--color-yan-red)]' : 'border-[var(--color-yan-border)] group-hover:border-[var(--color-yan-red)]'
          }`}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
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

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] shadow-xl z-[100]"
          style={{ opacity: 1 }}
          role="menu"
        >
          {/* User info header - visible on mobile and always as context */}
          <div className="p-3.5 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)]">
            <p className="text-[12px] font-medium text-[var(--color-yan-charcoal)] truncate">{displayName}</p>
            {displayEmail && (
              <p className="text-[10px] text-[var(--color-yan-stone)] font-mono truncate mt-0.5">{displayEmail}</p>
            )}
          </div>
          
          <ul className="py-1.5" role="none">
            <li role="none">
              <Link
                href="/admin/perfil"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] hover:bg-[var(--color-yan-surface-elevated)] transition-colors font-mono uppercase tracking-wider"
                role="menuitem"
              >
                <User className="w-4 h-4 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
                Mi Perfil
              </Link>
            </li>
            <li role="none">
              <Link
                href="/admin"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] hover:bg-[var(--color-yan-surface-elevated)] transition-colors font-mono uppercase tracking-wider"
                role="menuitem"
              >
                <LayoutDashboard className="w-4 h-4 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
                Dashboard
              </Link>
            </li>
            <li role="none">
              <Link
                href="/admin/configuracion"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] hover:bg-[var(--color-yan-surface-elevated)] transition-colors font-mono uppercase tracking-wider"
                role="menuitem"
              >
                <Settings className="w-4 h-4 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
                Configuración
              </Link>
            </li>
            <li className="border-t border-[var(--color-yan-border)] mt-1 pt-1" role="none">
              <button
                type="button"
                onClick={async () => {
                  setDropdownOpen(false);
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs text-left text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] hover:bg-[var(--color-yan-surface-elevated)] transition-colors font-mono uppercase tracking-wider cursor-pointer"
                role="menuitem"
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
