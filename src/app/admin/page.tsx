import StatsCard from "@/components/admin/StatsCard";
import { Users, FileText, Eye, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { MOCK_ARTICLES } from "@/lib/mockData";

export default function AdminDashboard() {
  const stats = [
    { title: "Artículos Totales", value: "124", icon: FileText, trend: "+12% este mes", trendUp: true },
    { title: "Visitas (30d)", value: "45.2K", icon: Eye, trend: "+5.4%", trendUp: true },
    { title: "Suscriptores", value: "8,340", icon: Users, trend: "+124", trendUp: true },
    { title: "Tasa de Rebote", value: "42%", icon: TrendingUp, trend: "-2.1%", trendUp: true },
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-4">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--color-yan-border)]">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[var(--color-yan-charcoal)] mb-2">Dashboard</h1>
          <p className="text-[var(--color-yan-stone)] text-sm">Resumen de la actividad reciente y métricas clave.</p>
        </div>
        <Link 
          href="/admin/articulos/nuevo"
          className="flex items-center gap-2 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] px-5 py-3 hover:bg-[var(--color-yan-red)] transition-colors text-[13px] font-medium tracking-wide"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Nuevo Artículo
        </Link>
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
            {MOCK_ARTICLES.slice(0, 4).map((article) => (
              <div key={article.slug} className="p-6 flex items-center justify-between hover:bg-[var(--color-yan-surface-elevated)] transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--color-yan-charcoal)] mb-1 leading-snug">{article.title}</h3>
                  <div className="flex items-center gap-4 text-[12px] text-[var(--color-yan-stone)] mt-2">
                    <span className="font-mono uppercase tracking-widest">{article.category.name}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>
                </div>
                <div className="ml-6 flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium tracking-wide uppercase border border-emerald-500/20">
                    Publicado
                  </span>
                  <Link href={`/admin/articulos/${article.slug}/editar`} className="text-[13px] font-medium text-[var(--color-yan-stone)] hover:text-[var(--color-yan-red)] transition-colors">
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] flex flex-col">
          <div className="px-6 py-5 border-b border-[var(--color-yan-border)]">
            <h2 className="text-lg font-display font-semibold text-[var(--color-yan-charcoal)]">Borradores</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
            </div>
            <p className="text-[var(--color-yan-charcoal)] font-medium mb-1">No hay borradores</p>
            <p className="text-[13px] text-[var(--color-yan-stone)] mb-6 max-w-[200px]">Empieza a escribir tu próxima gran historia.</p>
            <Link 
              href="/admin/articulos/nuevo"
              className="text-[13px] font-medium text-[var(--color-yan-red)] border-b border-transparent hover:border-[var(--color-yan-red)] transition-colors pb-0.5"
            >
              Crear nuevo borrador
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
