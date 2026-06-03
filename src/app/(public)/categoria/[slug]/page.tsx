import { getArticles } from '@/lib/actions/articles';
import { getCategoryBySlug } from '@/lib/actions/categories';
import { MOCK_ARTICLES, MOCK_CATEGORIES } from '@/lib/mockData';
import { CategoryPageClient } from './CategoryPageClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // Try fetching category from database
  const dbCategory = await getCategoryBySlug(resolvedParams.slug);

  if (!dbCategory) {
    // Try mock fallback
    const mockCategory = Object.values(MOCK_CATEGORIES).find(c => c.slug === resolvedParams.slug);
    if (!mockCategory) {
      notFound();
    }
    const articles = MOCK_ARTICLES.filter(a => a.category.slug === mockCategory.slug);
    const displayArticles = articles.length > 0 ? articles : MOCK_ARTICLES;

    return (
      <CategoryPageClient
        activeCategory={mockCategory}
        displayArticles={displayArticles}
      />
    );
  }

  // Fetch real articles for this category from database
  const { articles: dbArticles } = await getArticles({
    categoryId: dbCategory.id,
    status: 'published'
  });

  // Map category to format expected by CategoryPageClient
  const activeCategory = {
    id: dbCategory.id,
    slug: dbCategory.slug,
    name_es: dbCategory.name_es,
    name_en: dbCategory.name_en || dbCategory.name_es,
    description_es: dbCategory.description_es || '',
    description_en: dbCategory.description_en || dbCategory.description_es || '',
    color: dbCategory.color || '#A6342A',
    icon: dbCategory.icon || 'newspaper'
  };

  // Map articles to format expected by ArticleCard
  const displayArticles = dbArticles.map(art => {
    const dateObj = new Date(art.published_at || art.created_at);
    return {
      id: art.id,
      slug: art.slug,
      title_es: art.title_es,
      title_en: art.title_en || art.title_es,
      excerpt_es: art.excerpt_es || '',
      excerpt_en: art.excerpt_en || art.excerpt_es || '',
      coverImage: art.cover_image || '/placeholder-image.jpg',
      category: {
        name_es: dbCategory.name_es,
        name_en: dbCategory.name_en || dbCategory.name_es,
        slug: dbCategory.slug,
        color: dbCategory.color
      },
      date: dateObj
    };
  });

  return (
    <CategoryPageClient
      activeCategory={activeCategory as any}
      displayArticles={displayArticles as any}
    />
  );
}
