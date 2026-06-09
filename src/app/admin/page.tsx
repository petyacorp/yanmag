import StatsCard from "@/components/admin/StatsCard";
import { Users, FileText, Eye, TrendingUp, Plus, Clipboard, Save } from "lucide-react";
import Link from "next/link";
import { getArticles } from "@/lib/actions/articles";
import SeedArticlesButton from "@/components/admin/SeedArticlesButton";
import { getNewsletterSubscribers } from "@/lib/actions/settings";
import { getCategoryBySlug, createCategory, updateCategory } from "@/lib/actions/categories";
import { revalidatePath } from "next/cache";

export default async function AdminDashboard() {
  // Fetch real articles count and recent posts
  const { articles: recentArticles, count: articlesCount } = await getArticles({ limit: 4 });
  
  // Fetch real subscribers count
  const subscribers = await getNewsletterSubscribers();
  const subscribersCount = subscribers.filter(s => s.is_active).length;

  // Fetch or create system-pizarra category for the whiteboard
  let pizarraCategory = await getCategoryBySlug('system-pizarra');
  if (!pizarraCategory) {
    try {
      pizarraCategory = await createCategory({
        name_es: 'Pizarra de Editores',
        name_en: 'Editors Whiteboard',
        slug: 'system-pizarra',
        description_es: 'Escribe aquí notas, recordatorios o mensajes para el resto del equipo de redacción.',
        description_en: 'Write notes, reminders, or messages for the editing team here.',
        color: '#A6342A',
        icon: 'clipboard'
      });
    } catch (e) {
      console.error('Failed to create system-pizarra category:', e);
    }
  }

  // Server Action to update message board
  async function savePizarraMessage(formData: FormData) {
    'use server';
    const message = formData.get('pizarraMessage') as string;
    const existing = await getCategoryBySlug('system-pizarra');
    if (existing) {
      await updateCategory(existing.id, {
        description_es: message || '',
        updated_at: new Date().toISOString()
      } as any);
      revalidatePath('/admin');
    }
  }

  const stats = [
    { title: "Artículos Totales", value: articlesCount, icon: FileText, trend: "+12% este mes", trendUp: true },
    { title: "Visitas (30d)", value: "45.2K", icon: Eye, trend: "+5.4%", trendUp: true },
    { title: "Suscriptores", value: subscribersCount, icon: Users, trend: `+${subscribers.length}`, trendUp: true },
    { title: "Tasa de Rebote", value: "42%", icon: TrendingUp, trend: "-2.1%", trendUp: true },
  ];

  const lastUpdated = pizarraCategory?.updated_at 
    ? new Date(pizarraCategory.updated_at).toLocaleString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    : '';

  return (
    <div className="max-w-[1200px] mx-auto py-4">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--color-yan-border)]">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[var(--color-yan-charcoal)] mb-2">Dashboard</h1>
          <p className="text-[var(--color-yan-stone)] text-sm">Resumen de la actividad reciente y métricas clave.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SeedArticlesButton />
          <Link 
            href="/admin/articulos/nuevo"
            className="flex items-center justify-center gap-2 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] px-5 py-3 hover:bg-[var(--color-yan-red)] transition-colors text-[13px] font-medium tracking-wide"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Nuevo Artículo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)]">
          <div className="px-6 py-5 border-b border-[var(--color-yan-border)] flex justify-between items-center">
            <h2 className="text-lg font-display font-semibold text-[var(--color-yan-charcoal)]">Publicaciones Recientes</h2>
            <Link href="/admin/articulos" className="text-[12px] font-medium text-[var(--color-yan-red)] hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-yan-border)]">
            {recentArticles.length > 0 ? (
              recentArticles.map((article) => (
                <div key={article.slug} className="p-6 flex items-center justify-between hover:bg-[var(--color-yan-surface-elevated)] transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--color-yan-charcoal)] mb-1 leading-snug">{article.title_es}</h3>
                    <div className="flex items-center gap-4 text-[12px] text-[var(--color-yan-stone)] mt-2">
                      <span className="font-mono uppercase tracking-widest text-[10px]">{article.category?.name_es || 'Sin categoría'}</span>
                      <span>•</span>
                      <span>{new Date(article.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-none text-[10px] font-mono uppercase tracking-widest border ${
                      article.status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
                    }`}>
                      {article.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                    <Link href={`/admin/articulos/${article.id}/editar`} className="text-[13px] font-medium text-[var(--color-yan-stone)] hover:text-[var(--color-yan-red)] transition-colors ml-2">
                      Editar
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-[var(--color-yan-stone)] font-mono text-xs">
                No hay artículos recientes en la base de datos.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Functional Pizarra Widget */}
          <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-6 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-yan-border)] mb-4">
              <h2 className="text-lg font-display font-semibold text-[var(--color-yan-charcoal)] flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-[var(--color-yan-red)]" strokeWidth={1.5} />
                Pizarra de Redacción
              </h2>
              {lastUpdated && (
                <span className="text-[9px] font-mono text-[var(--color-yan-stone)] uppercase">
                  Act: {lastUpdated}
                </span>
              )}
            </div>
            
            <form action={savePizarraMessage} className="flex flex-col gap-4">
              <textarea
                name="pizarraMessage"
                defaultValue={pizarraCategory?.description_es || ''}
                placeholder="Escribe un anuncio o nota aquí para todo el equipo..."
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] p-3 text-[13px] text-[var(--color-yan-charcoal)] outline-none resize-none h-44 transition-colors font-sans leading-relaxed"
              ></textarea>
              
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] text-[var(--color-yan-ivory)] py-2 text-[12px] font-medium tracking-wide transition-colors"
              >
                <Save className="w-4 h-4" strokeWidth={1.5} />
                Guardar Pizarra
              </button>
            </form>
          </div>

          <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] flex flex-col">
            <div className="px-6 py-5 border-b border-[var(--color-yan-border)]">
              <h2 className="text-lg font-display font-semibold text-[var(--color-yan-charcoal)]">Estado del Sistema</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
              </div>
              <p className="text-[var(--color-yan-charcoal)] font-medium mb-1">Base de Datos Conectada</p>
              <p className="text-[13px] text-[var(--color-yan-stone)] mb-6 max-w-[200px]">Supabase RLS y almacenamiento de archivos activos.</p>
              <Link 
                href="/admin/configuracion"
                className="text-[13px] font-medium text-[var(--color-yan-red)] border-b border-transparent hover:border-[var(--color-yan-red)] transition-colors pb-0.5"
              >
                Configuración del sitio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
