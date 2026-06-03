import { MOCK_ARTICLES } from '@/lib/mockData';
import { ArticlePageClient } from './ArticlePageClient';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = MOCK_ARTICLES.find(a => a.slug === resolvedParams.slug) || MOCK_ARTICLES[0];

  return <ArticlePageClient article={article} />;
}
