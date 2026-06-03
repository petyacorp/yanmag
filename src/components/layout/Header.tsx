'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import { SearchModal } from '../ui/SearchModal';
import { useLocale } from '../providers/LocaleProvider';

const CATEGORY_KEYS = ['diseno', 'cultura', 'moda', 'arquitectura', 'entrevistas'] as const;

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = CATEGORY_KEYS.map((key) => ({
    name: t.nav[key],
    slug: key,
  }));

  return (
    <>
      <header
        className={`fixed top-0 left-0 lg:left-[var(--spine-width)] right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[var(--color-yan-ivory)]/95 backdrop-blur-md py-3 lg:py-4 border-b border-[var(--color-yan-border-light)] shadow-[0_1px_8px_rgba(0,0,0,0.04)]'
            : 'bg-transparent py-4 lg:py-6'
        }`}
      >
        {/* 
          Use CSS Grid with 3 columns: [left] [center logo] [right]
          1fr auto 1fr ensures the logo is truly centered 
        */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center gap-4 lg:gap-6">

          {/* === LEFT COLUMN === */}
          <div className="flex items-center">
            {/* Mobile: hamburger menu */}
            <button
              className="lg:hidden text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] transition-colors p-1"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label={t.nav.openMenu}
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Desktop: left nav links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {categories.slice(0, 3).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="yan-nav-link text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] transition-colors duration-300 whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* === CENTER COLUMN — Logo === */}
          <Link href="/" className="flex justify-center">
            <span className="font-display text-[24px] sm:text-[28px] lg:text-[32px] font-semibold tracking-[0.02em] whitespace-nowrap">
              YAN
              <span className="font-light mx-0.5 sm:mx-1"> </span>
              MAG
            </span>
          </Link>

          {/* === RIGHT COLUMN === */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 lg:gap-5">
            {/* Desktop: right nav links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mr-2">
              {categories.slice(3).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="yan-nav-link text-[11px] font-medium tracking-[0.18em] uppercase text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] transition-colors duration-300 whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Language switcher — hidden on very small screens, shown in mobile menu instead */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <div className="w-[1px] h-4 bg-[var(--color-yan-border)] hidden sm:block" />

            <ThemeToggle />

            <div className="w-[1px] h-4 bg-[var(--color-yan-border)] hidden sm:block" />

            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] transition-colors duration-300 p-1"
              aria-label={t.nav.search}
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[var(--color-yan-charcoal)]/30 backdrop-blur-sm transition-opacity duration-500 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-[320px] max-w-[85vw] bg-[var(--color-yan-ivory)] border-r border-[var(--color-yan-border)] transition-transform duration-500 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Red spine inside mobile menu */}
          <div className="absolute top-0 left-0 bottom-0 w-[var(--spine-width)] bg-[var(--color-yan-red)]" />

          <div className="flex flex-col h-full pl-[calc(var(--spine-width)+24px)] pr-6 py-8">
            <div className="flex justify-between items-center mb-16">
              <span className="font-display text-2xl font-semibold tracking-[0.02em]">
                YAN MAG
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[var(--color-yan-stone)] hover:text-[var(--color-yan-red)] transition-colors"
                aria-label={t.nav.closeMenu}
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="py-3 text-[13px] font-medium tracking-[0.15em] uppercase text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] hover:pl-2 transition-all duration-300 border-b border-[var(--color-yan-border-light)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-6">
              <hr className="yan-rule" />
              <div className="flex items-center justify-between">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <p className="text-[11px] text-[var(--color-yan-stone)] tracking-wide">
                © {new Date().getFullYear()} YAN MAG
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
