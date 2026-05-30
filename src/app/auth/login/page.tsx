'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    const next = '/admin';
    window.location.href = `/auth/signin?next=${encodeURIComponent(next)}`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-yan-ivory)] flex flex-col justify-center items-center px-6">
      {/* Signature Red Spine for visual continuity */}
      <div className="yan-spine hidden md:block" />

      <div className="w-full max-w-md bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-10 md:p-14 shadow-2xl relative">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--color-yan-red)]" />

        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <span className="font-display text-4xl font-semibold tracking-[0.02em] text-[var(--color-yan-charcoal)]">
              YAN MAG
            </span>
          </Link>
          <h1 className="text-xl font-display font-medium text-[var(--color-yan-charcoal)] mb-2">
            Portal Editorial
          </h1>
          <p className="text-[13px] text-[var(--color-yan-stone)] font-mono tracking-wide">
            Acceso exclusivo para editores
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] py-4 px-6 hover:bg-[var(--color-yan-red)] transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
             <span className="w-5 h-5 border-2 border-[var(--color-yan-ivory)]/30 border-t-[var(--color-yan-ivory)] rounded-full animate-spin" />
          ) : (
            <>
              {/* Simple Google G icon SVG */}
              <svg className="w-5 h-5 text-current group-hover:text-[var(--color-yan-ivory)] transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
              </svg>
              <span className="text-sm font-medium tracking-wide">Acceder con Google</span>
            </>
          )}
        </button>

        <div className="mt-8 text-center border-t border-[var(--color-yan-border)] pt-8">
          <Link href="/" className="text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-stone)] hover:text-[var(--color-yan-red)] transition-colors">
            &larr; Volver a la revista
          </Link>
        </div>
      </div>
    </div>
  );
}
