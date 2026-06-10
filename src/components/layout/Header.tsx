'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { ThemeToggle } from '../ui/ThemeToggle';
import { SearchModal } from '../ui/SearchModal';
import { useLocale } from '../providers/LocaleProvider';

import { getCategories } from '@/lib/actions/categories';

const CATEGORY_KEYS = ['diseno', 'cultura', 'moda', 'arquitectura', 'entrevistas', 'musica', 'videojuegos', 'cine-tv'] as const;

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<{ id?: string; name: string; slug: string }[]>([]);
  const { locale, t } = useLocale();
  const [logoPath, setLogoPath] = useState('/Logo1 no background.png');

  useEffect(() => {
    const logos = [
      '/Logo1 no background.png',
      '/Logo2 no background.png',
      '/Logo3 no background.png',
      '/Logo4 no background.png',
      '/Logo5 no background.png'
    ];
    const randomIndex = Math.floor(Math.random() * logos.length);
    setLogoPath(logos[randomIndex]);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Set fallback categories first
    const fallbackCategories = CATEGORY_KEYS.map((key) => ({
      name: t.nav[key],
      slug: key,
    }));
    setCategories(fallbackCategories);

    // Fetch real categories from Supabase
    getCategories()
      .then((dbCats) => {
        if (isMounted && dbCats && dbCats.length > 0) {
          const filteredCats = dbCats.filter((c: any) => c.slug !== 'system-pizarra');
          const mappedCats = filteredCats.map((cat: any) => ({
            id: cat.id,
            name: locale === 'es' ? cat.name_es : (cat.name_en || cat.name_es),
            slug: cat.slug,
          }));
          setCategories(mappedCats);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories in Header:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [locale, t.nav]);

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
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-6">

          {/* === LEFT COLUMN: Desktop Logo / Mobile Hamburger === */}
          <div className="flex items-center">
            {/* Mobile: hamburger menu */}
            <button
              className="lg:hidden text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] transition-colors p-1"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label={t.nav.openMenu}
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Desktop: Logo on the left */}
            <Link href="/" className="hidden lg:flex items-center">
              <img 
                src={logoPath} 
                alt="YAN MAG Logo" 
                className={`w-auto object-contain dark:invert transition-all duration-500 ${
                  isScrolled ? 'h-10 xl:h-12' : 'h-20 xl:h-24'
                }`}
              />
            </Link>
          </div>

          {/* === CENTER COLUMN: Desktop Categories / Mobile Logo === */}
          <div className="flex items-center justify-center lg:justify-start">
            {/* Mobile logo centered */}
            <Link href="/" className="lg:hidden flex justify-center items-center">
              <img 
                src={logoPath} 
                alt="YAN MAG Logo" 
                className="h-10 sm:h-12 w-auto object-contain dark:invert" 
              />
            </Link>

            {/* Desktop: Navigation categories to the right of the logo */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 ml-6 xl:ml-10">
              {categories.map((cat) => (
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

          {/* === RIGHT COLUMN: Global Controls === */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 lg:gap-5">
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
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                <img 
                  src={logoPath} 
                  alt="YAN MAG Logo" 
                  className="h-8 w-auto object-contain dark:invert" 
                />
              </Link>
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
