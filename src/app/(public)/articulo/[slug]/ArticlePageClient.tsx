'use client';

import Image from 'next/image';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { useLocale } from '@/components/providers/LocaleProvider';

interface ArticlePageClientProps {
  article: {
    slug: string;
    title_es: string;
    title_en: string;
    excerpt_es: string;
    excerpt_en: string;
    content_es: string;
    content_en: string;
    coverImage: string;
    category?: {
      name_es: string;
      name_en: string;
      slug: string;
      color?: string;
    } | null;
    date: Date | string;
    author: {
      full_name: string;
      avatar_url?: string;
    };
    tags: Array<{ name_es: string; name_en?: string }>;
  };
}

export function ArticlePageClient({ article }: ArticlePageClientProps) {
  const { locale, t } = useLocale();

  // Select language fields
  const isEs = locale === 'es';
  const title = isEs ? article.title_es : article.title_en;
  const excerpt = isEs ? article.excerpt_es : article.excerpt_en;
  const content = isEs ? article.content_es : article.content_en;
  const categoryName = article.category 
    ? (isEs ? article.category.name_es : article.category.name_en) 
    : 'Sin categoría';

  const translatedCategoryName = article.category 
    ? (t.nav[article.category.slug as keyof typeof t.nav] || categoryName) 
    : categoryName;

  // Format date
  const dateStr = typeof article.date === 'string'
    ? article.date
    : article.date.toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  // Render markdown to simple HTML
  function renderMarkdownToHtml(markdown: string) {
    if (!markdown) return '<p class="text-[var(--color-yan-stone)] italic">Sin contenido...</p>';
    
    let html = markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-md font-bold font-display mt-8 mb-2 text-[var(--color-yan-charcoal)]">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold font-display mt-10 mb-4 border-b border-[var(--color-yan-border)] pb-2 text-[var(--color-yan-charcoal)]">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold font-display mt-12 mb-6 text-[var(--color-yan-charcoal)]">$1</h1>')
      // Images
      .replace(/\!\[(.*?)\]\((.*?)\)/gim, '<img class="my-6 max-w-full border border-[var(--color-yan-border)]" src="$2" alt="$1" />')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a class="text-[var(--color-yan-red)] hover:underline font-medium" href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-[var(--color-yan-red)] pl-6 py-2 my-6 italic text-[var(--color-yan-stone)] bg-[var(--color-yan-surface-elevated)]">$1</blockquote>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      // Paragraph splits
      .split(/\n{2,}/g)
      .map(p => {
        const trimmed = p.trim();
        if (trimmed.startsWith('<h') || trimmed.startsWith('<img') || trimmed.startsWith('<blockquote')) {
          return p;
        }
        return `<p class="mb-5 text-[15px] md:text-[17px] leading-relaxed text-[var(--color-yan-charcoal)]/90">${p.replace(/\n/g, '<br />')}</p>`;
      })
      .join('');

    return html;
  }

  return (
    <article className="pb-32 bg-[var(--color-yan-ivory)]">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col items-start gap-6 mb-12">
          {article.category && article.category.slug && (
            <CategoryBadge name={translatedCategoryName} slug={article.category.slug} color={article.category.color} />
          )}
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-[72px] font-semibold leading-[1.05] tracking-tight text-[var(--color-yan-charcoal)]">
            {title}
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--color-yan-charcoal)]/80 leading-relaxed max-w-3xl font-light mt-4">
            {excerpt}
          </p>
        </div>

        <div className="flex items-center gap-6 pt-8 border-t border-[var(--color-yan-border)]">
          <div className="w-12 h-12 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] overflow-hidden rounded-full relative">
            {article.author.avatar_url ? (
              <Image src={article.author.avatar_url} alt={article.author.full_name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-[var(--color-yan-stone)]/20 flex items-center justify-center text-[var(--color-yan-stone)] font-display font-semibold">
                {article.author.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-display font-semibold text-lg leading-tight">{article.author.full_name}</span>
            <span className="text-[11px] font-mono text-[var(--color-yan-stone)] tracking-widest uppercase mt-1">
              {dateStr}
            </span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="w-full max-w-[1200px] mx-auto px-6 mb-20 md:mb-32">
          <div className="relative w-full aspect-[21/9] overflow-hidden bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)]">
            <Image
              src={article.coverImage}
              alt={title}
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
      )}

      {/* Content */}
      <div className="max-w-[720px] mx-auto px-6">
        <div 
          className="prose-yan prose prose-lg md:prose-xl font-light"
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }}
        />

        {/* Tags */}
        {(article.tags.length > 0 || (article.category && article.category.slug)) && (
          <div className="mt-24 pt-8 border-t border-[var(--color-yan-border)] flex gap-4 flex-wrap items-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-yan-stone)]">
              {t.article.archivedIn}
            </span>
            {article.tags.length > 0 ? (
              article.tags.map(tag => {
                const tagName = isEs ? tag.name_es : (tag.name_en || tag.name_es);
                return (
                  <span key={tagName} className="px-3 py-1.5 text-[11px] font-mono tracking-widest bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] text-[var(--color-yan-charcoal)] hover:border-[var(--color-yan-red)] hover:text-[var(--color-yan-red)] transition-colors cursor-pointer">
                    {tagName}
                  </span>
                );
              })
            ) : (
              <span className="px-3 py-1.5 text-[11px] font-mono tracking-widest bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] text-[var(--color-yan-charcoal)]">
                {translatedCategoryName}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
