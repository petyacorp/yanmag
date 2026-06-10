'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewsletterForm } from '../ui/NewsletterForm';
import { useLocale } from '../providers/LocaleProvider';
import { getCategories } from '@/lib/actions/categories';
import { getSiteSettings } from '@/lib/actions/settings';

const CATEGORY_SLUGS = ['diseno', 'cultura', 'moda', 'arquitectura', 'entrevistas', 'musica', 'videojuegos', 'cine-tv'] as const;

export function Footer() {
  const [categories, setCategories] = useState<{ id?: string; name: string; slug: string }[]>([]);
  const { locale, t } = useLocale();
  const [logoPath, setLogoPath] = useState('/Logo1 no background.png');
  const [socialLinks, setSocialLinks] = useState<{
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  }>({});

  useEffect(() => {
    let isMounted = true;
    getSiteSettings()
      .then((settings) => {
        if (isMounted && settings) {
          setSocialLinks({
            instagram: settings.social_instagram || undefined,
            twitter: settings.social_twitter || undefined,
            facebook: settings.social_facebook || undefined,
            tiktok: settings.social_tiktok || undefined,
            youtube: settings.social_youtube || undefined,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load site settings in Footer:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
            {Object.values(socialLinks).some(Boolean) && (
              <div className="flex items-center justify-center gap-5 mt-2">
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-yan-stone hover:text-[var(--footer-text)] transition-colors duration-300" aria-label="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-yan-stone hover:text-[var(--footer-text)] transition-colors duration-300" aria-label="Twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-yan-stone hover:text-[var(--footer-text)] transition-colors duration-300" aria-label="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-yan-stone hover:text-[var(--footer-text)] transition-colors duration-300" aria-label="TikTok">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                    </svg>
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-yan-stone hover:text-[var(--footer-text)] transition-colors duration-300" aria-label="YouTube">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
                      <polygon points="10 15 15 12 10 9"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
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
