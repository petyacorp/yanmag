import { MOCK_ARTICLES, MOCK_CATEGORIES } from '@/lib/mockData';
import { CategoryPageClient } from './CategoryPageClient';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const category = Object.values(MOCK_CATEGORIES).find(c => c.slug === resolvedParams.slug);

  const activeCategory = category || MOCK_CATEGORIES.moda;
  const articles = MOCK_ARTICLES.filter(a => a.category.slug === activeCategory.slug);
  const displayArticles = articles.length > 0 ? articles : MOCK_ARTICLES;

  return (
    <CategoryPageClient
      activeCategory={activeCategory}
      displayArticles={displayArticles}
    />
  );
}
