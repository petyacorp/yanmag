import DataTable from "@/components/admin/DataTable";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const categories = [
    { id: "1", name: "Arte", slug: "arte", count: 24 },
    { id: "2", name: "Moda", slug: "moda", count: 18 },
    { id: "3", name: "Cultura", slug: "cultura", count: 32 },
    { id: "4", name: "Entrevistas", slug: "entrevistas", count: 12 },
  ];

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "slug", label: "Slug" },
    { key: "count", label: "Artículos" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-[var(--color-yan-border)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-display text-[var(--color-yan-charcoal)]">Categorías</h1>
          <p className="text-[var(--color-yan-stone)] text-sm">Administra las secciones de la revista.</p>
        </div>
        <button className="flex items-center px-5 py-3 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] hover:bg-[var(--color-yan-red)] rounded-none transition-colors text-[13px] font-medium tracking-wide">
          <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DataTable columns={columns} data={categories} />
        </div>
        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none p-6 h-fit">
          <h3 className="text-lg font-bold font-display text-[var(--color-yan-charcoal)] mb-4 pb-2 border-b border-[var(--color-yan-border)]">Añadir Categoría</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Nombre</label>
              <input type="text" className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] transition-colors" placeholder="Ej. Arquitectura" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Slug</label>
              <input type="text" className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] transition-colors" placeholder="ej-arquitectura" />
            </div>
            <button className="w-full py-2 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] hover:border-[var(--color-yan-red)] focus:border-[var(--color-yan-red)] rounded-none transition-colors text-sm font-medium text-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-surface)]">
              Guardar Categoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
