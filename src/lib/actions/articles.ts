'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ArticleFormData } from '@/lib/types';

export async function getArticles(options?: {
  status?: string;
  categoryId?: string;
  authorId?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from('articles')
    .select('*, category:categories(*), author:profiles(*)', { count: 'exact' });

  if (options?.status === 'published') {
    query = query.order('published_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }
  if (options?.authorId) {
    query = query.eq('author_id', options.authorId);
  }
  if (options?.featured) {
    query = query.eq('is_featured', true);
  }
  if (options?.search) {
    query = query.or(`title_es.ilike.%${options.search}%,title_en.ilike.%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { articles: data || [], count: count || 0 };
}

export async function getArticleBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*), author:profiles(*)')
    .eq('slug', slug)
    .single();

  if (error) return null;
  
  // Get tags
  const { data: articleTags } = await supabase
    .from('article_tags')
    .select('tag:tags(*)')
    .eq('article_id', data.id);

  return {
    ...data,
    tags: articleTags?.map((at: { tag: unknown }) => at.tag) || [],
  };
}

export async function getArticleById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*), author:profiles(*)')
    .eq('id', id)
    .single();

  if (error) return null;

  const { data: articleTags } = await supabase
    .from('article_tags')
    .select('tag:tags(*)')
    .eq('article_id', data.id);

  return {
    ...data,
    tags: articleTags?.map((at: { tag: unknown }) => at.tag) || [],
  };
}

export async function createArticle(formData: ArticleFormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { tag_ids, ...articleData } = formData;

  const { data, error } = await supabase
    .from('articles')
    .insert({
      ...articleData,
      author_id: user.id,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;

  // Insert tags
  if (tag_ids?.length > 0) {
    await supabase
      .from('article_tags')
      .insert(tag_ids.map(tag_id => ({ article_id: data.id, tag_id })));
  }

  revalidatePath('/');
  revalidatePath('/admin/articulos');
  return data;
}

export async function updateArticle(id: string, formData: Partial<ArticleFormData>) {
  const supabase = await createClient();
  const { tag_ids, ...articleData } = formData;

  // Set published_at when first published
  if (articleData.status === 'published') {
    const existing = await getArticleById(id);
    if (existing && !existing.published_at) {
      (articleData as Record<string, unknown>).published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('articles')
    .update(articleData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Update tags if provided
  if (tag_ids !== undefined) {
    await supabase.from('article_tags').delete().eq('article_id', id);
    if (tag_ids.length > 0) {
      await supabase
        .from('article_tags')
        .insert(tag_ids.map(tag_id => ({ article_id: id, tag_id })));
    }
  }

  revalidatePath('/');
  revalidatePath('/admin/articulos');
  revalidatePath(`/articulo/${data.slug}`);
  return data;
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/admin/articulos');
}

export async function publishArticle(id: string) {
  return updateArticle(id, { status: 'published' });
}

export async function archiveArticle(id: string) {
  return updateArticle(id, { status: 'archived' });
}

export async function searchArticles(query: string) {
  const supabase = await createClient();

  // 1. Try to use the unaccented RPC function if it is defined in the database
  try {
    const { data, error } = await supabase
      .rpc('search_articles', { search_query: query })
      .select('*, category:categories(*), author:profiles(*)');

    if (!error && data) {
      return data;
    }

    if (error) {
      console.warn('search_articles RPC failed or not found, using ILIKE fallback:', error.message);
    }
  } catch (err: any) {
    console.warn('Error executing search_articles RPC, using ILIKE fallback:', err?.message || err);
  }

  // 2. Fallback: Standard case-insensitive ILIKE search (which is strict on accents)
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*), author:profiles(*)')
    .eq('status', 'published')
    .or(`title_es.ilike.%${query}%,title_en.ilike.%${query}%,excerpt_es.ilike.%${query}%,content_es.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

export async function seedArticles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('No estás autenticado. Por favor inicia sesión.');
  }

  const authorId = user.id;

  // Fetch categories to link articles correctly
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug');

  if (catError) {
    throw new Error(`Error al obtener categorías: ${catError.message}`);
  }

  const catMap = new Map(categories?.map(c => [c.slug, c.id]));

  // Ensure standard categories exist in map, or fallback to the first category
  const getCatId = (slug: string) => {
    return catMap.get(slug) || (categories && categories.length > 0 ? categories[0].id : null);
  };

  const seedData = [
    {
      title_es: "El Retorno de la Alta Costura Artesanal",
      title_en: "The Return of Artisanal Haute Couture",
      excerpt_es: "Cómo las firmas contemporáneas están abandonando la producción masiva para revivir las técnicas tradicionales de confección a mano.",
      excerpt_en: "How contemporary fashion houses are abandoning mass production to revive traditional hand-crafting techniques.",
      content_es: `# El Retorno de la Alta Costura Artesanal\n\nEn un mundo dominado por el fast fashion y la producción en masa, una nueva generación de diseñadores y casas de moda está dirigiendo la mirada hacia el pasado. La artesanía meticulosa, las costuras a mano y el respeto por el tiempo están volviendo al primer plano del diseño contemporáneo.\n\n## La Valoración del Tiempo\n\nLa producción de una sola prenda de alta costura puede tomar cientos de horas de trabajo especializado. Este enfoque no solo garantiza una calidad inigualable, sino que también establece una conexión emocional profunda entre el creador, la prenda y quien la viste.\n\n> "La moda de lujo ya no se define por el logotipo o la marca, sino por la historia de las manos que la crearon."\n\n## El Impacto Ambiental de la Moda Lenta\n\nAdemás de los beneficios estéticos, la costura artesanal promueve la sostenibilidad. Al favorecer materiales biodegradables de alta calidad y procesos locales, se reduce drásticamente el desperdicio textil. La moda duradera es, hoy por hoy, el mayor acto de rebelión ecológica en la industria.`,
      content_en: `# The Return of Artisanal Haute Couture\n\nIn a world dominated by fast fashion and mass production, a new generation of designers and fashion houses is turning its gaze back to the past. Meticulous craftsmanship, hand-stitching, and respect for time are returning to the forefront of contemporary design.\n\n## The Value of Time\n\nProducing a single haute couture garment can take hundreds of hours of specialized labor. This approach not only ensures unmatched quality but also establishes a deep emotional connection between the creator, the garment, and the wearer.\n\n## The Environmental Impact of Slow Fashion\n\nBeyond aesthetic benefits, artisanal couture promotes sustainability. By favoring high-quality biodegradable materials and local processes, textile waste is drastically reduced. Durable fashion is, today, the greatest act of ecological rebellion in the industry.`,
      cover_image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop",
      cover_image_alt: "Moda de alta costura",
      category_id: getCatId("moda"),
      status: "published",
      is_featured: true,
      meta_title: "El Retorno de la Alta Costura Artesanal | YAN MAG",
      meta_description: "Cómo las firmas contemporáneas están abandonando la producción masiva para revivir las técnicas tradicionales de confección a mano.",
      slug_base: "el-retorno-de-la-alta-costura-artesanal"
    },
    {
      title_es: "Museos en la Era de la Realidad Aumentada",
      title_en: "Museums in the Age of Augmented Reality",
      excerpt_es: "Una exploración sobre cómo la tecnología inmersiva está transformando la experiencia del espectador en las galerías de arte más importantes del mundo.",
      excerpt_en: "An exploration of how immersive technology is transforming the viewer experience in the world's most important art galleries.",
      content_es: `# Museos en la Era de la Realidad Aumentada\n\nLa tecnología digital ya no es una simple distracción en las salas de exhibición, sino un portal hacia dimensiones completamente nuevas del arte. Desde el Louvre hasta el MoMA, la realidad aumentada (AR) está reescribiendo la interacción del público con las obras clásicas.\n\n## Rompiendo la Barrera Física\n\nMediante el uso de dispositivos móviles y gafas inteligentes, los espectadores ahora pueden interactuar con pinturas, recrear las pinceladas de los autores en tiempo real u observar esculturas en su entorno histórico original.\n\n## ¿Educación o Espectáculo?\n\nEl debate entre los curadores tradicionales y los tecnólogos sigue abierto. Sin embargo, los museos que han adoptado estas tecnologías reportan un incremento significativo en las visitas de audiencias jóvenes y una mayor retención del conocimiento histórico expuesto.`,
      content_en: `# Museums in the Age of Augmented Reality\n\nDigital technology is no longer a simple distraction in exhibition rooms, but a portal to entirely new dimensions of art. From the Louvre to MoMA, augmented reality (AR) is rewriting the public's interaction with classic works.\n\n## Breaking the Physical Barrier\n\nThrough mobile devices and smart glasses, viewers can now interact with paintings, recreate the artists' brushstrokes in real time, or observe sculptures in their original historical settings.\n\n## Education or Entertainment?\n\nThe debate between traditional curators and technologists remains open. However, museums adopting these technologies report a significant increase in visits from younger audiences and higher retention of historical knowledge.`,
      cover_image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop",
      cover_image_alt: "Galería de arte interactiva",
      category_id: getCatId("cultura"),
      status: "published",
      is_featured: false,
      meta_title: "Museos y Realidad Aumentada | YAN MAG",
      meta_description: "Una exploración sobre cómo la tecnología inmersiva está transformando la experiencia del espectador en las galerías de arte.",
      slug_base: "museos-en-la-era-de-la-realidad-aumentada"
    },
    {
      title_es: "La Arquitectura de la Luz Natural en el Hogar",
      title_en: "The Architecture of Natural Light at Home",
      excerpt_es: "Consejos de interioristas para maximizar la iluminación natural y mejorar el bienestar emocional en espacios urbanos.",
      excerpt_en: "Tips from interior designers to maximize natural light and improve emotional well-being in urban spaces.",
      content_es: `# La Arquitectura de la Luz Natural\n\nLa luz no es solo un elemento funcional que nos permite ver; es un material de construcción invisible capaz de moldear nuestras emociones, ciclos de sueño y productividad diaria. En la arquitectura moderna, diseñar con luz natural es primordial.\n\n## La Orientación de la Vivienda\n\nSaber de dónde viene la luz solar en las diferentes estaciones permite ubicar estratégicamente salas de estar, comedores y áreas de descanso. El uso de claraboyas y ventanales de piso a techo abre las barreras visuales y aporta amplitud.\n\n## Materiales que Multiplican la Luz\n\nEl uso de paletas cromáticas claras, superficies ligeramente satinadas y espejos colocados estratégicamente ayuda a rebotar la luz, iluminando los rincones tradicionalmente oscuros de los apartamentos urbanos modernos.`,
      content_en: `# The Architecture of Natural Light\n\nLight is not just a functional element that lets us see; it is an invisible building material capable of shaping our emotions, sleep cycles, and daily productivity. In modern architecture, designing with natural light is paramount.\n\n## Housing Orientation\n\nKnowing where sunlight comes from in different seasons allows strategic positioning of living rooms, dining areas, and workspaces. Skylights and floor-to-ceiling windows break down visual barriers and bring spaciousness.\n\n## Light-Multiplying Materials\n\nLight color palettes, satin surfaces, and strategically placed mirrors help bounce light, illuminating traditionally dark corners of modern urban apartments.`,
      cover_image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
      cover_image_alt: "Habitación iluminada por el sol",
      category_id: getCatId("lifestyle"),
      status: "published",
      is_featured: false,
      meta_title: "La luz natural en el hogar | YAN MAG",
      meta_description: "Consejos de interioristas para maximizar la iluminación natural y mejorar tu bienestar.",
      slug_base: "la-arquitectura-de-la-luz-natural-en-el-hogar"
    },
    {
      title_es: "El Cine Silencioso y su Influencia en el Siglo XXI",
      title_en: "Silent Cinema and its Influence in the 21st Century",
      excerpt_es: "Por qué los directores contemporáneos siguen recurriendo al lenguaje visual del cine mudo para contar historias visualmente impactantes.",
      excerpt_en: "Why contemporary directors continue to turn to the visual language of silent films to tell visually striking stories.",
      content_es: `# El Cine Silencioso y su Influencia en el Siglo XXI\n\nAunque el cine sonoro revolucionó la industria hace casi un siglo, el arte de narrar historias puramente a través de imágenes sigue vivo. Directores contemporáneos continúan inspirándose en las técnicas expresivas de la época silente.\n\n## El Poder de la Expresión Visual\n\nSin diálogos en los que apoyarse, los pioneros del cine dependían de la composición visual, la iluminación contrastante y la gestualidad actoral. Películas modernas que juegan con el silencio demuestran que, a menudo, la palabra hablada es redundante.\n\n## Técnicas que Perduran\n\nEl claroscuro del expresionismo alemán y el montaje asociativo soviético siguen siendo herramientas vitales en el suspenso y drama modernos. Regresar al origen de la imagen en movimiento ayuda a purificar el lenguaje cinematográfico actual.`,
      content_en: `# Silent Cinema and its Influence in the 21st Century\n\nAlthough talkies revolutionized the industry nearly a century ago, the art of telling stories purely through images is alive and well. Contemporary directors continue to draw inspiration from the expressive techniques of the silent era.\n\n## The Power of Visual Expression\n\nWith no dialogue to rely on, early film pioneers depended on visual composition, contrasting lighting, and acting gestures. Modern films playing with silence prove that, often, the spoken word is redundant.\n\n## Enduring Techniques\n\nGerman Expressionist chiaroscuro and Soviet associative montage remain vital tools in modern suspense and drama. Returning to the origin of the moving image helps purify today's cinematic language.`,
      cover_image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop",
      cover_image_alt: "Proyección cinematográfica clásica",
      category_id: getCatId("entretenimiento"),
      status: "published",
      is_featured: false,
      meta_title: "Influencia del cine mudo hoy | YAN MAG",
      meta_description: "Por qué los directores contemporáneos recurren al lenguaje visual del cine mudo.",
      slug_base: "el-cine-silencioso-y-su-influencia-en-el-siglo-xxi"
    },
    {
      title_es: "La Paradoja de la Conectividad Constante",
      title_en: "The Paradox of Constant Connectivity",
      excerpt_es: "Una reflexión sobre cómo la hiperconexión digital nos está alejando de las interacciones humanas genuinas y la contemplación.",
      excerpt_en: "A reflection on how digital hyperconnectivity is distancing us from genuine human interactions and contemplation.",
      content_es: `# La Paradoja de la Conectividad Constante\n\nTener el mundo al alcance de los dedos ha traído enormes facilidades, pero también ha cobrado una cuota invisible sobre nuestra salud mental. La necesidad de estar siempre disponibles en línea genera ansiedad y dispersión cognitiva.\n\n## La Pérdida del 'Aburrimiento Creativo'\n\nCuando llenamos cada segundo libre de nuestras vidas mirando una pantalla, eliminamos los espacios de ocio y silencio que estimulan la imaginación. Las grandes ideas suelen nacer en momentos de contemplación desestructurada.\n\n## Hacia una Higiene Digital\n\nEstablecer límites sanos, como horas sin pantallas o retiros de fin de semana, no es una moda antitecnología; es un acto de preservación mental indispensable para los creadores e intelectuales modernos.`,
      content_en: `# The Paradox of Constant Connectivity\n\nHaving the world at our fingertips has brought immense convenience, but it has also exacted an invisible toll on our mental health. The constant urge to be online and available creates anxiety and cognitive fragmentation.\n\n## The Loss of 'Creative Boredom'\n\nWhen we fill every free second of our lives looking at a screen, we eliminate the periods of quiet and leisure that spark imagination. Great ideas are often born in moments of unstructured contemplation.\n\n## Toward Digital Hygiene\n\nSetting healthy boundaries, such as screen-free hours or weekend digital detoxes, is not an anti-technology trend; it is an act of mental self-preservation indispensable for modern creators.`,
      cover_image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
      cover_image_alt: "Dispositivos conectados",
      category_id: getCatId("opinion"),
      status: "published",
      is_featured: false,
      meta_title: "La Paradoja de la Conectividad Constante | YAN MAG",
      meta_description: "Una reflexión sobre cómo la hiperconexión digital nos aleja de las interacciones genuinas.",
      slug_base: "la-paradoxa-de-la-conectividad-constante"
    },
    {
      title_es: "Entrevista con Sofía Valenzuela: El Futuro del Arte Sostenible",
      title_en: "Interview with Sofia Valenzuela: The Future of Sustainable Art",
      excerpt_es: "Hablamos con la escultora chilena sobre su última exposición hecha enteramente de materiales reciclados y marinos.",
      excerpt_en: "We speak with the Chilean sculptor about her latest exhibition made entirely of recycled and marine materials.",
      content_es: `# Entrevista con Sofía Valenzuela\n\nSofía Valenzuela es una de las voces más singulares de la escultura contemporánea latinoamericana. Nos reunimos en su taller en la costa para conversar sobre su proceso creativo y su compromiso con el medio ambiente.\n\n## Crear a partir del residuo\n\n"No veo basura; veo historias inconclusas", nos cuenta Sofía al mostrarnos las imponentes estructuras construidas con redes de pesca abandonadas y plásticos recuperados del mar.\n\n## El mensaje detrás del material\n\nPara Sofía, el arte sostenible no se trata solo de la técnica, sino de confrontar al espectador con su propio consumo. Cada obra es un espejo de la relación rota entre el ser humano y el océano, pero también una semilla de esperanza sobre lo que se puede reconstruir.`,
      content_en: `# Interview with Sofia Valenzuela\n\nSofia Valenzuela is one of the most unique voices in contemporary Latin American sculpture. We met at her seaside studio to talk about her creative process and commitment to the environment.\n\n## Creating from Waste\n\n"I don't see garbage; I see unfinished stories," Sofia tells us, showing imposing structures built from abandoned fishing nets and plastics recovered from the ocean.\n\n## The Message Behind the Material\n\nFor Sofia, sustainable art is not just about technique, but about confronting the viewer with their own consumption. Each piece is a mirror of the broken relationship between human beings and the ocean.`,
      cover_image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop",
      cover_image_alt: "Artista trabajando en su taller",
      category_id: getCatId("entrevistas"),
      status: "published",
      is_featured: true,
      meta_title: "Entrevista con Sofía Valenzuela | YAN MAG",
      meta_description: "Hablamos con la escultora sobre su arte hecho de materiales marinos reciclados.",
      slug_base: "entrevista-con-sofia-valenzuela-el-futuro-del-arte-sostenible"
    },
    {
      title_es: "El Resurgimiento del Vinilo y la Escucha Consciente",
      title_en: "The Resurgence of Vinyl and Conscious Listening",
      excerpt_es: "En un mundo dominado por los algoritmos de streaming, el disco de vinilo vuelve a consolidarse como un ritual estético y musical.",
      excerpt_en: "In a world dominated by streaming algorithms, the vinyl record cements itself once again as an aesthetic and musical ritual.",
      content_es: `# El Resurgimiento del Vinilo\n\nEl auge de las plataformas digitales parecía haber decretado la muerte definitiva de los formatos físicos. Sin embargo, las ventas de vinilos registran cifras récord globales. ¿Qué busca el oyente actual en un disco de acetato?\n\n## El Ritual de Escuchar Música\n\nEl vinilo nos obliga a desacelerar. Elegir el disco, colocar la aguja, leer el folleto interno; todo forma parte de una experiencia sensorial completa que se ha perdido en la inmediatez de la reproducción virtual.\n\n## La Calidad del Sonido Analógico\n\nAunque el audio digital es más limpio y práctico, el sonido del vinilo posee una calidez y rango dinámico que muchos melómanos catalogan como insuperable. Es una celebración del arte del álbum en su máxima expresión.`,
      content_en: `# The Resurgence of Vinyl\n\nThe rise of digital platforms seemed to spell the definitive death of physical formats. However, vinyl sales are recording historic global figures. What is today's listener searching for in an acetate disc?\n\n## The Ritual of Listening to Music\n\nVinyl forces us to slow down. Choosing the record, placing the needle, reading the liner notes; it all forms part of a complete sensory experience lost in the immediacy of virtual play.\n\n## The Quality of Analog Sound\n\nThough digital audio is cleaner and more practical, vinyl's sound possesses a warmth and dynamic range that many audiophiles call unmatched. It's a celebration of the album art form.`,
      cover_image: "https://images.unsplash.com/photo-1484755560695-a4c740285a1b?q=80&w=1000&auto=format&fit=crop",
      cover_image_alt: "Tocadiscos reproduciendo un disco de vinilo",
      category_id: getCatId("cultura"),
      status: "published",
      is_featured: false,
      meta_title: "El retorno del disco de vinilo | YAN MAG",
      meta_description: "Por qué el vinilo resurge en una época dominada por algoritmos de streaming.",
      slug_base: "el-resurgimiento-del-vinilo-y-la-escucha-consciente"
    },
    {
      title_es: "Minimalismo Utilitario: La Ropa del Futuro",
      title_en: "Utilitarian Minimalism: The Clothing of the Future",
      excerpt_es: "La fusión entre moda urbana de alta gama y prendas funcionales diseñadas para resistir las inclemencias del clima metropolitano.",
      excerpt_en: "The fusion of high-end streetwear and functional garments designed to withstand the harsh metropolitan weather.",
      content_es: `# Minimalismo Utilitario\n\nLa moda ya no solo busca complacer el sentido de la vista. Las demandas del estilo de vida contemporáneo exigen prendas inteligentes que unan estilo, comodidad y alta resistencia a elementos climáticos.\n\n## Materiales Tecnológicos de Vanguardia\n\nTejidos impermeables ultraligeros, bolsillos modulares ocultos y fibras térmicas inteligentes se incorporan a cortes minimalistas inspirados en la sastrería clásica y el streetwear premium.\n\n## Estética vs. Funcionalidad\n\nEsta corriente demuestra que lo técnico no está reñido con lo elegante. Diseñar prendas que sirvan tanto para una reunión ejecutiva como para transitar una tormenta de regreso a casa es el nuevo desafío del diseño textil.`,
      content_en: `# Utilitarian Minimalism\n\nFashion no longer just aims to please the eye. The demands of contemporary lifestyles require smart garments merging style, comfort, and high weather resistance.\n\n## Cutting-Edge Technical Fabrics\n\nUltralight waterproof fabrics, hidden modular pockets, and smart thermal fibers are integrated into minimalist cuts inspired by classic tailoring and premium streetwear.\n\n## Aesthetics vs. Functionality\n\nThis movement demonstrates that technical elements don't clash with elegance. Designing garments suitable for an executive meeting and walking through a rainstorm on the way home is textile design's new challenge.`,
      cover_image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
      cover_image_alt: "Abrigos minimalistas utilitarios",
      category_id: getCatId("moda"),
      status: "published",
      is_featured: false,
      meta_title: "Moda y Minimalismo Utilitario | YAN MAG",
      meta_description: "Prendas funcionales diseñadas para resistir el clima metropolitano con estilo.",
      slug_base: "minimalismo-utilitario-la-ropa-del-futuro"
    },
    {
      title_es: "Diseño Biofílico: Integrando la Naturaleza en la Oficina",
      title_en: "Biophilic Design: Integrating Nature into the Office",
      excerpt_es: "Cómo las plantas y los materiales orgánicos en los espacios de trabajo reducen el estrés y aumentan la productividad.",
      excerpt_en: "How plants and organic materials in workspaces reduce stress and increase productivity.",
      content_es: `# Diseño Biofílico en Oficinas\n\nPasar largas jornadas de trabajo encerrados entre paredes grises de hormigón desgasta nuestro ánimo. El diseño biofílico propone reconectarnos con el entorno biológico mediante la inclusión de elementos vivos en la arquitectura interior.\n\n## Aire Limpio y Enfoque Mental\n\nInstalar muros verdes verticales y plantas filtradoras de aire no solo purifica el ambiente, sino que disminuye los niveles de cortisol (la hormona del estrés) en el organismo de los trabajadores.\n\n## Materiales que Respiran\n\nEl uso de maderas de origen sostenible, piedras naturales y la imitación de patrones naturales en alfombras y textiles estimula los sentidos y crea espacios laborales amables, creativos y eficientes.`,
      content_en: `# Biophilic Design in Offices\n\nSpending long workdays enclosed in gray concrete walls depletes our spirits. Biophilic design proposes reconnecting us with the biological environment by including living elements in interior architecture.\n\n## Clean Air and Mental Focus\n\nInstalling vertical green walls and air-filtering plants not only purifies the environment but also lowers cortisol (stress hormone) levels in workers' bodies.\n\n## Breathing Materials\n\nUsing sustainably sourced woods, natural stones, and mimicking natural patterns in carpets and textiles stimulates the senses, creating friendly, creative, and efficient workspaces.`,
      cover_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
      cover_image_alt: "Oficina corporativa verde",
      category_id: getCatId("lifestyle"),
      status: "published",
      is_featured: false,
      meta_title: "Diseño biofílico en oficinas | YAN MAG",
      meta_description: "Cómo las plantas y los materiales orgánicos en el trabajo aumentan la productividad.",
      slug_base: "diseno-biofilico-integrando-la-naturaleza-en-la-oficina"
    },
    {
      title_es: "La Belleza de lo Imperfecto: El Wabi-Sabi Moderno",
      title_en: "The Beauty of the Imperfect: Modern Wabi-Sabi",
      excerpt_es: "Por qué deberíamos abrazar la imperfección y la transitoriedad en el diseño y en nuestras vidas diarias.",
      excerpt_en: "Why we should embrace imperfection and transience in design and in our daily lives.",
      content_es: `# La Belleza de lo Imperfecto: Wabi-Sabi\n\nLa filosofía tradicional japonesa del Wabi-Sabi nos invita a encontrar la belleza en las cosas simples, desgastadas e imperfectas. En una cultura obsesionada con el perfeccionismo estéril y digital, este concepto cobra más relevancia que nunca.\n\n## La Pátina del Tiempo\n\nUn jarrón agrietado reparado con hilos de oro (Kintsugi) no oculta su fractura; la celebra. Los materiales que envejecen de forma natural, como el cuero, la madera y el lino rústico, ganan carácter con los años.\n\n## Aceptar la Transitoriedad\n\nLlevar esta filosofía a nuestro hogar implica rechazar lo plástico y lo prefabricado a favor de lo singular y artesanal. Es un recordatorio físico de que nada dura, nada está terminado y nada es perfecto.`,
      content_en: `# The Beauty of the Imperfect: Wabi-Sabi\n\nThe traditional Japanese philosophy of Wabi-Sabi invites us to find beauty in simple, worn, and imperfect things. In a culture obsessed with sterile digital perfectionism, this concept is more relevant than ever.\n\n## The Patina of Time\n\nA cracked vase repaired with gold lacquer (Kintsugi) does not hide its fracture; it celebrates it. Materials that age naturally, like leather, wood, and rustic linen, gain character over the years.\n\n## Accepting Transience\n\nBringing this philosophy into our homes means rejecting plastic and prefabricated goods in favor of the unique and artisanal. It is a physical reminder that nothing lasts, nothing is finished, and nothing is perfect.`,
      cover_image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop",
      cover_image_alt: "Cerámica rústica japonesa",
      category_id: getCatId("opinion"),
      status: "published",
      is_featured: false,
      meta_title: "Filosofía Wabi-Sabi en el hogar | YAN MAG",
      meta_description: "Por qué deberíamos abrazar la imperfección en el diseño y en nuestras vidas diarias.",
      slug_base: "la-belleza-de-lo-imperfecto-el-wabi-sabi-moderno"
    }
  ];

  const articlesToInsert = seedData.map((item, index) => {
    // Stagger dates so they display over the last 10 days
    const date = new Date();
    date.setDate(date.getDate() - index);
    
    // Add random suffix to slug to prevent collisions
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${item.slug_base}-${randomSuffix}`;

    return {
      slug,
      title_es: item.title_es,
      title_en: item.title_en,
      excerpt_es: item.excerpt_es,
      excerpt_en: item.excerpt_en,
      content_es: item.content_es,
      content_en: item.content_en,
      cover_image: item.cover_image,
      cover_image_alt: item.cover_image_alt,
      category_id: item.category_id,
      author_id: authorId,
      status: item.status,
      is_featured: item.is_featured,
      meta_title: item.meta_title,
      meta_description: item.meta_description,
      published_at: date.toISOString(),
      created_at: date.toISOString(),
      updated_at: date.toISOString(),
    };
  });

  const { data, error } = await supabase
    .from('articles')
    .insert(articlesToInsert)
    .select();

  if (error) {
    throw new Error(`Error al insertar artículos: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/articulos');

  return { success: true, count: data?.length || 0 };
}

export async function getCarouselArticles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*), author:profiles(*)')
    .eq('status', 'published')
    .eq('featured_position', 'carousel')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data || [];
}

export async function getHeroFeaturedArticle() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*, category:categories(*), author:profiles(*)')
    .eq('status', 'published')
    .eq('featured_position', 'hero_featured')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateFeaturedPosition(articleId: string, position: 'carousel' | 'hero_featured' | null) {
  const supabase = await createClient();
  
  // If setting hero_featured, clear any existing hero_featured first (only 1 allowed)
  if (position === 'hero_featured') {
    await supabase
      .from('articles')
      .update({ featured_position: null })
      .eq('featured_position', 'hero_featured');
  }

  // Check carousel limit (max 5)
  if (position === 'carousel') {
    const { count } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('featured_position', 'carousel');
    
    if ((count || 0) >= 5) {
      throw new Error('El carrusel ya tiene 5 artículos. Elimina uno antes de agregar otro.');
    }
  }

  const { data, error } = await supabase
    .from('articles')
    .update({ featured_position: position })
    .eq('id', articleId)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/');
  revalidatePath('/admin');
  return data;
}

export async function getArticlesForFeaturedManager() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title_es, title_en, cover_image, status, is_featured, featured_position, category:categories(name_es, slug, color), published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
