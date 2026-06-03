'use client';

import Image from 'next/image';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { useLocale } from '@/components/providers/LocaleProvider';

interface ArticlePageClientProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;
    category: { name: string; slug: string; color?: string };
    date: string;
  };
}

export function ArticlePageClient({ article }: ArticlePageClientProps) {
  const { t } = useLocale();

  const translatedCategoryName = t.nav[article.category.slug as keyof typeof t.nav] || article.category.name;

  return (
    <article className="pb-32 bg-[var(--color-yan-ivory)]">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col items-start gap-6 mb-12">
          <CategoryBadge name={translatedCategoryName} slug={article.category.slug} color={article.category.color} />
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-[72px] font-semibold leading-[1.05] tracking-tight">
            {article.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--color-yan-charcoal)]/80 leading-relaxed max-w-3xl font-light mt-4">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center gap-6 pt-8 border-t border-[var(--color-yan-border)]">
          <div className="w-12 h-12 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] overflow-hidden">
             <div className="w-full h-full bg-[var(--color-yan-stone)]/20" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-semibold text-lg leading-tight">Elena Vargas</span>
            <span className="text-[11px] font-mono text-[var(--color-yan-stone)] tracking-widest uppercase mt-1">
              {article.date}
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="w-full max-w-[1200px] mx-auto px-6 mb-20 md:mb-32">
        <div className="relative w-full aspect-[21/9] overflow-hidden bg-[var(--color-yan-surface-elevated)]">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>
        <figcaption className="text-left text-[11px] text-[var(--color-yan-stone)] mt-4 font-mono tracking-wide">
          {t.article.photography}
        </figcaption>
      </div>

      {/* Content */}
      <div className="max-w-[720px] mx-auto px-6">
        <div className="prose-yan prose prose-lg md:prose-xl font-light">
          <p className="lead text-2xl md:text-3xl font-display mb-12 text-[var(--color-yan-charcoal)] leading-relaxed">
            En un mundo saturado de estímulos visuales, la búsqueda de la simplicidad no significa necesariamente una renuncia a la expresión. Así nace el minimalismo máximo.
          </p>
          
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>

          <h2 className="text-3xl font-display font-semibold mt-16 mb-8">La evolución de la forma</h2>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>

          <blockquote className="my-16 pl-8 border-l-[3px] border-[var(--color-yan-red)]">
            <p className="text-2xl font-display font-medium italic text-[var(--color-yan-charcoal)] leading-snug m-0">
              &quot;La verdadera elegancia consiste en no hacerse notar, sino en ser recordado.&quot;
            </p>
          </blockquote>

          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>

          <h3 className="text-2xl font-display font-semibold mt-12 mb-6">Materialidad consciente</h3>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
        </div>

        {/* Tags */}
        <div className="mt-24 pt-8 border-t border-[var(--color-yan-border)] flex gap-4 flex-wrap items-center">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-yan-stone)]">
            {t.article.archivedIn}
          </span>
          {[translatedCategoryName, 'Tendencias', 'Contemporáneo'].map(tag => (
            <span key={tag} className="px-3 py-1.5 text-[11px] font-mono tracking-widest bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] text-[var(--color-yan-charcoal)] hover:border-[var(--color-yan-red)] hover:text-[var(--color-yan-red)] transition-colors cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
