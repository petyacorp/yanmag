"use client";

import { Bell, Search, Moon, Sun } from "lucide-react";
import { UserProfile } from "./UserProfile";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function AdminHeader() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="h-16 bg-[var(--color-yan-surface)] border-b border-[var(--color-yan-border)] flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center bg-[var(--color-yan-surface-elevated)] px-4 py-2 w-80 border border-[var(--color-yan-border)] focus-within:border-[var(--color-yan-red)] transition-colors">
        <Search className="w-4 h-4 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Buscar artículos o autores..."
          className="bg-transparent border-none outline-none ml-3 text-[13px] w-full text-[var(--color-yan-charcoal)] placeholder:text-[var(--color-yan-stone)]"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button 
          onClick={toggleTheme}
          className="text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" strokeWidth={1.5} /> : <Moon className="w-5 h-5" strokeWidth={1.5} />}
        </button>
        
        <button className="text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors relative">
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[var(--color-yan-red)] rounded-full"></span>
        </button>
        
        <div className="flex items-center pl-6 border-l border-[var(--color-yan-border)]">
          <UserProfile />
        </div>
      </div>
    </header>
  );
}

