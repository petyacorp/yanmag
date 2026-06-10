'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CategoryBadge } from './CategoryBadge';
import { useLocale } from '../providers/LocaleProvider';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselSlide {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category?: {
    name: string;
    slug: string;
    color?: string;
  } | null;
  date: string;
}

interface HeroCarouselProps {
  slides: CarouselSlide[];
  autoPlayInterval?: number;
}

export function HeroCarousel({ slides, autoPlayInterval = 6000 }: HeroCarouselProps) {
  const { t } = useLocale();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const total = slides.length;

  const goTo = useCallback((index: number, dir: 'next' | 'prev') => {
    if (isTransitioning) return;
    setDirection(dir);
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    goTo((current + 1) % total, 'next');
  }, [current, total, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + total) % total, 'prev');
  }, [current, total, goTo]);

  // Auto-play
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(goNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, goNext, autoPlayInterval, total]);

  if (total === 0) return null;

  // If only 1 slide, render it without controls
  if (total === 1) {
    const slide = slides[0];
    return (
      <article className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-end">
        <div className="absolute inset-0">
          <Image
            src={slide.coverImage}
            alt={slide.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A2522] via-[#2A2522]/50 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-3xl">

            <Link href={`/articulo/${slide.slug}`} className="block group">
              <h1 className="font-display text-4xl md:text-6xl lg:text-[72px] font-semibold text-[var(--color-yan-ivory)] leading-[1.1] mb-6 tracking-tight group-hover:text-[var(--color-yan-red-light)] transition-colors duration-500 animate-carousel-title-color">
                {slide.title}
              </h1>
            </Link>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl">
              {slide.excerpt}
            </p>
            <Link
              href={`/articulo/${slide.slug}`}
              className="inline-flex items-center gap-3 mt-8 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-ivory)] hover:text-[var(--color-yan-red-light)] hover:gap-5 transition-all duration-300"
            >
              {t.hero.readArticle}
              <span className="inline-block w-8 h-[1px] bg-current" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div
      className="relative w-full min-h-[75vh] md:min-h-[85vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <article
          key={slide.slug}
          className={`absolute inset-0 flex items-end transition-all duration-700 ease-out ${
            index === current
              ? 'opacity-100 z-10 translate-x-0'
              : index === (current - 1 + total) % total && direction === 'next'
              ? 'opacity-0 z-0 -translate-x-12'
              : 'opacity-0 z-0 translate-x-12'
          }`}
          aria-hidden={index !== current}
        >
          <div className="absolute inset-0">
            <Image
              src={slide.coverImage}
              alt={slide.title}
              fill
              priority={index === 0}
              className={`object-cover transition-transform duration-[8000ms] ease-out ${
                index === current ? 'scale-105' : 'scale-100'
              }`}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A2522] via-[#2A2522]/50 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 lg:px-8 pb-20 md:pb-28">
            <div className="max-w-3xl">


              <Link href={`/articulo/${slide.slug}`} className="block group">
                <h2
                  className={`font-display text-4xl md:text-6xl lg:text-[72px] font-semibold text-[var(--color-yan-ivory)] leading-[1.1] mb-6 tracking-tight group-hover:text-[var(--color-yan-red-light)] transition-colors duration-500 animate-carousel-title-color ${
                    index === current ? 'animate-carousel-text-in' : ''
                  }`}
                >
                  {slide.title}
                </h2>
              </Link>

              <p
                className={`text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl ${
                  index === current ? 'animate-carousel-excerpt-in' : ''
                }`}
              >
                {slide.excerpt}
              </p>

              <Link
                href={`/articulo/${slide.slug}`}
                className={`inline-flex items-center gap-3 mt-8 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--color-yan-ivory)] hover:text-[var(--color-yan-red-light)] hover:gap-5 transition-all duration-300 ${
                  index === current ? 'animate-carousel-cta-in' : ''
                }`}
              >
                {t.hero.readArticle}
                <span className="inline-block w-8 h-[1px] bg-current" />
              </Link>
            </div>
          </div>
        </article>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goPrev}
        aria-label="Slide anterior"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-black/30 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
        style={{ opacity: isPaused ? 1 : undefined }}
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
      </button>
      <button
        onClick={goNext}
        aria-label="Siguiente slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-black/30 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
        style={{ opacity: isPaused ? 1 : undefined }}
      >
        <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Dot Indicators + Progress Bar */}
      <div className="absolute bottom-6 md:bottom-10 left-6 md:left-8 z-20 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index, index > current ? 'next' : 'prev')}
            aria-label={`Ir al slide ${index + 1}`}
            className="relative group/dot"
          >
            <div
              className={`h-[3px] rounded-full transition-all duration-500 ${
                index === current
                  ? 'w-10 bg-[var(--color-yan-red)]'
                  : 'w-4 bg-white/40 group-hover/dot:bg-white/70'
              }`}
            />
            {/* Auto-play progress indicator on active dot */}
            {index === current && !isPaused && (
              <div
                className="absolute top-0 left-0 h-[3px] bg-white/90 rounded-full"
                style={{
                  animation: `carousel-progress ${autoPlayInterval}ms linear`,
                  width: '100%',
                }}
              />
            )}
          </button>
        ))}

        {/* Slide counter */}
        <span className="ml-4 text-[10px] font-mono text-white/50 uppercase tracking-[0.15em]">
          {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
