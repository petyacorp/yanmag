import DataTable from "@/components/admin/DataTable";
import { Plus } from "lucide-react";

export default function PagesPage() {
  const pages = [
    { id: "1", title: "Sobre Nosotros", slug: "/about", status: "Publicado", lastEdit: "10 Ene 2026" },
    { id: "2", title: "Contacto", slug: "/contacto", status: "Publicado", lastEdit: "15 Ene 2026" },
    { id: "3", title: "Manifiesto", slug: "/manifiesto", status: "Publicado", lastEdit: "02 Feb 2026" },
    { id: "4", title: "Términos y Condiciones", slug: "/terminos", status: "Borrador", lastEdit: "20 May 2026" },
  ];

  const columns = [
    { key: "title", label: "Título" },
    { key: "slug", label: "Ruta" },
    { key: "lastEdit", label: "Última Edición" },
    { key: "status", label: "Estado" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Páginas Estáticas</h1>
          <p className="text-yan-muted">Gestiona las páginas informativas del sitio.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-yan-accent text-white rounded-md hover:bg-yan-accent-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Página
        </button>
      </div>

      <DataTable columns={columns} data={pages} />
    </div>
  );
}
