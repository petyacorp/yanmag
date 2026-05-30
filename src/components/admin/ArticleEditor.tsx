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
          <Link href="/admin/articulos" className="p-2 hover:bg-yan-surface-elevated rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{isEditing ? "Editar Artículo" : "Nuevo Artículo"}</h1>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-yan-border rounded-md hover:bg-yan-surface-elevated transition-colors text-sm font-medium">
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </button>
          <button className="flex items-center px-4 py-2 bg-yan-accent text-white rounded-md hover:bg-yan-accent-dark transition-colors text-sm font-medium">
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-yan-surface border border-yan-border rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-yan-muted mb-2">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Escribe un título increíble..."
                className="w-full bg-yan-surface-elevated border border-yan-border rounded-md px-4 py-3 outline-none focus:border-yan-accent transition-colors text-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yan-muted mb-2">Contenido (Markdown)</label>
              <div className="border border-yan-border rounded-md overflow-hidden flex flex-col h-[500px]">
                <div className="bg-yan-surface-elevated border-b border-yan-border p-2 flex items-center space-x-2">
                  <button className="p-1.5 hover:bg-yan-surface rounded text-yan-muted hover:text-foreground"><b>B</b></button>
                  <button className="p-1.5 hover:bg-yan-surface rounded text-yan-muted hover:text-foreground"><i>I</i></button>
                  <button className="p-1.5 hover:bg-yan-surface rounded text-yan-muted hover:text-foreground"><s>S</s></button>
                  <div className="w-px h-4 bg-yan-border mx-2"></div>
                  <button className="p-1.5 hover:bg-yan-surface rounded text-yan-muted hover:text-foreground flex items-center" onClick={() => setShowUploader(true)}>
                    <ImageIcon className="w-4 h-4 mr-1" /> Media
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 w-full bg-yan-surface p-4 outline-none resize-none font-mono text-sm leading-relaxed"
                  placeholder="Escribe tu contenido aquí..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-yan-surface border border-yan-border rounded-lg p-6 space-y-6">
            <h3 className="font-bold text-lg border-b border-yan-border pb-3">Publicación</h3>
            
            <div>
              <label className="block text-sm font-medium text-yan-muted mb-2">Estado</label>
              <select className="w-full bg-yan-surface-elevated border border-yan-border rounded-md px-3 py-2 outline-none focus:border-yan-accent">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-yan-muted mb-2">Categoría</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-yan-surface-elevated border border-yan-border rounded-md px-3 py-2 outline-none focus:border-yan-accent"
              >
                <option value="">Selecciona una categoría...</option>
                <option value="moda">Moda</option>
                <option value="arte">Arte</option>
                <option value="cultura">Cultura</option>
                <option value="entrevistas">Entrevistas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-yan-muted mb-2">Slug URL</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-yan-surface-elevated border border-yan-border rounded-md px-3 py-2 outline-none focus:border-yan-accent text-sm"
              />
            </div>
          </div>

          <div className="bg-yan-surface border border-yan-border rounded-lg p-6 space-y-6">
            <h3 className="font-bold text-lg border-b border-yan-border pb-3">Imagen Principal</h3>
            
            <div 
              className="border-2 border-dashed border-yan-border rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-yan-accent transition-colors bg-yan-surface-elevated"
              onClick={() => setShowUploader(true)}
            >
              <ImageIcon className="w-8 h-8 text-yan-muted mb-2" />
              <p className="text-sm text-foreground font-medium">Clic para subir imagen</p>
              <p className="text-xs text-yan-muted mt-1">PNG, JPG, WEBP hasta 5MB</p>
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
