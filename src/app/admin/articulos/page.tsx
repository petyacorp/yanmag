import DataTable from "@/components/admin/DataTable";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function ArticlesPage() {
  const articles = [
    { id: "1", title: "El futuro del diseño editorial", category: "Arte", author: "Ana Silva", status: "Borrador", date: "22 May 2026" },
    { id: "2", title: "Entrevista a Maria Santos", category: "Entrevistas", author: "Carlos Ruiz", status: "Publicado", date: "20 May 2026" },
    { id: "3", title: "Tendencias de moda otoño-invierno", category: "Moda", author: "Ana Silva", status: "Publicado", date: "18 May 2026" },
    { id: "4", title: "Exposición en el MET: Reseña", category: "Cultura", author: "Elena Gómez", status: "Borrador", date: "15 May 2026" },
    { id: "5", title: "La evolución de la fotografía digital", category: "Arte", author: "Carlos Ruiz", status: "Publicado", date: "10 May 2026" },
  ];

  const columns = [
    { key: "title", label: "Título" },
    { key: "category", label: "Categoría" },
    { key: "author", label: "Autor" },
    { key: "date", label: "Fecha" },
    { key: "status", label: "Estado" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-[var(--color-yan-border)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-display text-[var(--color-yan-charcoal)]">Artículos</h1>
          <p className="text-[var(--color-yan-stone)] text-sm">Gestiona todos los artículos de la revista.</p>
        </div>
        <Link href="/admin/articulos/nuevo" className="flex items-center px-5 py-3 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] hover:bg-[var(--color-yan-red)] rounded-none transition-colors text-[13px] font-medium tracking-wide">
          <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Nuevo Artículo
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center bg-[var(--color-yan-surface)] p-4 border border-[var(--color-yan-border)] rounded-none">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
          <input 
            type="text" 
            placeholder="Buscar artículos..." 
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none text-sm outline-none transition-colors text-[var(--color-yan-charcoal)] placeholder:text-[var(--color-yan-stone)]"
          />
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <select className="bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 text-sm outline-none text-[var(--color-yan-charcoal)] w-full sm:w-auto">
            <option value="">Todas las categorías</option>
            <option value="arte">Arte</option>
            <option value="moda">Moda</option>
            <option value="cultura">Cultura</option>
            <option value="entrevistas">Entrevistas</option>
          </select>
          <button className="flex items-center px-4 py-2 border border-[var(--color-yan-border)] hover:bg-[var(--color-yan-surface-elevated)] rounded-none transition-colors text-sm text-[var(--color-yan-charcoal)] font-medium">
            <Filter className="w-4 h-4 mr-2 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
            Filtros
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={articles} editLinkPrefix="/admin/articulos" />
    </div>
  );
}
