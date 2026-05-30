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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Categorías</h1>
          <p className="text-yan-muted">Administra las secciones de la revista.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-yan-accent text-white rounded-md hover:bg-yan-accent-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DataTable columns={columns} data={categories} />
        </div>
        <div className="bg-yan-surface border border-yan-border rounded-lg p-6 h-fit">
          <h3 className="text-lg font-bold mb-4">Añadir Categoría</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-yan-muted mb-1">Nombre</label>
              <input type="text" className="w-full bg-yan-surface-elevated border border-yan-border rounded-md px-3 py-2 outline-none focus:border-yan-accent text-sm" placeholder="Ej. Arquitectura" />
            </div>
            <div>
              <label className="block text-sm font-medium text-yan-muted mb-1">Slug</label>
              <input type="text" className="w-full bg-yan-surface-elevated border border-yan-border rounded-md px-3 py-2 outline-none focus:border-yan-accent text-sm" placeholder="ej-arquitectura" />
            </div>
            <button className="w-full py-2 bg-yan-surface-elevated border border-yan-border rounded-md hover:border-yan-accent transition-colors text-sm font-medium">
              Guardar Categoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
