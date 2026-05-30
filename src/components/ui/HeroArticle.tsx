import Image from 'next/image';
import Link from 'next/link';
import { CategoryBadge } from './CategoryBadge';

interface HeroArticleProps {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: {
    name: string;
    slug: string;
    color?: string;
  };
  date: string;
}

export function HeroArticle({ slug, title, excerpt, coverImage, category, date }: HeroArticleProps) {
  return (
    <article className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-end">
      <div className="absolute inset-0">
        <Image
          src={coverImage}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient overlay — warm charcoal, not pure black */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2522] via-[#2A2522]/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 lg:px-8 pb-16 md:pb-24">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <CategoryBadge
              name={category.name}
              slug={category.slug}
              color="#FDFCF9"
            />
            <span className="text-[11px] font-medium text-white/70 tracking-[0.15em] uppercase">
              {date}
            </span>
          </div>

          <Link href={`/articulo/${slug}`} className="block group">
            <h1 className="font-display text-4xl md:text-6xl lg:text-[72px] font-semibold text-[var(--color-yan-ivory)] leading-[1.1] mb-6 tracking-tight group-hover:text-[var(--color-yan-red-light)] transition-colors duration-500">
              {title}
            </h1>
          </Link>

          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl">
            {excerpt}
          </p>

          <Link
            href={`/articulo/${slug}`}
            className="inline-flex items-center gap-3 mt-8 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-ivory)] hover:text-[var(--color-yan-red-light)] hover:gap-5 transition-all duration-300"
          >
            Leer artículo
            <span className="inline-block w-8 h-[1px] bg-current" />
          </Link>
        </div>
      </div>
    </article>
  );
}
