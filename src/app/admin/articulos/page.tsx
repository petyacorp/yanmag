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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Artículos</h1>
          <p className="text-yan-muted">Gestiona todos los artículos de la revista.</p>
        </div>
        <Link href="/admin/articulos/nuevo" className="flex items-center px-4 py-2 bg-yan-accent text-white rounded-md hover:bg-yan-accent-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Artículo
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center bg-yan-surface p-4 border border-yan-border rounded-lg">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-yan-muted" />
          <input 
            type="text" 
            placeholder="Buscar artículos..." 
            className="w-full pl-9 pr-4 py-2 bg-yan-surface-elevated border border-yan-border rounded-md text-sm outline-none focus:border-yan-accent transition-colors text-foreground"
          />
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <select className="bg-yan-surface-elevated border border-yan-border rounded-md px-4 py-2 text-sm outline-none focus:border-yan-accent text-foreground w-full sm:w-auto">
            <option value="">Todas las categorías</option>
            <option value="arte">Arte</option>
            <option value="moda">Moda</option>
            <option value="cultura">Cultura</option>
            <option value="entrevistas">Entrevistas</option>
          </select>
          <button className="flex items-center px-4 py-2 border border-yan-border rounded-md hover:bg-yan-surface-elevated transition-colors text-sm text-foreground">
            <Filter className="w-4 h-4 mr-2 text-yan-muted" />
            Filtros
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={articles} editLinkPrefix="/admin/articulos" />
    </div>
  );
}
