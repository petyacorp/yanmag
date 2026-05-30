"use client";

import { Bell, Search, User, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserProfile } from "./UserProfile";
import { LogoutButton } from "./LogoutButton";

export default function AdminHeader() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  return (
    <header className="h-16 bg-[var(--color-yan-surface)] border-b border-[var(--color-yan-border)] flex items-center justify-between px-8 sticky top-0 z-10">
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

        <LogoutButton />
        
        <div className="flex items-center gap-3 pl-6 border-l border-[var(--color-yan-border)]">
          <UserProfile />
          <div className="h-9 w-9 rounded-none bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] flex items-center justify-center cursor-pointer hover:border-[var(--color-yan-red)] transition-colors">
            <User className="w-[18px] h-[18px] text-[var(--color-yan-charcoal)]" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </header>
  );
}
