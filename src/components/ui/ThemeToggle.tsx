'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { useLocale } from '../providers/LocaleProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-8 h-8 flex items-center justify-center text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] transition-colors duration-300 focus:outline-none group"
      aria-label={theme === 'dark' ? t.theme.toggleLight : t.theme.toggleDark}
      title={theme === 'dark' ? t.theme.toggleLight : t.theme.toggleDark}
    >
      {/* Sun icon — visible in dark mode */}
      <Sun
        className={`w-[18px] h-[18px] absolute transition-all duration-500 ease-out ${
          theme === 'dark'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-50'
        }`}
        strokeWidth={1.5}
      />
      {/* Moon icon — visible in light mode */}
      <Moon
        className={`w-[18px] h-[18px] absolute transition-all duration-500 ease-out ${
          theme === 'light'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-50'
        }`}
        strokeWidth={1.5}
      />
    </button>
  );
}
