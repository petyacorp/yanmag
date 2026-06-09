"use client";

import { useState, useTransition } from "react";
import { Star, Layers, Loader2, Image as ImageIcon } from "lucide-react";
import { updateFeaturedPosition } from "@/lib/actions/articles";
import Link from "next/link";

interface FeaturedArticle {
  id: string;
  slug: string;
  title_es: string;
  title_en: string | null;
  cover_image: string | null;
  status: string;
  is_featured: boolean;
  featured_position: string | null;
  category: { name_es: string; slug: string; color: string } | null;
  published_at: string | null;
  created_at: string;
}

interface FeaturedManagerProps {
  articles: FeaturedArticle[];
}

export default function FeaturedManager({ articles: initialArticles }: FeaturedManagerProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const carouselCount = articles.filter(a => a.featured_position === 'carousel').length;
  const heroArticle = articles.find(a => a.featured_position === 'hero_featured');

  const handlePositionChange = (articleId: string, position: string) => {
    const newPosition = position === '' ? null : position as 'carousel' | 'hero_featured';
    
    setUpdatingId(articleId);
    setError(null);

    startTransition(async () => {
      try {
        await updateFeaturedPosition(articleId, newPosition);
        
        // Update local state
        setArticles(prev => prev.map(a => {
          // If setting hero_featured, clear any existing hero_featured
          if (newPosition === 'hero_featured' && a.featured_position === 'hero_featured' && a.id !== articleId) {
            return { ...a, featured_position: null };
          }
          if (a.id === articleId) {
            return { ...a, featured_position: newPosition };
          }
          return a;
        }));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error al actualizar';
        setError(msg);
      } finally {
        setUpdatingId(null);
      }
    });
  };

  return (
    <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)]">
      <div className="px-6 py-5 border-b border-[var(--color-yan-border)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold text-[var(--color-yan-charcoal)] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--color-yan-red)]" strokeWidth={1.5} />
            Posiciones Destacadas
          </h2>
          <p className="text-xs text-[var(--color-yan-stone)] mt-1">
            Elige qué artículos aparecen en el carrusel y en la posición hero de la portada.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
            <div className={`w-2 h-2 rounded-full ${carouselCount >= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="text-[var(--color-yan-stone)]">
              Carrusel: <span className="text-[var(--color-yan-charcoal)] font-bold">{carouselCount}/5</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
            <Star className={`w-3 h-3 ${heroArticle ? 'text-[var(--color-yan-red)]' : 'text-[var(--color-yan-stone)]'}`} strokeWidth={1.5} />
            <span className="text-[var(--color-yan-stone)]">
              Hero: <span className="text-[var(--color-yan-charcoal)] font-bold">{heroArticle ? '1/1' : '0/1'}</span>
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-mono">
          {error}
          <button onClick={() => setError(null)} className="ml-3 font-bold hover:text-red-800">×</button>
        </div>
      )}

      <div className="divide-y divide-[var(--color-yan-border)] max-h-[500px] overflow-y-auto">
        {articles.map((article) => (
          <div
            key={article.id}
            className={`px-6 py-3.5 flex items-center gap-4 transition-colors ${
              article.featured_position ? 'bg-[var(--color-yan-surface-elevated)]' : 'hover:bg-[var(--color-yan-surface-elevated)]'
            }`}
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 shrink-0 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] overflow-hidden">
              {article.cover_image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={article.cover_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-[var(--color-yan-stone)]" />
                </div>
              )}
            </div>

            {/* Article info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-medium text-[var(--color-yan-charcoal)] truncate leading-tight">
                <Link 
                  href={`/admin/articulos/${article.id}/editar`}
                  className="hover:text-[var(--color-yan-red)] hover:underline transition-colors"
                >
                  {article.title_es}
                </Link>
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {article.category && (
                  <span 
                    className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border"
                    style={{ 
                      color: article.category.color,
                      borderColor: `${article.category.color}30`
                    }}
                  >
                    {article.category.name_es}
                  </span>
                )}
                <span className="text-[10px] text-[var(--color-yan-stone)]">
                  {new Date(article.published_at || article.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>

            {/* Position selector */}
            <div className="shrink-0 flex items-center gap-2">
              {updatingId === article.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-[var(--color-yan-red)]" />
              ) : (
                <select
                  value={article.featured_position || ''}
                  onChange={(e) => handlePositionChange(article.id, e.target.value)}
                  disabled={isPending}
                  className={`text-[11px] font-medium bg-[var(--color-yan-surface)] border rounded-none px-2.5 py-1.5 outline-none transition-colors cursor-pointer ${
                    article.featured_position === 'carousel'
                      ? 'border-[var(--color-yan-red)] text-[var(--color-yan-red)]'
                      : article.featured_position === 'hero_featured'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-[var(--color-yan-border)] text-[var(--color-yan-stone)]'
                  }`}
                >
                  <option value="">Normal</option>
                  <option value="carousel" disabled={carouselCount >= 5 && article.featured_position !== 'carousel'}>
                    📸 Carrusel {carouselCount >= 5 && article.featured_position !== 'carousel' ? '(Lleno)' : ''}
                  </option>
                  <option value="hero_featured">⭐ Hero</option>
                </select>
              )}
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div className="px-6 py-12 text-center text-[var(--color-yan-stone)] font-mono text-xs">
            No hay artículos publicados para asignar posiciones.
          </div>
        )}
      </div>
    </div>
  );
}
