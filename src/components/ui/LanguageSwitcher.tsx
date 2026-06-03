'use client';

import { Globe } from 'lucide-react';
import { useLocale } from '../providers/LocaleProvider';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.15em] uppercase"
      role="radiogroup"
      aria-label={t.lang.switchLabel}
    >
      <Globe className="w-[14px] h-[14px] text-[var(--color-yan-stone)] mr-1" strokeWidth={1.5} />
      <button
        onClick={() => setLocale('es')}
        className={`px-1 py-0.5 transition-colors duration-300 focus:outline-none relative ${
          locale === 'es'
            ? 'text-[var(--color-yan-red)]'
            : 'text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]'
        }`}
        role="radio"
        aria-checked={locale === 'es'}
      >
        ES
        {locale === 'es' && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-[1.5px] bg-[var(--color-yan-red)]" />
        )}
      </button>
      <span className="text-[var(--color-yan-border)] select-none">/</span>
      <button
        onClick={() => setLocale('en')}
        className={`px-1 py-0.5 transition-colors duration-300 focus:outline-none relative ${
          locale === 'en'
            ? 'text-[var(--color-yan-red)]'
            : 'text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]'
        }`}
        role="radio"
        aria-checked={locale === 'en'}
      >
        EN
        {locale === 'en' && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-[1.5px] bg-[var(--color-yan-red)]" />
        )}
      </button>
    </div>
  );
}
