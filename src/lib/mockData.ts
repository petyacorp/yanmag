export const MOCK_CATEGORIES = {
  moda: { name: 'Moda', slug: 'moda', color: '#A6342A' },
  cultura: { name: 'Cultura', slug: 'cultura', color: '#8A8078' },
  diseno: { name: 'Diseño', slug: 'diseno', color: '#4A433D' },
  arquitectura: { name: 'Arquitectura', slug: 'arquitectura', color: '#A6342A' },
  entrevistas: { name: 'Entrevistas', slug: 'entrevistas', color: '#8A8078' },
};

export const MOCK_ARTICLES = [
  {
    slug: 'el-renacimiento-del-minimalismo-maximo',
    title: 'El Renacimiento del Minimalismo Máximo en el Diseño Contemporáneo',
    excerpt: 'Descubre cómo los diseñadores están fusionando líneas limpias con elementos audaces para crear espacios que desafían las convenciones tradicionales.',
    coverImage: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop',
    category: { name: 'Diseño', slug: 'diseno', color: '#4A433D' },
    date: '22 MAY 2026',
    featured: true,
  },
  {
    slug: 'fotografia-analogica-era-digital',
    title: 'La Fotografía Analógica en la Era Digital',
    excerpt: 'Un viaje nostálgico a través de la lente de los creadores modernos que prefieren el grano de la película a los píxeles.',
    coverImage: 'https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?q=80&w=1000&auto=format&fit=crop',
    category: { name: 'Cultura', slug: 'cultura', color: '#8A8078' },
    date: '18 MAY 2026',
  },
  {
    slug: 'tendencias-otono-invierno',
    title: 'Tendencias Otoño/Invierno: La Reinvención de la Silueta',
    excerpt: 'Análisis profundo de las colecciones que están definiendo la estética de esta temporada en las calles de Milán y París.',
    coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
    category: { name: 'Moda', slug: 'moda', color: '#A6342A' },
    date: '15 MAY 2026',
  },
  {
    slug: 'arquitectura-brutalista-hoy',
    title: '¿Por qué amamos el Brutalismo hoy?',
    excerpt: 'El resurgimiento del hormigón expuesto y las formas geométricas monumentales en la arquitectura residencial.',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop',
    category: { name: 'Arquitectura', slug: 'arquitectura', color: '#A6342A' },
    date: '10 MAY 2026',
  },
  {
    slug: 'arte-textil-contemporaneo',
    title: 'Tejiendo el Futuro: Arte Textil Contemporáneo',
    excerpt: 'Conoce a los artistas que están transformando hilos y telas en poderosas declaraciones políticas y sociales.',
    coverImage: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1000&auto=format&fit=crop',
    category: { name: 'Cultura', slug: 'cultura', color: '#8A8078' },
    date: '05 MAY 2026',
  }
];
