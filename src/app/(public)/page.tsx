import { getArticles, getCarouselArticles, getHeroFeaturedArticle } from '@/lib/actions/articles';
import { getSiteSettings, getTickerItems } from '@/lib/actions/settings';
import { HomePageClient } from './HomePageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch site settings
  const siteSettings = await getSiteSettings();

  // Fetch ticker items from DB
  const tickerItems = await getTickerItems();

  // Fetch carousel articles and the hero article
  let carouselDbArticles: Awaited<ReturnType<typeof getCarouselArticles>> = [];
  try {
    const [carousel, hero] = await Promise.all([
      getCarouselArticles(),
      getHeroFeaturedArticle().catch(() => null)
    ]);
    
    if (hero) {
      // Put the hero article first, and filter it out from the remaining carousel articles if present
      carouselDbArticles = [hero, ...carousel.filter(a => a.id !== hero.id)];
    } else {
      carouselDbArticles = carousel;
    }
  } catch {
    // Column may not exist yet if migration hasn't run
    carouselDbArticles = [];
  }

  // Fetch published articles (limit to 10 for the homepage grid)
  const { articles: dbArticles } = await getArticles({
    status: 'published',
    limit: 10
  });

  // Map carousel articles to client format
  const carouselArticles = carouselDbArticles.map(art => ({
    id: art.id,
    slug: art.slug,
    title_es: art.title_es,
    title_en: art.title_en || art.title_es,
    excerpt_es: art.excerpt_es || '',
    excerpt_en: art.excerpt_en || art.excerpt_es || '',
    coverImage: art.cover_image || '/placeholder-image.jpg',
    category: art.category ? {
      name_es: art.category.name_es,
      name_en: art.category.name_en || art.category.name_es,
      slug: art.category.slug,
      color: art.category.color || '#A6342A'
    } : null,
    date: new Date(art.published_at || art.created_at),
    is_featured: art.is_featured
  }));

  // Map articles to the client format
  const articles = dbArticles.map(art => {
    return {
      id: art.id,
      slug: art.slug,
      title_es: art.title_es,
      title_en: art.title_en || art.title_es,
      excerpt_es: art.excerpt_es || '',
      excerpt_en: art.excerpt_en || art.excerpt_es || '',
      coverImage: art.cover_image || '/placeholder-image.jpg',
      category: art.category ? {
        name_es: art.category.name_es,
        name_en: art.category.name_en || art.category.name_es,
        slug: art.category.slug,
        color: art.category.color || '#A6342A'
      } : null,
      date: new Date(art.published_at || art.created_at),
      is_featured: art.is_featured
    };
  });

  return (
    <HomePageClient 
      articles={articles}
      carouselArticles={carouselArticles}
      siteSettings={siteSettings}
      tickerItems={tickerItems}
    />
  );
}
