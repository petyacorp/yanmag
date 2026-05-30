import Image from 'next/image';
import Link from 'next/link';
import { CategoryBadge } from './CategoryBadge';

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: {
    name: string;
    slug: string;
    color?: string;
  };
  date: string;
  featured?: boolean;
}

export function ArticleCard({ slug, title, excerpt, coverImage, category, date, featured = false }: ArticleCardProps) {
  return (
    <article className={`group flex flex-col ${featured ? 'md:flex-row md:items-stretch md:gap-12' : 'gap-5'}`}>
      <Link
        href={`/articulo/${slug}`}
        className={`block relative overflow-hidden ${
          featured
            ? 'w-full md:w-3/5 aspect-[16/10]'
            : 'w-full aspect-[4/3]'
        }`}
      >
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes={featured ? '(max-width: 768px) 100vw, 60vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          loading="lazy"
        />
      </Link>

      <div className={`flex flex-col justify-center flex-1 ${featured ? 'py-4 md:py-8' : 'py-1'}`}>
        <div className="flex items-center gap-4 mb-4">
          <CategoryBadge name={category.name} slug={category.slug} color={category.color} />
          <span className="text-[11px] font-medium text-[var(--color-yan-stone)] tracking-[0.15em] uppercase">
            {date}
          </span>
        </div>

        <Link href={`/articulo/${slug}`} className="block group-hover:text-[var(--color-yan-red)] transition-colors duration-300">
          <h3 className={`font-display font-semibold leading-[1.2] mb-3 ${featured ? 'text-3xl md:text-[42px]' : 'text-[26px]'}`}>
            {title}
          </h3>
        </Link>

        <p className="text-[var(--color-yan-stone)] line-clamp-3 leading-relaxed text-[15px]">
          {excerpt}
        </p>

        {featured && (
          <Link
            href={`/articulo/${slug}`}
            className="inline-flex items-center gap-2 mt-6 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-red)] hover:gap-4 transition-all duration-300"
          >
            Leer artículo
            <span className="inline-block w-6 h-[1px] bg-[var(--color-yan-red)]" />
          </Link>
        )}
      </div>
    </article>
  );
}
