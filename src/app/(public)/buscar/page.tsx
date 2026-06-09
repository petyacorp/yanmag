'use client';

import { useSearchParams } from 'next/navigation';
import { searchArticles } from '@/lib/actions/articles';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { Suspense, useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

function SearchResults() {
  const { locale } = useLocale();
  const isEs = locale === 'es';

  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      try {
        setLoading(true);
        const dbArticles = await searchArticles(query);

        // Map articles to localized format for ArticleCard
        const mapped = dbArticles.map((art: any) => {
          const title = isEs ? art.title_es : (art.title_en || art.title_es);
          const excerpt = isEs ? (art.excerpt_es || '') : (art.excerpt_en || art.excerpt_es || '');
          const catName = isEs ? art.category?.name_es : (art.category?.name_en || art.category?.name_es);
          const dateStr = new Date(art.published_at || art.created_at).toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });

          return {
            slug: art.slug,
            title,
            excerpt,
            coverImage: art.cover_image || '/placeholder-image.jpg',
            category: art.category ? {
              name: catName,
              slug: art.category.slug,
              color: art.category.color || '#A6342A'
            } : null,
            date: dateStr
          };
        });

        setResults(mapped);
      } catch (e) {
        console.error('Search failed:', e);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query, isEs]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-24 min-h-[70vh]">
      <header className="mb-16 md:mb-24 pb-8 border-b border-[var(--color-yan-border)]">
        <div className="flex items-center gap-4 mb-6">
          <Search className="w-5 h-5 text-[var(--color-yan-red)]" strokeWidth={1.5} />
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[var(--color-yan-stone)]">
            Búsqueda
          </span>
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl font-semibold mb-6">
          {query ? `"${query}"` : 'Buscar en YAN MAG'}
        </h1>
        
        <p className="text-lg text-[var(--color-yan-stone)] font-light">
          {loading ? (
            'Buscando publicaciones...'
          ) : query ? (
            `${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`
          ) : (
            'Ingresa un término para explorar nuestro archivo.'
          )}
        </p>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-10 h-10 text-[var(--color-yan-red)] animate-spin" />
        </div>
      ) : query && results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {results.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      ) : query ? (
        <div className="py-24 flex flex-col items-start max-w-2xl">
          <h2 className="font-display text-3xl font-medium mb-4">Sin resultados</h2>
          <p className="text-[var(--color-yan-stone)] leading-relaxed">
            No hemos encontrado artículos que coincidan con tu búsqueda. Intenta con palabras clave más generales o explora nuestras categorías principales.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center font-display text-2xl text-[var(--color-yan-stone)]">
        Cargando...
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
