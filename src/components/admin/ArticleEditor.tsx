"use client";

import { useState } from "react";
import { Image as ImageIcon, Save, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import MediaUploader from "./MediaUploader";

export default function ArticleEditor({ isEditing = false }: { isEditing?: boolean }) {
  const [title, setTitle] = useState(isEditing ? "Entrevista exclusiva: El futuro del diseño en 2026" : "");
  const [slug, setSlug] = useState(isEditing ? "entrevista-exclusiva-futuro-diseno-2026" : "");
  const [content, setContent] = useState(isEditing ? "Aquí va el contenido en **Markdown**..." : "");
  const [category, setCategory] = useState(isEditing ? "entrevistas" : "");
  const [showUploader, setShowUploader] = useState(false);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/articulos" className="p-2 hover:bg-[var(--color-yan-surface-elevated)] border border-transparent hover:border-[var(--color-yan-border)] rounded-none transition-colors">
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <h1 className="text-2xl font-bold font-display text-[var(--color-yan-charcoal)]">{isEditing ? "Editar Artículo" : "Nuevo Artículo"}</h1>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-[var(--color-yan-border)] rounded-none hover:bg-[var(--color-yan-surface-elevated)] transition-colors text-sm font-medium">
            <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Vista Previa
          </button>
          <button className="flex items-center px-4 py-2 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] hover:bg-[var(--color-yan-red)] rounded-none transition-colors text-sm font-medium">
            <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none p-6 space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Escribe un título increíble..."
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-3 outline-none transition-colors text-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Contenido (Markdown)</label>
              <div className="border border-[var(--color-yan-border)] rounded-none overflow-hidden flex flex-col h-[500px]">
                <div className="bg-[var(--color-yan-surface-elevated)] border-b border-[var(--color-yan-border)] p-2 flex items-center space-x-2">
                  <button className="p-1.5 hover:bg-[var(--color-yan-surface)] rounded-none text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"><b>B</b></button>
                  <button className="p-1.5 hover:bg-[var(--color-yan-surface)] rounded-none text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"><i>I</i></button>
                  <button className="p-1.5 hover:bg-[var(--color-yan-surface)] rounded-none text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"><s>S</s></button>
                  <div className="w-px h-4 bg-[var(--color-yan-border)] mx-2"></div>
                  <button className="p-1.5 hover:bg-[var(--color-yan-surface)] rounded-none text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] flex items-center" onClick={() => setShowUploader(true)}>
                    <ImageIcon className="w-4 h-4 mr-1" strokeWidth={1.5} /> Media
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 w-full bg-[var(--color-yan-surface)] p-4 outline-none resize-none font-mono text-sm leading-relaxed text-[var(--color-yan-charcoal)]"
                  placeholder="Escribe tu contenido aquí..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none p-6 space-y-6">
            <h3 className="font-bold text-lg font-display border-b border-[var(--color-yan-border)] pb-3 text-[var(--color-yan-charcoal)]">Publicación</h3>
            
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Estado</label>
              <select className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Categoría</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm"
              >
                <option value="">Selecciona una categoría...</option>
                <option value="moda">Moda</option>
                <option value="arte">Arte</option>
                <option value="cultura">Cultura</option>
                <option value="entrevistas">Entrevistas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Slug URL</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-sm text-[var(--color-yan-charcoal)]"
              />
            </div>
          </div>

          <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none p-6 space-y-6">
            <h3 className="font-bold text-lg font-display border-b border-[var(--color-yan-border)] pb-3 text-[var(--color-yan-charcoal)]">Imagen Principal</h3>
            
            <div 
              className="border border-dashed border-[var(--color-yan-border)] rounded-none p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-yan-red)] transition-colors bg-[var(--color-yan-surface-elevated)]"
              onClick={() => setShowUploader(true)}
            >
              <ImageIcon className="w-8 h-8 text-[var(--color-yan-stone)] mb-2" strokeWidth={1.5} />
              <p className="text-sm text-[var(--color-yan-charcoal)] font-medium">Clic para subir imagen</p>
              <p className="text-xs text-[var(--color-yan-stone)] mt-1">PNG, JPG, WEBP hasta 5MB</p>
            </div>
          </div>
        </div>
      </div>

      {showUploader && (
        <MediaUploader onClose={() => setShowUploader(false)} onSelect={(url) => {
          setContent(prev => prev + `\n![Imagen](${url})\n`);
          setShowUploader(false);
        }} />
      )}
    </div>
  );
}
