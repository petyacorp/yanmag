import Link from 'next/link';

interface CategoryBadgeProps {
  name: string;
  slug: string;
  color?: string;
  className?: string;
}

export function CategoryBadge({ name, slug, color, className = '' }: CategoryBadgeProps) {
  return (
    <Link
      href={`/categoria/${slug}`}
      className={`inline-flex items-center text-[11px] font-medium tracking-[0.2em] uppercase transition-opacity duration-300 hover:opacity-70 ${className}`}
      style={{ color: color || 'var(--color-yan-red)' }}
    >
      <span
        className="w-[6px] h-[6px] rounded-full mr-2 flex-shrink-0"
        style={{ backgroundColor: color || 'var(--color-yan-red)' }}
      />
      {name}
    </Link>
  );
}
