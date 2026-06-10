import StatsCard from "@/components/admin/StatsCard";
import { Users, FileText, Eye, TrendingUp, Plus, Clipboard, Save } from "lucide-react";
import Link from "next/link";
import { getArticles, getArticlesForFeaturedManager } from "@/lib/actions/articles";
import { getNewsletterSubscribers, getTickerItems, getSiteSettings } from "@/lib/actions/settings";
import { getCategoryBySlug, createCategory, updateCategory } from "@/lib/actions/categories";
import { getDashboardTasks } from "@/lib/actions/tasks";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import TickerEditor from "@/components/admin/TickerEditor";
import FeaturedManager from "@/components/admin/FeaturedManager";
import QuoteEditor from "@/components/admin/QuoteEditor";
import DashboardTaskList from "@/components/admin/DashboardTaskList";

export default async function AdminDashboard() {
  // Promote user to admin if in authorized emails list
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.email) {
    const ADMIN_EMAILS = ['nicko.pereira@gmail.com', 'micko.pereira@gmail.com', 'gianfrandres@gmail.com', 'petyacorp@gmail.com'];
    if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (profile && profile.role !== 'admin') {
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      }
    }
  }

  // Fetch real articles count and recent posts
  const { articles: recentArticles, count: articlesCount } = await getArticles({ limit: 4 });
  
  // Fetch real subscribers count
  const subscribers = await getNewsletterSubscribers();
  const subscribersCount = subscribers.filter(s => s.is_active).length;

  // Fetch ticker items for the editor
  const tickerItems = await getTickerItems();

  // Fetch site settings for QuoteEditor
  const settings = await getSiteSettings();
  const taglineEs = settings?.tagline_es || "";
  const taglineEn = settings?.tagline_en || "";
  const quoteAuthor = settings?.quote_author || "";

  let isSchemaPending = false;

  // Fetch dashboard tasks (with error handling if table doesn't exist yet)
  let dashboardTasks: Awaited<ReturnType<typeof getDashboardTasks>> = [];
  try {
    dashboardTasks = await getDashboardTasks();
  } catch (err: any) {
    isSchemaPending = true;
    dashboardTasks = [];
  }

  // Fetch articles for featured manager (with error handling if column doesn't exist yet)
  let featuredArticles: Awaited<ReturnType<typeof getArticlesForFeaturedManager>> = [];
  try {
    featuredArticles = await getArticlesForFeaturedManager();
  } catch (err: any) {
    if (err?.message?.includes('featured_position') || err?.code === 'PGRST204') {
      isSchemaPending = true;
    }
    featuredArticles = [];
  }

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
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const updaterName = user?.user_metadata?.full_name || user?.email || 'Sistema';

      await updateCategory(existing.id, {
        description_es: message || '',
        description_en: updaterName, // store updater email/name
        updated_at: new Date().toISOString()
      } as any);
      revalidatePath('/admin');
    }
  }

  const stats = [
    { title: "Artículos Totales", value: articlesCount, icon: FileText, trend: "+12% este mes", trendUp: true },
    { title: "Visitas (30d)", value: "45.2K", icon: Eye, trend: "+5.4%", trendUp: true, href: "https://vercel.com/canispetyas-projects/yanmag/analytics", external: true },
    { title: "Suscriptores", value: subscribersCount, icon: Users, trend: `+${subscribers.length}`, trendUp: true, href: "/admin/suscriptores" },
    { title: "Tasa de Rebote", value: "42%", icon: TrendingUp, trend: "-2.1%", trendUp: true, href: "https://vercel.com/canispetyas-projects/yanmag/analytics", external: true },
  ];

  const lastUpdated = pizarraCategory?.updated_at 
    ? new Date(pizarraCategory.updated_at).toLocaleString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    : '';
  const lastUpdater = pizarraCategory?.description_en || '';

  return (
    <div className="max-w-[1200px] mx-auto py-4">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--color-yan-border)]">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[var(--color-yan-charcoal)] mb-2">Dashboard</h1>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[var(--color-yan-stone)] text-sm">Resumen de la actividad reciente y métricas clave.</p>
            <span className="text-[var(--color-yan-border)] hidden sm:inline">|</span>
            <a 
              href="https://vercel.com/canispetyas-projects/yanmag/analytics" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs font-mono uppercase text-[var(--color-yan-red)] hover:underline flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Ver Vercel Analytics
            </a>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link 
            href="/admin/articulos/nuevo"
            className="flex items-center justify-center gap-2 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] px-5 py-3 hover:bg-[var(--color-yan-red)] transition-colors text-[13px] font-medium tracking-wide"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Nuevo Artículo
          </Link>
        </div>
      </div>

      {isSchemaPending && (
        <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-none flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1">
            <h3 className="font-display font-semibold text-base mb-1 flex items-center gap-2">
              <span>⚠️</span> Pendiente Actualización de Base de Datos
            </h3>
            <p className="text-[13px] text-amber-700/80 dark:text-amber-300/80 leading-relaxed max-w-[800px]">
              Se han detectado cambios pendientes en el esquema de la base de datos de Supabase. Para que el **Carrusel**, el **Ticker de títulos**, la **lista de tareas (checklist)** con rastreo de usuarios, la **búsqueda sin acentos** y la **creación de carpetas** funcionen correctamente, debes ejecutar los siguientes scripts en el editor de SQL de tu consola de Supabase:
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono">
              <a href="file:///c:/Users/dell/OneDrive/Desktop/APPS/_YANMAG_/supabase/add_featured_and_ticker.sql" className="underline hover:text-amber-950 dark:hover:text-amber-100 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> add_featured_and_ticker.sql
              </a>
              <a href="file:///c:/Users/dell/OneDrive/Desktop/APPS/_YANMAG_/supabase/add_task_creator.sql" className="underline hover:text-amber-950 dark:hover:text-amber-100 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> add_task_creator.sql
              </a>
              <a href="file:///c:/Users/dell/OneDrive/Desktop/APPS/_YANMAG_/supabase/add_unaccent_search.sql" className="underline hover:text-amber-950 dark:hover:text-amber-100 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> add_unaccent_search.sql
              </a>
              <a href="file:///c:/Users/dell/OneDrive/Desktop/APPS/_YANMAG_/supabase/fix_storage_rls.sql" className="underline hover:text-amber-950 dark:hover:text-amber-100 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> fix_storage_rls.sql
              </a>
            </div>
          </div>
          <div className="bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono text-[10px] px-3 py-1.5 uppercase tracking-wider font-semibold">
            Esquema Incompleto
          </div>
        </div>
      )}

      {/* Highlighted Pizarra Widget (Editorial notice board) */}
      <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] border-l-4 border-l-[var(--color-yan-red)] p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-yan-border)] mb-4">
          <h2 className="text-base font-display font-semibold text-[var(--color-yan-charcoal)] flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-[var(--color-yan-red)]" strokeWidth={1.5} />
            Pizarra de Redacción
          </h2>
          {lastUpdated && (
            <span className="text-[9px] font-mono text-[var(--color-yan-stone)] uppercase tracking-widest bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] px-2.5 py-0.5 font-bold">
              Última actualización: {lastUpdated}{lastUpdater ? ` por ${lastUpdater}` : ''}
            </span>
          )}
        </div>
        
        <form action={savePizarraMessage} className="flex flex-col md:flex-row gap-4 items-stretch">
          <textarea
            name="pizarraMessage"
            defaultValue={pizarraCategory?.description_es || ''}
            placeholder="Escribe un anuncio, recordatorio o nota aquí para todo el equipo de redacción..."
            className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] p-4 text-[13px] text-[var(--color-yan-charcoal)] outline-none resize-none h-24 transition-colors font-sans leading-relaxed shadow-inner"
          ></textarea>
          
          <div className="flex flex-col justify-center gap-3 w-full md:w-56 shrink-0">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] text-[var(--color-yan-ivory)] py-3 text-[11px] font-mono uppercase tracking-widest font-semibold transition-colors"
            >
              <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
              Guardar Nota
            </button>
            <p className="text-[10px] text-[var(--color-yan-stone)] font-mono leading-normal text-center md:text-left">
              * Este mensaje será visible para todos los redactores y editores al ingresar al panel.
            </p>
          </div>
        </form>
      </div>

      <DashboardTaskList initialTasks={dashboardTasks} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Featured Manager — Full Width */}
      <div className="mb-8">
        <FeaturedManager articles={featuredArticles as any} />
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
                    <h3 className="font-medium text-[var(--color-yan-charcoal)] mb-1 leading-snug">
                      <Link 
                        href={`/admin/articulos/${article.id}/editar`}
                        className="hover:text-[var(--color-yan-red)] hover:underline transition-colors"
                      >
                        {article.title_es}
                      </Link>
                    </h3>
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

        <div className="space-y-6">
          {/* Ticker Editor Widget */}
          <TickerEditor 
            initialItemsEs={tickerItems.items_es} 
            initialItemsEn={tickerItems.items_en} 
          />

          <QuoteEditor
            initialTaglineEs={taglineEs}
            initialTaglineEn={taglineEn}
            initialQuoteAuthor={quoteAuthor}
          />

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
