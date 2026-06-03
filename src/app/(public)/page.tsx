import { getArticles } from '@/lib/actions/articles';
import { getSiteSettings } from '@/lib/actions/settings';
import { HomePageClient } from './HomePageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch site settings
  const siteSettings = await getSiteSettings();

  // Fetch published articles (limit to 10 for the homepage grid)
  const { articles: dbArticles } = await getArticles({
    status: 'published',
    limit: 10
  });

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
      category: {
        name_es: art.category?.name_es || 'Sin categoría',
        name_en: art.category?.name_en || art.category?.name_es || 'Uncategorized',
        slug: art.category?.slug || 'general',
        color: art.category?.color || '#A6342A'
      },
      date: new Date(art.published_at || art.created_at),
      is_featured: art.is_featured
    };
  });

  return (
    <HomePageClient 
      articles={articles}
      siteSettings={siteSettings}
    />
  );
}
