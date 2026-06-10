'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewsletterForm } from '../ui/NewsletterForm';
import { useLocale } from '../providers/LocaleProvider';
import { getCategories } from '@/lib/actions/categories';

const CATEGORY_SLUGS = ['diseno', 'cultura', 'moda', 'arquitectura', 'entrevistas', 'musica', 'videojuegos', 'cine-tv'] as const;

export function Footer() {
  const [categories, setCategories] = useState<{ id?: string; name: string; slug: string }[]>([]);
  const { locale, t } = useLocale();
  const [logoPath, setLogoPath] = useState('/Logo1 no background.png');

  useEffect(() => {
    const logos = [
      '/Logo1 no background.png',
      '/Logo2 no background.png',
      '/Logo3 no background.png',
      '/Logo4 no background.png',
      '/Logo5 no background.png'
    ];
    const randomIndex = Math.floor(Math.random() * logos.length);
    setLogoPath(logos[randomIndex]);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Set fallback categories first
    const fallbackCategories = CATEGORY_SLUGS.map((slug) => ({
      name: t.nav[slug],
      slug,
    }));
    setCategories(fallbackCategories);

    // Fetch real categories from Supabase
    getCategories()
      .then((dbCats) => {
        if (isMounted && dbCats && dbCats.length > 0) {
          const filteredCats = dbCats.filter((c: any) => c.slug !== 'system-pizarra');
          const mappedCats = filteredCats.map((cat: any) => ({
            id: cat.id,
            name: locale === 'es' ? cat.name_es : (cat.name_en || cat.name_es),
            slug: cat.slug,
          }));
          setCategories(mappedCats);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories in Footer:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [locale, t.nav]);

  return (
    <footer className="bg-[var(--footer-bg)] text-[var(--footer-text)] mt-24">
      {/* Red accent line at top of footer */}
      <div className="h-[2px] bg-yan-red" />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-20">

          {/* Brand column */}
          <div className="md:col-span-4 flex flex-col items-center text-center gap-6">
            <Link href="/" className="inline-block">
              <img 
                src={logoPath} 
                alt="YAN MAG Logo" 
                className="h-20 w-auto object-contain invert" 
              />
            </Link>
            <p className="text-yan-stone text-[15px] leading-relaxed max-w-sm mx-auto">
              {t.footer.tagline}
            </p>
          </div>

          {/* Navigation column */}
          <div className="md:col-span-3 md:col-start-6">
            <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-yan-stone mb-6">
              {t.footer.explore}
            </h4>
            <nav className="flex flex-col gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  className="text-yan-stone hover:text-[var(--footer-text)] transition-colors duration-300 text-[15px] w-fit"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter column */}
          <div className="md:col-span-4 md:col-start-9">
            <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-yan-stone mb-6">
              {t.newsletter.title}
            </h4>
            <p className="text-yan-stone text-sm mb-6 leading-relaxed">
              {t.newsletter.description}
            </p>
            <NewsletterForm variant="dark" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-[var(--footer-border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-yan-stone tracking-wide">
            © {new Date().getFullYear()} YAN MAG. {t.footer.rights}
          </p>
          <div className="flex gap-8 text-[12px] text-yan-stone">
            <Link href="/privacidad" className="hover:text-[var(--footer-text)] transition-colors">
              {t.footer.privacy}
            </Link>
            <Link href="/terminos" className="hover:text-[var(--footer-text)] transition-colors">
              {t.footer.terms}
            </Link>
            <Link href="/contacto" className="hover:text-[var(--footer-text)] transition-colors">
              {t.footer.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
