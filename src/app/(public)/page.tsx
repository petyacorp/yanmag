import { HeroArticle } from '@/components/ui/HeroArticle';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { MOCK_ARTICLES } from '@/lib/mockData';

export default function HomePage() {
  const heroArticle = MOCK_ARTICLES[0];
  const gridArticles = MOCK_ARTICLES.slice(1);

  return (
    <>
      <section className="-mt-24 md:-mt-32">
        <HeroArticle {...heroArticle} />
      </section>

      {/* Trending Strip */}
      <div className="bg-[var(--color-yan-red)] text-[var(--color-yan-ivory)] overflow-hidden py-2 border-y border-[var(--color-yan-red-dark)]">
        <div className="animate-marquee whitespace-nowrap flex gap-12 font-mono text-[11px] tracking-[0.2em] uppercase">
          <span>Última hora: Nueva exposición en el MoMA</span>
          <span className="opacity-50">/</span>
          <span>Entrevista exclusiva con Yohji Yamamoto</span>
          <span className="opacity-50">/</span>
          <span>Descubre las tendencias de Milán</span>
          <span className="opacity-50">/</span>
          <span>Arquitectura sostenible en los Alpes</span>
          <span className="opacity-50">/</span>
          <span>Última hora: Nueva exposición en el MoMA</span>
          <span className="opacity-50">/</span>
          <span>Entrevista exclusiva con Yohji Yamamoto</span>
        </div>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-16 border-b border-[var(--color-yan-border)] pb-6">
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Últimas Historias</h2>
          <span className="hidden md:block text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-stone)]">
            Descubre Más
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
          {gridArticles.map((article) => (
            <ArticleCard key={article.slug} {...article} />
          ))}
        </div>
      </section>
      
      {/* Editorial Block */}
      <section className="bg-[var(--color-yan-surface-elevated)] py-32 border-y border-[var(--color-yan-border)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-[1px] h-16 bg-[var(--color-yan-red)] mx-auto mb-12" />
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold mb-12 leading-[1.1] text-[var(--color-yan-charcoal)]">
            "El diseño no es solo lo que se ve y se siente. El diseño es cómo funciona."
          </h2>
          <p className="font-mono text-[12px] text-[var(--color-yan-stone)] uppercase tracking-[0.2em]">
            — Steve Jobs
          </p>
        </div>
      </section>
    </>
  );
}
