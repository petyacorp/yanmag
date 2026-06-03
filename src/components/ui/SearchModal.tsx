'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from '../providers/LocaleProvider';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery('');
    }
  };

  const trendingTags = [t.nav.diseno, t.nav.arquitectura, t.nav.cultura, t.nav.entrevistas];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-[var(--color-yan-charcoal)]/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl mx-6 bg-[var(--color-yan-ivory)] border border-[var(--color-yan-border)] shadow-xl animate-fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.search}
      >
        {/* Red accent at top */}
        <div className="h-[2px] bg-[var(--color-yan-red)]" />

        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors"
            aria-label={t.search.close}
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <form onSubmit={handleSearch}>
            <div className="relative flex items-center">
              <Search className="absolute left-0 w-5 h-5 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search.placeholder}
                className="w-full py-3 pl-9 pr-4 text-xl font-display bg-transparent border-b border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] focus:outline-none transition-colors placeholder:text-[var(--color-yan-stone)]"
              />
            </div>

            <div className="mt-8">
              <span className="text-[11px] font-medium tracking-[0.2em] text-[var(--color-yan-stone)] uppercase">
                {t.search.trending}
              </span>
              <div className="flex flex-wrap gap-2 mt-3">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      router.push(`/buscar?q=${encodeURIComponent(tag)}`);
                      onClose();
                      setQuery('');
                    }}
                    className="px-4 py-2 text-[12px] font-medium tracking-wide text-[var(--color-yan-charcoal)] border border-[var(--color-yan-border)] hover:border-[var(--color-yan-red)] hover:text-[var(--color-yan-red)] transition-colors duration-300"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
