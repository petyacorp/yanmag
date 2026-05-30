"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, FolderTree, File, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Artículos", href: "/admin/articulos", icon: FileText },
  { name: "Categorías", href: "/admin/categorias", icon: FolderTree },
  { name: "Páginas", href: "/admin/paginas", icon: File },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`bg-[var(--color-yan-surface)] border-r border-[var(--color-yan-border)] h-screen sticky top-0 transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-yan-border)]">
        {!isCollapsed && (
          <Link href="/admin">
            <span className="text-xl font-display font-semibold tracking-[0.02em] text-[var(--color-yan-charcoal)]">
              YAN MAG
            </span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/admin" className="mx-auto">
            <span className="text-xl font-display font-semibold text-[var(--color-yan-red)]">Y</span>
          </Link>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-none transition-all duration-300 border-l-[3px] ${
                    isActive
                      ? "bg-[var(--color-yan-surface-elevated)] text-[var(--color-yan-red)] border-[var(--color-yan-red)]"
                      : "text-[var(--color-yan-stone)] border-transparent hover:bg-[var(--color-yan-surface-elevated)] hover:text-[var(--color-yan-charcoal)]"
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                  {!isCollapsed && (
                    <span className="ml-4 text-[13px] font-medium tracking-wide">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[var(--color-yan-border)]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center w-full px-4 py-3 text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-[18px] h-[18px] mx-auto" strokeWidth={1.5} /> : (
            <>
              <ChevronLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
              <span className="ml-4 text-[13px] font-medium tracking-wide">Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
