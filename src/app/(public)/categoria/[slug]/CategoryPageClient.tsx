'use client';

import { ArticleCard } from '@/components/ui/ArticleCard';
import { useLocale } from '@/components/providers/LocaleProvider';

interface CategoryPageClientProps {
  activeCategory: {
    name: string;
    slug: string;
    color: string;
  };
  displayArticles: {
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;
    category: { name: string; slug: string; color?: string };
    date: string;
    featured?: boolean;
  }[];
}

export function CategoryPageClient({ activeCategory, displayArticles }: CategoryPageClientProps) {
  const { t } = useLocale();

  const translatedName = t.nav[activeCategory.slug as keyof typeof t.nav] || activeCategory.name;

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-24">
      <header className="mb-20 md:mb-32 max-w-4xl">
        <div className="flex items-center gap-6 mb-8">
          <div 
            className="w-12 h-[2px]"
            style={{ backgroundColor: activeCategory.color || 'var(--color-yan-red)' }}
          />
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[var(--color-yan-stone)]">
            {t.category.label}
          </span>
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl lg:text-[80px] font-semibold mb-8 tracking-tight capitalize text-[var(--color-yan-charcoal)]">
          {translatedName}
        </h1>
        
        <p className="text-xl md:text-2xl text-[var(--color-yan-charcoal)]/70 leading-relaxed font-light max-w-2xl">
          {t.category.explore} {translatedName.toLowerCase()}.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
        {displayArticles.map((article) => (
          <ArticleCard key={article.slug} {...article} />
        ))}
        {displayArticles.map((article) => (
          <ArticleCard key={`${article.slug}-dup`} {...article} />
        ))}
      </div>
      
      <div className="mt-32 pt-16 border-t border-[var(--color-yan-border)] flex justify-center">
        <button className="group flex items-center gap-4 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] transition-colors">
          {t.category.loadMore}
          <span className="w-12 h-[1px] bg-current group-hover:w-16 transition-all duration-300" />
        </button>
      </div>
    </div>
  );
}
