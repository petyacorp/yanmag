import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  href?: string;
  external?: boolean;
}

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, href, external }: StatsCardProps) {
  const IconBox = () => {
    const iconContent = <Icon className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />;
    
    if (href) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center bg-[var(--color-yan-surface-elevated)] hover:bg-[var(--color-yan-red)] text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-ivory)] border border-[var(--color-yan-border)] transition-colors group cursor-pointer"
            title="Ver detalles"
          >
            {iconContent}
          </a>
        );
      }
      return (
        <Link
          href={href}
          className="w-10 h-10 flex items-center justify-center bg-[var(--color-yan-surface-elevated)] hover:bg-[var(--color-yan-red)] text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-ivory)] border border-[var(--color-yan-border)] transition-colors group cursor-pointer"
          title="Ver detalles"
        >
          {iconContent}
        </Link>
      );
    }

    return (
      <div className="w-10 h-10 flex items-center justify-center bg-[var(--color-yan-surface-elevated)] text-[var(--color-yan-charcoal)] border border-[var(--color-yan-border)]">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
    );
  };

  return (
    <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[11px] font-mono tracking-[0.2em] uppercase text-[var(--color-yan-stone)]">
          {title}
        </h3>
        <IconBox />
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-sans font-bold text-[var(--color-yan-charcoal)] tracking-tight">
          {value}
        </p>
        {trend && (
          <p className={`text-[13px] font-medium flex items-center gap-1 ${
            trendUp ? "text-emerald-600 dark:text-emerald-500" : "text-[var(--color-yan-red)]"
          }`}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </div>
    </div>
  );
}
