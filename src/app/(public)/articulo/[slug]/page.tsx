import { getArticleBySlug } from '@/lib/actions/articles';
import { MOCK_ARTICLES } from '@/lib/mockData';
import { ArticlePageClient } from './ArticlePageClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const dbArticle = await getArticleBySlug(resolvedParams.slug);

  if (!dbArticle) {
    // Try mock data
    const mockArticle = MOCK_ARTICLES.find(a => a.slug === resolvedParams.slug);
    if (!mockArticle) {
      notFound();
    }
    
    return <ArticlePageClient article={{
      slug: mockArticle.slug,
      title_es: mockArticle.title,
      title_en: mockArticle.title,
      excerpt_es: mockArticle.excerpt,
      excerpt_en: mockArticle.excerpt,
      content_es: '',
      content_en: '',
      coverImage: mockArticle.coverImage,
      category: {
        name_es: mockArticle.category.name,
        name_en: mockArticle.category.name,
        slug: mockArticle.category.slug,
        color: mockArticle.category.color
      },
      date: mockArticle.date,
      author: { full_name: 'Redacción YAN MAG' },
      tags: []
    } as any} />;
  }

  // Format date
  const dateObj = new Date(dbArticle.published_at || dbArticle.created_at);

  return (
    <ArticlePageClient 
      article={{
        slug: dbArticle.slug,
        title_es: dbArticle.title_es,
        title_en: dbArticle.title_en || dbArticle.title_es,
        excerpt_es: dbArticle.excerpt_es || '',
        excerpt_en: dbArticle.excerpt_en || dbArticle.excerpt_es || '',
        content_es: dbArticle.content_es || '',
        content_en: dbArticle.content_en || dbArticle.content_es || '',
        coverImage: dbArticle.cover_image || '/placeholder-image.jpg',
        category: {
          name_es: dbArticle.category?.name_es || 'Sin categoría',
          name_en: dbArticle.category?.name_en || dbArticle.category?.name_es || 'Uncategorized',
          slug: dbArticle.category?.slug || 'general',
          color: dbArticle.category?.color || '#A6342A'
        },
        date: dateObj,
        author: {
          full_name: dbArticle.author?.full_name || 'Redacción YAN MAG',
          avatar_url: dbArticle.author?.avatar_url
        },
        tags: dbArticle.tags || []
      } as any} 
    />
  );
}
