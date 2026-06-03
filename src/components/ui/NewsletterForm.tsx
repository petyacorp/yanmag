'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useLocale } from '../providers/LocaleProvider';

interface NewsletterFormProps {
  variant?: 'light' | 'dark';
}

export function NewsletterForm({ variant = 'light' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const { t } = useLocale();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  const isDark = variant === 'dark';

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 py-4">
        <CheckCircle className="w-5 h-5 text-[var(--color-yan-red)] flex-shrink-0" />
        <p className={`text-sm ${isDark ? 'text-[var(--color-yan-ivory)]' : 'text-[var(--color-yan-charcoal)]'}`}>
          {t.newsletter.success}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.newsletter.placeholder}
          required
          className={`flex-1 py-3 px-4 text-sm border focus:outline-none focus:border-[var(--color-yan-red)] transition-colors ${
            isDark
              ? 'bg-transparent border-white/20 text-[var(--color-yan-ivory)] placeholder:text-white/40'
              : 'bg-[var(--color-yan-surface)] border-[var(--color-yan-border)] text-[var(--color-yan-charcoal)] placeholder:text-[var(--color-yan-stone)]'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-5 py-3 bg-[var(--color-yan-red)] text-[var(--color-yan-ivory)] hover:bg-[var(--color-yan-red-dark)] transition-colors duration-300 disabled:opacity-50 flex items-center"
          aria-label={t.newsletter.subscribe}
        >
          {status === 'loading' ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
      <p className={`text-[11px] tracking-wide ${isDark ? 'text-white/30' : 'text-[var(--color-yan-stone)]'}`}>
        {t.newsletter.disclaimer}
      </p>
    </form>
  );
}
