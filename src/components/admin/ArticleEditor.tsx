"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Save, ArrowLeft, Eye, Edit2, FileText, Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import MediaUploader from "./MediaUploader";
import { createArticle, updateArticle } from "@/lib/actions/articles";

interface ArticleEditorProps {
  isEditing?: boolean;
  article?: any;
  categories?: any[];
}

export default function ArticleEditor({ isEditing = false, article, categories = [] }: ArticleEditorProps) {
  // Multilingual content states
  const [titleEs, setTitleEs] = useState(article?.title_es || "");
  const [titleEn, setTitleEn] = useState(article?.title_en || "");
  const [excerptEs, setExcerptEs] = useState(article?.excerpt_es || "");
  const [excerptEn, setExcerptEn] = useState(article?.excerpt_en || "");
  const [contentEs, setContentEs] = useState(article?.content_es || "");
  const [contentEn, setContentEn] = useState(article?.content_en || "");

  // Metadata states
  const [slug, setSlug] = useState(article?.slug || "");
  const [categoryId, setCategoryId] = useState(article?.category_id || "");
  const [status, setStatus] = useState<any>(article?.status || "draft");
  const [isFeatured, setIsFeatured] = useState(article?.is_featured || false);
  const [coverImage, setCoverImage] = useState(article?.cover_image || "");
  const [coverImageAlt, setCoverImageAlt] = useState(article?.cover_image_alt || "");
  const [metaTitle, setMetaTitle] = useState(article?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(article?.meta_description || "");

  // UI state
  const [langTab, setLangTab] = useState<"es" | "en">("es");
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");
  const [showUploader, setShowUploader] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"cover" | "editor">("cover");
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from Spanish title
  const handleTitleEsChange = (val: string) => {
    setTitleEs(val);
    if (!isEditing) {
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

  // Custom Markdown toolbar insertion at cursor position
  const insertMarkdown = (syntax: string) => {
    const textareaId = langTab === "es" ? "contentEsTextarea" : "contentEnTextarea";
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = "";
    if (syntax === "bold") {
      replacement = `**${selected || "texto"}**`;
    } else if (syntax === "italic") {
      replacement = `*${selected || "texto"}*`;
    } else if (syntax === "strike") {
      replacement = `~~${selected || "texto"}~~`;
    } else if (syntax === "heading") {
      replacement = `\n## ${selected || "Título"}\n`;
    } else if (syntax === "quote") {
      replacement = `\n> ${selected || "Cita"}\n`;
    } else if (syntax === "link") {
      replacement = `[${selected || "enlace"}](url)`;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    if (langTab === "es") {
      setContentEs(newText);
    } else {
      setContentEn(newText);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  // Markdown rendering helper
  function renderMarkdownToHtml(markdown: string) {
    if (!markdown) return '<p class="text-[var(--color-yan-stone)] italic">Sin contenido aún...</p>';
    
    let html = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-md font-bold font-display mt-4 mb-1 text-[var(--color-yan-charcoal)]">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold font-display mt-6 mb-2 border-b border-[var(--color-yan-border)] pb-1 text-[var(--color-yan-charcoal)]">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold font-display mt-8 mb-3 text-[var(--color-yan-charcoal)]">$1</h1>')
      // Images
      .replace(/\!\[(.*?)\]\((.*?)\)/gim, '<img class="my-4 max-w-full border border-[var(--color-yan-border)]" src="$2" alt="$1" />')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a class="text-[var(--color-yan-red)] hover:underline" href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-[var(--color-yan-red)] pl-4 py-1 my-3 italic text-[var(--color-yan-stone)] bg-[var(--color-yan-surface-elevated)]">$1</blockquote>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      // Paragraph splits
      .split(/\n{2,}/g)
      .map(p => {
        if (p.trim().startsWith('<h') || p.trim().startsWith('<img') || p.trim().startsWith('<blockquote')) {
          return p;
        }
        return `<p class="mb-3 text-[13px] leading-relaxed text-[var(--color-yan-charcoal)]">${p.replace(/\n/g, '<br />')}</p>`;
      })
      .join('');

    return html;
  }

  // Save handler
  const handleSave = async () => {
    if (!titleEs.trim()) {
      alert("Por favor, ingresa al menos el título en español.");
      return;
    }
    if (!slug.trim()) {
      alert("Por favor, ingresa un slug válido.");
      return;
    }

    try {
      setSaving(true);
      const articleData = {
        title_es: titleEs,
        title_en: titleEn || null,
        excerpt_es: excerptEs || null,
        excerpt_en: excerptEn || null,
        content_es: contentEs || null,
        content_en: contentEn || null,
        slug: slug,
        category_id: categoryId || null,
        cover_image: coverImage || null,
        cover_image_alt: coverImageAlt || null,
        is_featured: isFeatured,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        status: status,
        tag_ids: []
      };

      if (isEditing && article) {
        await updateArticle(article.id, articleData);
      } else {
        await createArticle(articleData);
      }

      window.location.href = "/admin/articulos";
    } catch (e) {
      console.error("Error saving article:", e);
      alert("Error al guardar el artículo. Verifica la configuración de la base de datos.");
    } finally {
      setSaving(false);
    }
  };

  const currentContent = langTab === "es" ? contentEs : contentEn;
  const wordCount = currentContent ? currentContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = currentContent ? currentContent.length : 0;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-yan-border)]">
        <div className="flex items-center space-x-4">
          <Link href="/admin/articulos" className="p-2 hover:bg-[var(--color-yan-surface-elevated)] border border-transparent hover:border-[var(--color-yan-border)] rounded-none transition-colors">
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <h1 className="text-2xl font-bold font-display text-[var(--color-yan-charcoal)]">
            {isEditing ? "Editar Artículo" : "Nuevo Artículo"}
          </h1>
        </div>
        <div className="flex space-x-3">
          {isEditing && slug && (
            <Link 
              href={`/articulo/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 border border-[var(--color-yan-border)] hover:border-[var(--color-yan-red)] hover:bg-[var(--color-yan-surface-elevated)] text-[var(--color-yan-charcoal)] rounded-none transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Previsualizar
            </Link>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] text-[var(--color-yan-ivory)] rounded-none transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
            )}
            Guardar Artículo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Tabs */}
          <div className="flex border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)]">
            <button 
              type="button"
              className={`px-6 py-3 text-xs font-mono uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${langTab === "es" ? "border-[var(--color-yan-red)] text-[var(--color-yan-red)] bg-[var(--color-yan-surface)]" : "border-transparent text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
              onClick={() => setLangTab("es")}
            >
              <Globe className="w-3.5 h-3.5" /> Español (ES)
            </button>
            <button 
              type="button"
              className={`px-6 py-3 text-xs font-mono uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${langTab === "en" ? "border-[var(--color-yan-red)] text-[var(--color-yan-red)] bg-[var(--color-yan-surface)]" : "border-transparent text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
              onClick={() => setLangTab("en")}
            >
              <Globe className="w-3.5 h-3.5" /> Inglés (EN)
            </button>
          </div>

          <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none p-6 space-y-6">
            {langTab === "es" ? (
              <>
                {/* Spanish Fields */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Título (Español)</label>
                  <input
                    type="text"
                    value={titleEs}
                    onChange={(e) => handleTitleEsChange(e.target.value)}
                    placeholder="Ej. El Renacimiento del Minimalismo Máximo..."
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-3 outline-none transition-colors text-lg font-bold text-[var(--color-yan-charcoal)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Extracto / Copete (Español)</label>
                  <textarea
                    value={excerptEs}
                    onChange={(e) => setExcerptEs(e.target.value)}
                    placeholder="Breve resumen del artículo para las tarjetas de la revista..."
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-xs resize-none h-20 transition-colors"
                  ></textarea>
                </div>
              </>
            ) : (
              <>
                {/* English Fields */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Título (Inglés)</label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Ej. The Rebirth of Maximal Minimalism..."
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-3 outline-none transition-colors text-lg font-bold text-[var(--color-yan-charcoal)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Extracto / Copete (Inglés)</label>
                  <textarea
                    value={excerptEn}
                    onChange={(e) => setExcerptEn(e.target.value)}
                    placeholder="Brief summary of the article..."
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-xs resize-none h-20 transition-colors"
                  ></textarea>
                </div>
              </>
            )}

            {/* Markdown Text Area with Toolbar */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)]">Contenido (Markdown)</label>
                <div className="flex gap-2 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] p-0.5">
                  <button
                    type="button"
                    onClick={() => setEditorMode("edit")}
                    className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${editorMode === "edit" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("preview")}
                    className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${editorMode === "preview" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
                  >
                    Vista Previa
                  </button>
                </div>
              </div>

              {editorMode === "edit" ? (
                <div className="border border-[var(--color-yan-border)] rounded-none overflow-hidden flex flex-col h-[500px]">
                  <div className="bg-[var(--color-yan-surface-elevated)] border-b border-[var(--color-yan-border)] p-2 flex items-center space-x-1.5">
                    <button type="button" onClick={() => insertMarkdown("bold")} className="p-1 px-2.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-xs font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] font-bold">B</button>
                    <button type="button" onClick={() => insertMarkdown("italic")} className="p-1 px-2.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-xs font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] italic">I</button>
                    <button type="button" onClick={() => insertMarkdown("strike")} className="p-1 px-2.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-xs font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] line-through">S</button>
                    <div className="w-px h-4 bg-[var(--color-yan-border)] mx-1"></div>
                    <button type="button" onClick={() => insertMarkdown("heading")} className="p-1 px-2 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[10px] font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] uppercase">H2</button>
                    <button type="button" onClick={() => insertMarkdown("quote")} className="p-1 px-2 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[10px] font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] uppercase">Cita</button>
                    <button type="button" onClick={() => insertMarkdown("link")} className="p-1 px-2 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[10px] font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] uppercase">Link</button>
                    <div className="w-px h-4 bg-[var(--color-yan-border)] mx-1"></div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setUploadTarget("editor");
                        setShowUploader(true);
                      }} 
                      className="p-1 px-2.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[10px] font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] flex items-center gap-1 uppercase"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Imagen
                    </button>
                  </div>
                  <textarea
                    id={langTab === "es" ? "contentEsTextarea" : "contentEnTextarea"}
                    value={langTab === "es" ? contentEs : contentEn}
                    onChange={(e) => langTab === "es" ? setContentEs(e.target.value) : setContentEn(e.target.value)}
                    className="flex-1 w-full bg-[var(--color-yan-surface)] p-4 outline-none resize-none font-mono text-[13px] leading-relaxed text-[var(--color-yan-charcoal)]"
                    placeholder={langTab === "es" ? "Escribe el contenido en español aquí usando Markdown..." : "Write content in english here..."}
                  ></textarea>
                  <div className="bg-[var(--color-yan-surface-elevated)] border-t border-[var(--color-yan-border)] px-4 py-1.5 flex justify-end gap-4 text-[10px] font-mono text-[var(--color-yan-stone)] uppercase">
                    <span>Palabras: {wordCount}</span>
                    <span>Caracteres: {charCount}</span>
                  </div>
                </div>
              ) : (
                <div 
                  className="border border-[var(--color-yan-border)] bg-[var(--color-yan-surface)] p-6 h-[500px] overflow-y-auto font-sans prose max-w-none prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(langTab === "es" ? contentEs : contentEn) }}
                >
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none p-6 space-y-6">
            <h3 className="font-bold text-lg font-display border-b border-[var(--color-yan-border)] pb-3 text-[var(--color-yan-charcoal)]">Propiedades</h3>
            
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Estado</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-[var(--color-yan-charcoal)] text-xs"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Categoría</label>
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-[var(--color-yan-charcoal)] text-xs"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name_es}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Slug URL (Único)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-del-articulo"
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-xs text-[var(--color-yan-charcoal)] font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-[var(--color-yan-red)]"
              />
              <label htmlFor="isFeatured" className="text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] cursor-pointer select-none">Artículo Destacado</label>
            </div>
          </div>

          <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none p-6 space-y-6">
            <h3 className="font-bold text-lg font-display border-b border-[var(--color-yan-border)] pb-3 text-[var(--color-yan-charcoal)]">Imagen de Portada</h3>
            
            {coverImage ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="Cover image preview" className="w-full aspect-video object-cover border border-[var(--color-yan-border)]" />
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setUploadTarget("cover");
                      setShowUploader(true);
                    }}
                    className="flex-1 text-center py-1.5 border border-[var(--color-yan-border)] hover:border-[var(--color-yan-red)] hover:bg-[var(--color-yan-surface-elevated)] font-mono text-[10px] uppercase tracking-wider text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors"
                  >
                    Cambiar Imagen
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="px-3 py-1.5 border border-transparent hover:bg-red-500/10 text-red-600 font-mono text-[10px] uppercase tracking-wider transition-colors"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="border border-dashed border-[var(--color-yan-border)] rounded-none p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-yan-red)] transition-colors bg-[var(--color-yan-surface-elevated)]"
                onClick={() => {
                  setUploadTarget("cover");
                  setShowUploader(true);
                }}
              >
                <ImageIcon className="w-8 h-8 text-[var(--color-yan-stone)] mb-2" strokeWidth={1.5} />
                <p className="text-xs text-[var(--color-yan-charcoal)] font-semibold">Clic para elegir imagen de biblioteca</p>
                <p className="text-[10px] text-[var(--color-yan-stone)] mt-1 font-mono uppercase">PNG, JPG, WEBP</p>
              </div>
            )}

            {coverImage && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Alt Text (Accesibilidad)</label>
                <input
                  type="text"
                  value={coverImageAlt}
                  onChange={(e) => setCoverImageAlt(e.target.value)}
                  placeholder="Descripción de la imagen..."
                  className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-xs text-[var(--color-yan-charcoal)]"
                />
              </div>
            )}
          </div>

          <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none p-6 space-y-6">
            <h3 className="font-bold text-lg font-display border-b border-[var(--color-yan-border)] pb-3 text-[var(--color-yan-charcoal)]">Metadatos SEO</h3>
            
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Meta Título</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Título SEO..."
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-xs text-[var(--color-yan-charcoal)]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Meta Descripción</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Meta descripción para buscadores..."
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-xs text-[var(--color-yan-charcoal)] resize-none h-20 transition-colors"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {showUploader && (
        <MediaUploader 
          onClose={() => setShowUploader(false)} 
          onSelect={(url) => {
            if (uploadTarget === "cover") {
              setCoverImage(url);
            } else {
              const textareaId = langTab === "es" ? "contentEsTextarea" : "contentEnTextarea";
              const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
              if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;
                const replacement = `\n![Imagen](${url})\n`;
                const newText = text.substring(0, start) + replacement + text.substring(end);
                if (langTab === "es") {
                  setContentEs(newText);
                } else {
                  setContentEn(newText);
                }
              }
            }
            setShowUploader(false);
          }} 
        />
      )}
    </div>
  );
}
