"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import { Plus, Loader2, Save, X, Globe } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameEs, setNameEs] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionEs, setDescriptionEs] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [color, setColor] = useState("#A6342A");
  const [icon, setIcon] = useState("folder");
  const [formTab, setFormTab] = useState<"es" | "en">("es");

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      // Hide internal system category
      setCategories(data.filter((cat: any) => cat.slug !== "system-pizarra"));
    } catch (e) {
      console.error("Error loading categories:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameEsChange = (val: string) => {
    setNameEs(val);
    if (!editingId) {
      const generatedSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // replace spaces with dashes
        .replace(/-+/g, "-") // remove multiple dashes
        .trim();
      setSlug(generatedSlug);
    }
  };

  const handleEdit = (row: any) => {
    const originalCat = categories.find(cat => cat.id === row.id);
    if (originalCat) {
      setEditingId(originalCat.id);
      setNameEs(originalCat.name_es || "");
      setNameEn(originalCat.name_en || "");
      setSlug(originalCat.slug || "");
      setDescriptionEs(originalCat.description_es || "");
      setDescriptionEn(originalCat.description_en || "");
      setColor(originalCat.color || "#A6342A");
      setIcon(originalCat.icon || "folder");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNameEs("");
    setNameEn("");
    setSlug("");
    setDescriptionEs("");
    setDescriptionEn("");
    setColor("#A6342A");
    setIcon("folder");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría? Esto podría afectar a los artículos asociados.")) {
      try {
        await deleteCategory(id);
        setCategories(prev => prev.filter(cat => cat.id !== id));
        if (editingId === id) {
          handleCancel();
        }
      } catch (e) {
        console.error("Error deleting category:", e);
        alert("No se pudo eliminar la categoría. Verifica si hay artículos que dependen de ella.");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEs.trim()) {
      alert("El nombre en español es requerido.");
      return;
    }
    if (!slug.trim()) {
      alert("El slug es requerido.");
      return;
    }

    try {
      setSaving(true);
      const formData = {
        name_es: nameEs,
        name_en: nameEn || null,
        slug: slug,
        description_es: descriptionEs || null,
        description_en: descriptionEn || null,
        color: color,
        icon: icon,
      } as any;

      if (editingId) {
        await updateCategory(editingId, formData);
      } else {
        await createCategory(formData);
      }
      
      handleCancel();
      await loadCategories();
    } catch (e) {
      console.error("Error saving category:", e);
      alert("Error al guardar la categoría. Asegúrate de que el slug sea único.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name_es", label: "Nombre (ES)" },
    { key: "name_en", label: "Nombre (EN)" },
    { key: "slug", label: "Slug" },
    { key: "colorBadge", label: "Color" },
  ];

  const displayData = categories.map(cat => ({
    id: cat.id,
    name_es: cat.name_es,
    name_en: cat.name_en || "-",
    slug: cat.slug,
    colorBadge: (
      <div className="flex items-center gap-2">
        <span className="w-3.5 h-3.5 inline-block border border-[var(--color-yan-border)]" style={{ backgroundColor: cat.color }}></span>
        <span className="font-mono text-xs uppercase">{cat.color}</span>
      </div>
    )
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between pb-6 border-b border-[var(--color-yan-border)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-display text-[var(--color-yan-charcoal)]">Categorías</h1>
          <p className="text-[var(--color-yan-stone)] text-sm">Administra las secciones de la revista.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-[var(--color-yan-stone)]">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-yan-red)]" />
              <p className="font-mono text-xs uppercase tracking-widest">Cargando categorías...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={displayData} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>

        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none p-6 h-fit">
          <h3 className="text-lg font-bold font-display text-[var(--color-yan-charcoal)] mb-4 pb-2 border-b border-[var(--color-yan-border)]">
            {editingId ? "Editar Categoría" : "Añadir Categoría"}
          </h3>
          
          <form onSubmit={handleSave} className="space-y-4">
            {/* Language tabs */}
            <div className="flex border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] p-0.5">
              <button 
                type="button"
                className={`flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${formTab === 'es' ? 'bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]' : 'text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]'}`}
                onClick={() => setFormTab("es")}
              >
                <Globe className="w-3 h-3" /> ES
              </button>
              <button 
                type="button"
                className={`flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${formTab === 'en' ? 'bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]' : 'text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]'}`}
                onClick={() => setFormTab("en")}
              >
                <Globe className="w-3 h-3" /> EN
              </button>
            </div>

            {formTab === "es" ? (
              <>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Nombre (Español)</label>
                  <input 
                    type="text" 
                    value={nameEs}
                    onChange={(e) => handleNameEsChange(e.target.value)}
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] transition-colors" 
                    placeholder="Ej. Arte y Diseño" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Descripción (Español)</label>
                  <textarea 
                    value={descriptionEs}
                    onChange={(e) => setDescriptionEs(e.target.value)}
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] resize-none h-20 transition-colors" 
                    placeholder="Sección dedicada al arte..."
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Nombre (Inglés)</label>
                  <input 
                    type="text" 
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] transition-colors" 
                    placeholder="Ej. Art & Design" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Descripción (Inglés)</label>
                  <textarea 
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] resize-none h-20 transition-colors" 
                    placeholder="Section dedicated to art..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Slug URL (Único)</label>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] transition-colors font-mono" 
                placeholder="ej-arte-diseno" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 border border-[var(--color-yan-border)] bg-transparent cursor-pointer p-0 rounded-none"
                  />
                  <input 
                    type="text" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-2 py-1 outline-none text-xs text-[var(--color-yan-charcoal)] font-mono uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Icono</label>
                <input 
                  type="text" 
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] transition-colors" 
                  placeholder="folder" 
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {editingId && (
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2 border border-[var(--color-yan-border)] hover:bg-[var(--color-yan-surface-elevated)] rounded-none transition-colors text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              )}
              <button 
                type="submit"
                disabled={saving}
                className="flex-1 py-2 bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] text-[var(--color-yan-ivory)] rounded-none transition-colors text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
