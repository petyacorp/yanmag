'use client';

import { HeroArticle } from '@/components/ui/HeroArticle';
import { HeroCarousel } from '@/components/ui/HeroCarousel';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { useLocale } from '@/components/providers/LocaleProvider';

interface ArticleData {
  slug: string;
  title_es: string;
  title_en?: string;
  excerpt_es: string;
  excerpt_en?: string;
  coverImage: string;
  category?: {
    name_es: string;
    name_en?: string;
    slug: string;
    color?: string;
  } | null;
  date: Date | string;
  is_featured?: boolean;
}

interface HomePageClientProps {
  articles: ArticleData[];
  carouselArticles?: ArticleData[];
  siteSettings: {
    tagline_es?: string | null;
    tagline_en?: string | null;
    quote_author?: string | null;
  } | null;
  tickerItems?: {
    items_es: string[];
    items_en: string[];
  };
}

export function HomePageClient({ articles, carouselArticles, siteSettings, tickerItems }: HomePageClientProps) {
  const { locale, t } = useLocale();

  const isEs = locale === 'es';

  // Helper to localize an article
  const localizeArticle = (art: ArticleData) => {
    const title = isEs 
      ? art.title_es 
      : (art.title_en || art.title_es);
    
    const excerpt = isEs 
      ? art.excerpt_es 
      : (art.excerpt_en || art.excerpt_es || '');
    
    const catName = art.category
      ? (isEs ? art.category.name_es : (art.category.name_en || art.category.name_es))
      : 'Sin categoría';

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
      category: art.category ? {
        name: catName,
        slug: art.category.slug,
        color: art.category.color
      } : null,
      date: dateStr,
      is_featured: art.is_featured
    };
  };

  // Localize all articles
  const localizedArticles = articles.map(localizeArticle);

  // Localize carousel articles
  const localizedCarouselArticles = (carouselArticles || []).map(localizeArticle);

  // Determine hero: use carousel if available, else single hero
  const hasCarousel = localizedCarouselArticles.length > 0;

  // If no carousel, find a single hero article (first featured or first article)
  const heroArticle = !hasCarousel
    ? (localizedArticles.find(a => a.is_featured) || localizedArticles[0])
    : null;
  
  // Grid articles = all minus hero (if single hero mode) or all (carousel mode shows them all below)
  const gridArticles = hasCarousel
    ? localizedArticles
    : heroArticle 
      ? localizedArticles.filter(a => a.slug !== heroArticle.slug)
      : localizedArticles;

  // Ticker items: use DB items if available, fallback to translations
  const tickerTexts = (() => {
    const dbItems = isEs ? tickerItems?.items_es : tickerItems?.items_en;
    if (dbItems && dbItems.length > 0) return dbItems;
    return t.trending.items;
  })();

  // Localized tagline
  const tagline = siteSettings 
    ? (isEs ? siteSettings.tagline_es : (siteSettings.tagline_en || siteSettings.tagline_es))
    : t.editorial.quote;

  const quoteAuthor = siteSettings?.quote_author || t.editorial.author;

  return (
    <>
      {/* Hero Section */}
      {hasCarousel ? (
        <section className="-mt-24 md:-mt-32">
          <HeroCarousel slides={localizedCarouselArticles} />
        </section>
      ) : heroArticle ? (
        <section className="-mt-24 md:-mt-32">
          <HeroArticle {...heroArticle} />
        </section>
      ) : (
        <div className="h-[40vh] bg-[var(--color-yan-surface-elevated)] border-b border-[var(--color-yan-border)] flex items-center justify-center font-mono text-sm text-[var(--color-yan-stone)]">
          No hay artículos publicados todavía.
        </div>
      )}

      {/* Trending Strip (Dynamic Ticker) */}
      <div className="bg-[var(--color-yan-red)] text-[var(--color-yan-ivory)] overflow-hidden py-2 border-y border-[var(--color-yan-red-dark)]">
        <div className="animate-marquee whitespace-nowrap flex gap-12 font-mono text-[11px] tracking-[0.2em] uppercase">
          {tickerTexts.map((item, i) => (
            <span key={i}>
              {item}
              {i < tickerTexts.length - 1 && (
                <span className="opacity-50 ml-12">/</span>
              )}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {tickerTexts.map((item, i) => (
            <span key={`dup-${i}`}>
              {item}
              {i < tickerTexts.length - 1 && (
                <span className="opacity-50 ml-12">/</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-16 border-b border-[var(--color-yan-border)] pb-6">
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">{t.hero.latestStories}</h2>
          <span className="hidden md:block text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-stone)]">
            {t.hero.discoverMore}
          </span>
        </div>

        {gridArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
            {gridArticles.map((article) => (
              <ArticleCard key={article.slug} {...article} />
            ))}
          </div>
        ) : heroArticle ? null : (
          <div className="py-12 text-center font-mono text-xs text-[var(--color-yan-stone)]">
            No hay más publicaciones.
          </div>
        )}
      </section>
      
      {/* Editorial Block */}
      <section className="bg-[var(--color-yan-surface-elevated)] py-32 border-y border-[var(--color-yan-border)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-[1px] h-16 bg-[var(--color-yan-red)] mx-auto mb-12" />
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold mb-12 leading-[1.1] text-[var(--color-yan-charcoal)]">
            {tagline}
          </h2>
          <p className="font-mono text-[12px] text-[var(--color-yan-stone)] uppercase tracking-[0.2em]">
            — {quoteAuthor}
          </p>
        </div>
      </section>
    </>
  );
}
