"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import { Plus, Loader2, Save, X, Globe } from "lucide-react";
import { getTags, createTag, updateTag, deleteTag } from "@/lib/actions/tags";

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameEs, setNameEs] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [formTab, setFormTab] = useState<"es" | "en">("es");

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await getTags();
      setTags(data);
    } catch (e) {
      console.error("Error loading tags:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
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
    const originalTag = tags.find(t => t.id === row.id);
    if (originalTag) {
      setEditingId(originalTag.id);
      setNameEs(originalTag.name_es || "");
      setNameEn(originalTag.name_en || "");
      setSlug(originalTag.slug || "");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNameEs("");
    setNameEn("");
    setSlug("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta etiqueta? Se desvinculará de todos los artículos asociados.")) {
      try {
        await deleteTag(id);
        setTags(prev => prev.filter(t => t.id !== id));
        if (editingId === id) {
          handleCancel();
        }
      } catch (e) {
        console.error("Error deleting tag:", e);
        alert("No se pudo eliminar la etiqueta.");
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
      const nameEnValue = nameEn.trim() || undefined;

      if (editingId) {
        await updateTag(editingId, nameEs, nameEnValue);
      } else {
        await createTag(nameEs, nameEnValue);
      }
      
      handleCancel();
      await loadTags();
    } catch (e) {
      console.error("Error saving tag:", e);
      alert("Error al guardar la etiqueta. Asegúrate de que el slug sea único.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name_es", label: "Nombre (ES)" },
    { key: "name_en", label: "Nombre (EN)" },
    { key: "slug", label: "Slug" },
    { key: "created_at", label: "Creado" },
  ];

  const displayData = tags.map(tag => {
    const dateObj = new Date(tag.created_at);
    const dateStr = dateObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    return {
      id: tag.id,
      name_es: tag.name_es,
      name_en: tag.name_en || "-",
      slug: tag.slug,
      created_at: dateStr,
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between pb-6 border-b border-[var(--color-yan-border)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-display text-[var(--color-yan-charcoal)]">Etiquetas</h1>
          <p className="text-[var(--color-yan-stone)] text-sm">Administra las palabras clave y temas asociados a los artículos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-[var(--color-yan-stone)]">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-yan-red)]" />
              <p className="font-mono text-xs uppercase tracking-widest">Cargando etiquetas...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={displayData} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>

        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none p-6 h-fit">
          <h3 className="text-lg font-bold font-display text-[var(--color-yan-charcoal)] mb-4 pb-2 border-b border-[var(--color-yan-border)]">
            {editingId ? "Editar Etiqueta" : "Añadir Etiqueta"}
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
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Nombre (Español)</label>
                <input 
                  type="text" 
                  value={nameEs}
                  onChange={(e) => handleNameEsChange(e.target.value)}
                  className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] transition-colors" 
                  placeholder="Ej. Fotografía" 
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Nombre (Inglés)</label>
                <input 
                  type="text" 
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] transition-colors" 
                  placeholder="Ej. Photography" 
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Slug URL (Único)</label>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)] transition-colors font-mono" 
                placeholder="ej-fotografia" 
              />
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
