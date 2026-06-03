'use client';

import { ArticleCard } from '@/components/ui/ArticleCard';
import { useLocale } from '@/components/providers/LocaleProvider';

interface CategoryPageClientProps {
  activeCategory: {
    id?: string;
    name?: string;
    name_es?: string;
    name_en?: string;
    slug: string;
    color: string;
  };
  displayArticles: {
    slug: string;
    title?: string;
    title_es?: string;
    title_en?: string;
    excerpt?: string;
    excerpt_es?: string;
    excerpt_en?: string;
    coverImage: string;
    category: {
      name?: string;
      name_es?: string;
      name_en?: string;
      slug: string;
      color?: string;
    };
    date: Date | string;
    featured?: boolean;
  }[];
}

export function CategoryPageClient({ activeCategory, displayArticles }: CategoryPageClientProps) {
  const { locale, t } = useLocale();

  const isEs = locale === 'es';
  const categoryName = isEs 
    ? (activeCategory.name_es || activeCategory.name || '') 
    : (activeCategory.name_en || activeCategory.name_es || activeCategory.name || '');

  const translatedName = t.nav[activeCategory.slug as keyof typeof t.nav] || categoryName;

  // Localize articles
  const localizedArticles = displayArticles.map(art => {
    const title = isEs 
      ? (art.title_es || art.title || '') 
      : (art.title_en || art.title_es || art.title || '');
    
    const excerpt = isEs 
      ? (art.excerpt_es || art.excerpt || '') 
      : (art.excerpt_en || art.excerpt_es || art.excerpt || '');
    
    const artCategoryName = isEs 
      ? (art.category.name_es || art.category.name || '') 
      : (art.category.name_en || art.category.name_es || art.category.name || '');

    const dateStr = typeof art.date === 'string'
      ? art.date
      : art.date.toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });

    return {
      slug: art.slug,
      title,
      excerpt,
      coverImage: art.coverImage,
      category: {
        name: artCategoryName,
        slug: art.category.slug,
        color: art.category.color
      },
      date: dateStr,
      featured: art.featured
    };
  });

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

      {localizedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {localizedArticles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center font-mono text-sm text-[var(--color-yan-stone)] border border-dashed border-[var(--color-yan-border)]">
          No hay artículos publicados en esta categoría.
        </div>
      )}
      
      {localizedArticles.length > 0 && (
        <div className="mt-32 pt-16 border-t border-[var(--color-yan-border)] flex justify-center">
          <button className="group flex items-center gap-4 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] transition-colors">
            {t.category.loadMore}
            <span className="w-12 h-[1px] bg-current group-hover:w-16 transition-all duration-300" />
          </button>
        </div>
      )}
    </div>
  );
}
