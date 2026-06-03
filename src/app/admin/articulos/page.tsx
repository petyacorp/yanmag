'use client';

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { getArticles, deleteArticle } from "@/lib/actions/articles";
import { getCategories } from "@/lib/actions/categories";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const { articles: fetchedArticles } = await getArticles();
      const fetchedCategories = await getCategories();
      setArticles(fetchedArticles);
      setCategories(fetchedCategories);
    } catch (e) {
      console.error("Error loading articles:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este artículo?")) {
      try {
        await deleteArticle(id);
        setArticles(prev => prev.filter(art => art.id !== id));
      } catch (e) {
        console.error("Error deleting article:", e);
        alert("No se pudo eliminar el artículo. Verifica tus permisos.");
      }
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesSearch = search === "" || 
      (art.title_es && art.title_es.toLowerCase().includes(search.toLowerCase())) ||
      (art.title_en && art.title_en.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "" || art.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayData = filteredArticles.map(art => ({
    id: art.id,
    title: art.title_es,
    category: art.category?.name_es || 'Sin categoría',
    author: art.author?.full_name || art.author?.email?.split('@')[0] || 'Autor',
    date: new Date(art.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: art.status
  }));

  const columns = [
    { key: "title", label: "Título" },
    { key: "category", label: "Categoría" },
    { key: "author", label: "Autor" },
    { key: "date", label: "Fecha" },
    { key: "status", label: "Estado" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none text-sm outline-none transition-colors text-[var(--color-yan-charcoal)] placeholder:text-[var(--color-yan-stone)]"
          />
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 text-sm outline-none text-[var(--color-yan-charcoal)] w-full sm:w-auto"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name_es}</option>
            ))}
          </select>
          <button onClick={loadData} className="flex items-center px-4 py-2 border border-[var(--color-yan-border)] hover:bg-[var(--color-yan-surface-elevated)] rounded-none transition-colors text-sm text-[var(--color-yan-charcoal)] font-medium">
            Recargar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center text-[var(--color-yan-stone)]">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-yan-red)]" />
          <p className="font-mono text-xs uppercase tracking-widest">Cargando artículos...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={displayData} editLinkPrefix="/admin/articulos" onDelete={handleDelete} />
      )}
    </div>
  );
}
