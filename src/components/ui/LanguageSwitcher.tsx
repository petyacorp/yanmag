'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<'es' | 'en'>('es');

  const toggleLocale = () => {
    setLocale((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] uppercase text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors duration-300 focus:outline-none"
      aria-label="Cambiar idioma"
    >
      <Globe className="w-[14px] h-[14px]" strokeWidth={1.5} />
      <span>{locale}</span>
    </button>
  );
}
