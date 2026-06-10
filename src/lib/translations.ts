// ============================================
// YAN MAG — Internationalization Translations
// ============================================

import { type Locale } from './types';

export const translations = {
  es: {
    // Navigation
    nav: {
      diseno: 'Diseño',
      cultura: 'Cultura',
      moda: 'Moda',
      arquitectura: 'Arquitectura',
      entrevistas: 'Entrevistas',
      musica: 'Música',
      videojuegos: 'Videojuegos',
      'cine-tv': 'Cine & TV',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      search: 'Buscar',
    },

    // Hero / Home
    hero: {
      readArticle: 'Leer artículo',
      latestStories: 'Últimas Historias',
      discoverMore: 'Descubre Más',
    },

    // Trending strip
    trending: {
      items: [
        'Última hora: Nueva exposición en el MoMA',
        'Entrevista exclusiva con Yohji Yamamoto',
        'Descubre las tendencias de Milán',
        'Arquitectura sostenible en los Alpes',
      ],
    },

    // Editorial quote block
    editorial: {
      quote: '"El diseño no es solo lo que se ve y se siente. El diseño es cómo funciona."',
      author: '— Steve Jobs',
    },

    // Article page
    article: {
      archivedIn: 'Archivado en:',
      photography: 'FOTOGRAFÍA / YAN MAG',
      readTime: 'min de lectura',
    },

    // Category page
    category: {
      label: 'Categoría',
      explore: 'Explora nuestras últimas historias, entrevistas y reportajes sobre',
      loadMore: 'Cargar más historias',
    },

    // Search
    search: {
      placeholder: 'Buscar artículos...',
      trending: 'Tendencias',
      close: 'Cerrar búsqueda',
    },

    // Newsletter
    newsletter: {
      title: 'Boletín Semanal',
      description: 'Recibe nuestras mejores historias directamente en tu bandeja de entrada.',
      placeholder: 'Tu correo electrónico',
      success: '¡Gracias por suscribirte!',
      disclaimer: 'Sin spam. Cancela cuando quieras.',
      subscribe: 'Suscribirse',
    },

    // Footer
    footer: {
      tagline: 'Explorando la intersección del diseño, la cultura y el estilo de vida contemporáneo con una mirada editorial y arquitectónica.',
      explore: 'Explorar',
      privacy: 'Privacidad',
      terms: 'Términos',
      contact: 'Contacto',
      rights: 'Todos los derechos reservados.',
    },

    // Theme
    theme: {
      toggleLight: 'Cambiar a tema claro',
      toggleDark: 'Cambiar a tema oscuro',
    },

    // Language
    lang: {
      switchLabel: 'Cambiar idioma',
    },
  },

  en: {
    // Navigation
    nav: {
      diseno: 'Design',
      cultura: 'Culture',
      moda: 'Fashion',
      arquitectura: 'Architecture',
      entrevistas: 'Interviews',
      musica: 'Music',
      videojuegos: 'Video Games',
      'cine-tv': 'Cinema & TV',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      search: 'Search',
    },

    // Hero / Home
    hero: {
      readArticle: 'Read article',
      latestStories: 'Latest Stories',
      discoverMore: 'Discover More',
    },

    // Trending strip
    trending: {
      items: [
        'Breaking: New exhibition at MoMA',
        'Exclusive interview with Yohji Yamamoto',
        'Discover Milan\'s latest trends',
        'Sustainable architecture in the Alps',
      ],
    },

    // Editorial quote block
    editorial: {
      quote: '"Design is not just what it looks like and feels like. Design is how it works."',
      author: '— Steve Jobs',
    },

    // Article page
    article: {
      archivedIn: 'Filed under:',
      photography: 'PHOTOGRAPHY / YAN MAG',
      readTime: 'min read',
    },

    // Category page
    category: {
      label: 'Category',
      explore: 'Explore our latest stories, interviews and features about',
      loadMore: 'Load more stories',
    },

    // Search
    search: {
      placeholder: 'Search articles...',
      trending: 'Trending',
      close: 'Close search',
    },

    // Newsletter
    newsletter: {
      title: 'Weekly Newsletter',
      description: 'Get our best stories delivered straight to your inbox.',
      placeholder: 'Your email address',
      success: 'Thanks for subscribing!',
      disclaimer: 'No spam. Unsubscribe anytime.',
      subscribe: 'Subscribe',
    },

    // Footer
    footer: {
      tagline: 'Exploring the intersection of design, culture, and contemporary lifestyle through an editorial and architectural lens.',
      explore: 'Explore',
      privacy: 'Privacy',
      terms: 'Terms',
      contact: 'Contact',
      rights: 'All rights reserved.',
    },

    // Theme
    theme: {
      toggleLight: 'Switch to light theme',
      toggleDark: 'Switch to dark theme',
    },

    // Language
    lang: {
      switchLabel: 'Change language',
    },
  },
};

export type TranslationKey = typeof translations['es'];

/**
 * Hook-friendly helper: get the full translation object for a locale
 */
export function getTranslations(locale: Locale): TranslationKey {
  return translations[locale] as TranslationKey;
}
