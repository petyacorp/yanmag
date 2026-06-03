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
      <div className="flex items-center justify-between pb-6 border-b border-[var(--color-yan-border)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-display text-[var(--color-yan-charcoal)]">Páginas Estáticas</h1>
          <p className="text-[var(--color-yan-stone)] text-sm">Gestiona las páginas informativas del sitio.</p>
        </div>
        <button className="flex items-center px-5 py-3 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] hover:bg-[var(--color-yan-red)] rounded-none transition-colors text-[13px] font-medium tracking-wide">
          <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Nueva Página
        </button>
      </div>

      <DataTable columns={columns} data={pages} />
    </div>
  );
}
