"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Image as ImageIcon, 
  Save, 
  ArrowLeft, 
  Eye, 
  Edit2, 
  Globe, 
  Loader2,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  FileCode,
  Table,
  Link2,
  Maximize2,
  Minimize2,
  Columns
} from "lucide-react";
import Link from "next/link";
import MediaUploader from "./MediaUploader";
import { createArticle, updateArticle } from "@/lib/actions/articles";
import { createTag } from "@/lib/actions/tags";

interface ArticleEditorProps {
  isEditing?: boolean;
  article?: any;
  categories?: any[];
  tags?: any[];
}

export default function ArticleEditor({ isEditing = false, article, categories = [], tags = [] }: ArticleEditorProps) {
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
  const [metaKeywords, setMetaKeywords] = useState(article?.meta_keywords || "");

  // Tag system states
  const [availableTags, setAvailableTags] = useState<any[]>(tags);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(article?.tags?.map((t: any) => t.id) || []);
  const [tagSearch, setTagSearch] = useState("");
  const [quickTagName, setQuickTagName] = useState("");
  const [isCreatingQuickTag, setIsCreatingQuickTag] = useState(false);

  // UI state
  const [langTab, setLangTab] = useState<"es" | "en">("es");
  const [editorMode, setEditorMode] = useState<"edit" | "split" | "preview">("edit");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"cover" | "editor">("cover");
  const [saving, setSaving] = useState(false);

  // Refs for scrolling and focus
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

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

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMod = e.ctrlKey || e.metaKey;
    if (isMod) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        insertMarkdown("bold");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        insertMarkdown("italic");
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        insertMarkdown("link");
      } else if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        insertMarkdown("quote");
      } else if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        insertMarkdown("h2");
      }
    }
  };

  // Synchronized scrolling handler
  const handleScroll = () => {
    if (!syncScroll || !textareaRef.current || !previewRef.current) return;
    const textarea = textareaRef.current;
    const preview = previewRef.current;
    
    const maxTextareaScroll = textarea.scrollHeight - textarea.clientHeight;
    if (maxTextareaScroll <= 0) return;
    
    const scrollPercentage = textarea.scrollTop / maxTextareaScroll;
    const maxPreviewScroll = preview.scrollHeight - preview.clientHeight;
    
    preview.scrollTop = scrollPercentage * maxPreviewScroll;
  };

  // Custom Markdown toolbar insertion at cursor position
  const insertMarkdown = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = "";
    let selectionOffsetStart = 0;
    let selectionOffsetEnd = 0;

    switch (syntax) {
      case "bold":
        replacement = `**${selected || "texto"}**`;
        selectionOffsetStart = 2;
        selectionOffsetEnd = replacement.length - 2;
        break;
      case "italic":
        replacement = `*${selected || "texto"}*`;
        selectionOffsetStart = 1;
        selectionOffsetEnd = replacement.length - 1;
        break;
      case "strike":
        replacement = `~~${selected || "texto"}~~`;
        selectionOffsetStart = 2;
        selectionOffsetEnd = replacement.length - 2;
        break;
      case "code":
        replacement = `\`${selected || "código"}\``;
        selectionOffsetStart = 1;
        selectionOffsetEnd = replacement.length - 1;
        break;
      case "h1":
        replacement = `\n# ${selected || "Título 1"}\n`;
        selectionOffsetStart = 3;
        selectionOffsetEnd = replacement.length - 1;
        break;
      case "h2":
        replacement = `\n## ${selected || "Título 2"}\n`;
        selectionOffsetStart = 4;
        selectionOffsetEnd = replacement.length - 1;
        break;
      case "h3":
        replacement = `\n### ${selected || "Título 3"}\n`;
        selectionOffsetStart = 5;
        selectionOffsetEnd = replacement.length - 1;
        break;
      case "bullet":
        replacement = `\n- ${selected || "elemento"}`;
        selectionOffsetStart = 3;
        selectionOffsetEnd = replacement.length;
        break;
      case "number":
        replacement = `\n1. ${selected || "elemento"}`;
        selectionOffsetStart = 4;
        selectionOffsetEnd = replacement.length;
        break;
      case "quote":
        replacement = `\n> ${selected || "Cita"}\n`;
        selectionOffsetStart = 3;
        selectionOffsetEnd = replacement.length - 1;
        break;
      case "codeblock":
        replacement = `\n\`\`\`javascript\n${selected || "// código aquí"}\n\`\`\`\n`;
        selectionOffsetStart = 15;
        selectionOffsetEnd = replacement.length - 5;
        break;
      case "table":
        replacement = `\n| Cabecera 1 | Cabecera 2 |\n| ----------- | ----------- |\n| Celda 1     | Celda 2     |\n`;
        selectionOffsetStart = 2;
        selectionOffsetEnd = replacement.length;
        break;
      case "link":
        replacement = `[${selected || "enlace"}](url)`;
        selectionOffsetStart = 1;
        selectionOffsetEnd = selected ? selected.length + 1 : 7;
        break;
      default:
        return;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    if (langTab === "es") {
      setContentEs(newText);
    } else {
      setContentEn(newText);
    }

    setTimeout(() => {
      textarea.focus();
      if (!selected) {
        textarea.setSelectionRange(start + selectionOffsetStart, start + selectionOffsetEnd);
      } else {
        textarea.setSelectionRange(start + replacement.length, start + replacement.length);
      }
    }, 50);
  };

  // Markdown rendering helper
  function renderMarkdownToHtml(markdown: string) {
    if (!markdown) return '<p class="text-[var(--color-yan-stone)] italic">Sin contenido aún...</p>';
    
    let html = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      
      // Code Blocks
      .replace(/\`\`\`([\s\S]*?)\`\`\`/gm, '<pre class="bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] p-4 font-mono text-xs overflow-x-auto my-4 text-[var(--color-yan-charcoal)] block">$1</pre>')
      
      // Inline Code
      .replace(/\`([^`\n]+)\`/g, '<code class="bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-yan-red)]">$1</code>')
      
      // Tables - parse lines starting and ending with |
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').slice(1, -1);
        if (cells.every(c => c.trim().startsWith('---') || c.trim().startsWith(':-') || c.trim().startsWith('-:'))) {
          return ''; // skip separator rows
        }
        return `<tr class="yan-table-row">${cells.map(c => `<td class="px-4 py-3 border-b border-[var(--color-yan-border-light)] text-[13px] text-left text-[var(--color-yan-charcoal)]/90">${c.trim()}</td>`).join('')}</tr>`;
      })
      
      // Wrap consecutive table rows in table element
      .replace(/(<tr class="yan-table-row">[\s\S]*?<\/tr>)/g, '<div class="overflow-x-auto my-4 border border-[var(--color-yan-border)] bg-[var(--color-yan-surface)]"><table class="min-w-full divide-y divide-[var(--color-yan-border)]">$1</table></div>')
      // Merge consecutive table containers
      .replace(/<\/table><\/div>\s*<div class="overflow-x-auto my-4 border border-\[var\(--color-yan-border\)\] bg-\[var\(--color-yan-surface\)\]"><table class="min-w-full divide-y divide-\[var\(--color-yan-border\)\]">/g, '')
      // Convert the first row of each table to headers
      .replace(/<table class="min-w-full divide-y divide-\[var\(--color-yan-border\)\]">\s*<tr class="yan-table-row">([\s\S]*?)<\/tr>/g, (match, rowContent) => {
        const headerRow = rowContent.replace(/<td class="([^"]+)">([\s\S]*?)<\/td>/g, '<th class="px-4 py-3 bg-[var(--color-yan-surface-elevated)] border-b border-[var(--color-yan-border)] font-display font-semibold text-left text-[var(--color-yan-charcoal)] text-[13px]">$2</th>');
        return `<table class="min-w-full divide-y divide-[var(--color-yan-border)]"><thead><tr class="bg-[var(--color-yan-surface-elevated)]">${headerRow}</tr></thead><tbody>`;
      })
      .replace(/<\/table>/g, '</tbody></table>')

      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-md font-bold font-display mt-4 mb-1 text-[var(--color-yan-charcoal)]">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold font-display mt-6 mb-2 border-b border-[var(--color-yan-border)] pb-1 text-[var(--color-yan-charcoal)]">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold font-display mt-8 mb-3 text-[var(--color-yan-charcoal)]">$1</h1>')
      
      // Images
      .replace(/\!\[(.*?)\]\((.*?)\)/gim, '<img class="my-4 max-w-full border border-[var(--color-yan-border)]" src="$2" alt="$1" />')
      
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a class="text-[var(--color-yan-red)] hover:underline font-medium" href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Blockquotes
      .replace(/^&gt;\s?(.*$)/gim, '<blockquote class="border-l-4 border-[var(--color-yan-red)] pl-4 py-1 my-3 italic text-[var(--color-yan-stone)] bg-[var(--color-yan-surface-elevated)]">$1</blockquote>')
      
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      
      // Bullet list item
      .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="yan-bullet-item">$1</li>')
      // Wrap consecutive yan-bullet-item in a single ul
      .replace(/(<li class="yan-bullet-item">[\s\S]*?<\/li>)/g, (match) => {
        return `<ul class="list-disc pl-5 mb-4 space-y-1 text-[13px] text-[var(--color-yan-charcoal)]/90">${match}</ul>`;
      })
      .replace(/<\/ul>\s*<ul class="list-disc pl-5 mb-4 space-y-1 text-\[13px\] text-\[var\(--color-yan-charcoal\)\]\/90">/g, '')

      // Ordered list item
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="yan-ordered-item">$1</li>')
      // Wrap consecutive yan-ordered-item in a single ol
      .replace(/(<li class="yan-ordered-item">[\s\S]*?<\/li>)/g, (match) => {
        return `<ol class="list-decimal pl-5 mb-4 space-y-1 text-[13px] text-[var(--color-yan-charcoal)]/90">${match}</ol>`;
      })
      .replace(/<\/ol>\s*<ol class="list-decimal pl-5 mb-4 space-y-1 text-\[13px\] text-\[var\(--color-yan-charcoal\)\]\/90">/g, '')

      // Paragraph splits
      .split(/\n{2,}/g)
      .map(p => {
        const trimP = p.trim();
        if (trimP.startsWith('<h') || trimP.startsWith('<img') || trimP.startsWith('<blockquote') || trimP.startsWith('<div class="overflow-x-auto') || trimP.startsWith('<pre') || trimP.startsWith('<ul') || trimP.startsWith('<ol')) {
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
        meta_keywords: metaKeywords || null,
        status: status,
        tag_ids: selectedTagIds
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
  const readingTime = Math.ceil(wordCount / 200);

  const filteredTags = availableTags.filter((tag: any) => {
    const name = langTab === "es" ? tag.name_es : (tag.name_en || tag.name_es);
    return name.toLowerCase().includes(tagSearch.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Top Bar (Hidden in fullscreen mode) */}
      {!isFullscreen && (
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor */}
        <div className={`lg:col-span-2 space-y-6 ${isFullscreen ? 'lg:col-span-3' : ''}`}>
          
          {/* Main card containing language tabs, fields and Markdown editor */}
          <div className={`bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none overflow-hidden flex flex-col transition-all duration-300 ${
            isFullscreen 
              ? 'fixed inset-0 z-40 bg-[var(--color-yan-surface)] h-screen w-screen p-6' 
              : 'p-6 space-y-6'
          }`}>
            
            {/* Control Bar inside the card (contains tabs and editor modes) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] p-1 gap-2 flex-shrink-0">
              
              {/* Language Switch */}
              <div className="flex bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-0.5">
                <button 
                  type="button"
                  className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-1.5 ${langTab === "es" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
                  onClick={() => setLangTab("es")}
                >
                  <Globe className="w-3 h-3" /> ES
                </button>
                <button 
                  type="button"
                  className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-1.5 ${langTab === "en" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
                  onClick={() => setLangTab("en")}
                >
                  <Globe className="w-3 h-3" /> EN
                </button>
              </div>

              {/* Status Indicator & Save Button (Only in Fullscreen) */}
              {isFullscreen && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[var(--color-yan-stone)] uppercase">
                    Modo Pantalla Completa
                  </span>
                  <button 
                    type="button" 
                    onClick={handleSave}
                    disabled={saving}
                    className="p-1 px-3 bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] text-[var(--color-yan-ivory)] border border-transparent transition-colors text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 rounded-none"
                    title="Guardar Artículo"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    <span>Guardar</span>
                  </button>
                </div>
              )}

              {/* Editor Layout mode and Fullscreen switches */}
              <div className="flex items-center gap-1.5">
                <div className="flex bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-0.5">
                  <button
                    type="button"
                    onClick={() => setEditorMode("edit")}
                    className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1 ${editorMode === "edit" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
                    title="Solo Editor"
                  >
                    <Edit2 className="w-3 h-3" /> <span className="hidden sm:inline">Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("split")}
                    className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1 ${editorMode === "split" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
                    title="Doble Panel (Pantalla Dividida)"
                  >
                    <Columns className="w-3 h-3" /> <span className="hidden sm:inline">Doble Panel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("preview")}
                    className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1 ${editorMode === "preview" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
                    title="Solo Vista Previa"
                  >
                    <Eye className="w-3 h-3" /> <span className="hidden sm:inline">Vista Previa</span>
                  </button>
                </div>

                <div className="w-px h-5 bg-[var(--color-yan-border)] mx-1"></div>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors"
                  title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

            </div>

            {/* Title & Excerpt (Only in classical Edit Mode) */}
            {editorMode === "edit" ? (
              <div className="space-y-4 flex-shrink-0">
                {langTab === "es" ? (
                  <>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Título (Español)</label>
                      <input
                        type="text"
                        value={titleEs}
                        onChange={(e) => handleTitleEsChange(e.target.value)}
                        placeholder="Ej. El Renacimiento del Minimalismo Máximo..."
                        className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2.5 outline-none transition-colors text-base font-bold text-[var(--color-yan-charcoal)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Extracto / Copete (Español)</label>
                      <textarea
                        value={excerptEs}
                        onChange={(e) => setExcerptEs(e.target.value)}
                        placeholder="Breve resumen del artículo para las tarjetas de la revista..."
                        className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-xs resize-none h-14 transition-colors"
                      ></textarea>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Título (Inglés)</label>
                      <input
                        type="text"
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                        placeholder="Ej. The Rebirth of Maximal Minimalism..."
                        className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2.5 outline-none transition-colors text-base font-bold text-[var(--color-yan-charcoal)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Extracto / Copete (Inglés)</label>
                      <textarea
                        value={excerptEn}
                        onChange={(e) => setExcerptEn(e.target.value)}
                        placeholder="Brief summary of the article..."
                        className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-xs resize-none h-14 transition-colors"
                      ></textarea>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Informative Context Bar in Split/Preview Mode */
              <div className="px-4 py-2 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] flex items-center justify-between text-xs text-[var(--color-yan-stone)] flex-shrink-0">
                <span className="truncate max-w-[70%]">
                  <strong>Editando:</strong> {langTab === "es" ? (titleEs || "Sin título") : (titleEn || "Untitled")}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider">
                  Modo {editorMode === "split" ? "Doble Panel" : "Vista Previa"}
                </span>
              </div>
            )}

            {/* Markdown Text Area / Preview / Split Main block */}
            <div className={`flex flex-col border border-[var(--color-yan-border)] rounded-none overflow-hidden bg-[var(--color-yan-surface)] ${
              isFullscreen 
                ? 'flex-1 min-h-0' 
                : 'h-[500px]'
            }`}>
              
              {/* Rich Formatting Toolbar (Only in Edit and Split modes) */}
              {editorMode !== "preview" && (
                <div className="bg-[var(--color-yan-surface-elevated)] border-b border-[var(--color-yan-border)] p-1.5 flex flex-wrap items-center gap-1 flex-shrink-0 select-none">
                  {/* Style format buttons */}
                  <button type="button" onClick={() => insertMarkdown("bold")} className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors rounded-none" title="Negrita (Ctrl+B)">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("italic")} className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors rounded-none" title="Itálica (Ctrl+I)">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("strike")} className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors rounded-none" title="Tachado">
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("code")} className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors rounded-none" title="Código en línea">
                    <Code className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-4 bg-[var(--color-yan-border)] mx-1"></div>

                  {/* Headers */}
                  <button type="button" onClick={() => insertMarkdown("h1")} className="p-1 px-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[9px] font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] font-bold transition-colors rounded-none" title="Título 1">
                    H1
                  </button>
                  <button type="button" onClick={() => insertMarkdown("h2")} className="p-1 px-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[9px] font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] font-bold transition-colors rounded-none" title="Título 2 (Ctrl+H)">
                    H2
                  </button>
                  <button type="button" onClick={() => insertMarkdown("h3")} className="p-1 px-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[9px] font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] font-bold transition-colors rounded-none" title="Título 3">
                    H3
                  </button>

                  <div className="w-px h-4 bg-[var(--color-yan-border)] mx-1"></div>

                  {/* Lists */}
                  <button type="button" onClick={() => insertMarkdown("bullet")} className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors rounded-none" title="Lista con viñetas">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("number")} className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors rounded-none" title="Lista numerada">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-4 bg-[var(--color-yan-border)] mx-1"></div>

                  {/* Inserts */}
                  <button type="button" onClick={() => insertMarkdown("quote")} className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors rounded-none" title="Cita (Ctrl+Q)">
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("codeblock")} className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors rounded-none" title="Bloque de código">
                    <FileCode className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("table")} className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors rounded-none" title="Insertar Tabla">
                    <Table className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("link")} className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors rounded-none" title="Insertar Enlace (Ctrl+K)">
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setUploadTarget("editor");
                      setShowUploader(true);
                    }} 
                    className="p-1.5 hover:bg-[var(--color-yan-surface)] border border-transparent hover:border-[var(--color-yan-border)] text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] flex items-center gap-1 transition-colors rounded-none"
                    title="Insertar Imagen"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Editor Workspace (Interactive pane) */}
              <div className="flex-1 min-h-0 relative bg-[var(--color-yan-surface)]">
                
                {/* 1. Solo Editor View */}
                {editorMode === "edit" && (
                  <textarea
                    ref={textareaRef}
                    id={langTab === "es" ? "contentEsTextarea" : "contentEnTextarea"}
                    value={langTab === "es" ? contentEs : contentEn}
                    onChange={(e) => langTab === "es" ? setContentEs(e.target.value) : setContentEn(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full p-4 outline-none resize-none font-mono text-[13px] leading-relaxed text-[var(--color-yan-charcoal)] bg-[var(--color-yan-surface)] overflow-y-auto"
                    placeholder={langTab === "es" ? "Escribe el contenido en español aquí usando Markdown..." : "Write content in english here..."}
                  />
                )}

                {/* 2. Solo Vista Previa View */}
                {editorMode === "preview" && (
                  <div 
                    ref={previewRef}
                    className="w-full h-full p-6 overflow-y-auto font-sans prose max-w-none prose-sm bg-[var(--color-yan-surface)] text-[var(--color-yan-charcoal)]"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(langTab === "es" ? contentEs : contentEn) }}
                  />
                )}

                {/* 3. Doble Panel / Split View */}
                {editorMode === "split" && (
                  <div className="w-full h-full flex divide-x divide-[var(--color-yan-border)] overflow-hidden">
                    {/* Left Pane: Textarea */}
                    <div className="w-1/2 h-full">
                      <textarea
                        ref={textareaRef}
                        id={langTab === "es" ? "contentEsTextarea" : "contentEnTextarea"}
                        value={langTab === "es" ? contentEs : contentEn}
                        onChange={(e) => langTab === "es" ? setContentEs(e.target.value) : setContentEn(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onScroll={handleScroll}
                        className="w-full h-full p-4 outline-none resize-none font-mono text-[13px] leading-relaxed text-[var(--color-yan-charcoal)] bg-[var(--color-yan-surface)] overflow-y-auto"
                        placeholder={langTab === "es" ? "Escribe el contenido en español aquí..." : "Write content in english here..."}
                      />
                    </div>
                    {/* Right Pane: Live HTML Preview */}
                    <div 
                      ref={previewRef}
                      className="w-1/2 h-full p-6 overflow-y-auto font-sans prose max-w-none prose-sm bg-[var(--color-yan-surface)] text-[var(--color-yan-charcoal)]"
                      dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(langTab === "es" ? contentEs : contentEn) }}
                    />
                  </div>
                )}

              </div>

              {/* Statistics & Synchronized Scroll Controls Footer */}
              <div className="bg-[var(--color-yan-surface-elevated)] border-t border-[var(--color-yan-border)] px-4 py-2 flex flex-wrap justify-between items-center text-[10px] font-mono text-[var(--color-yan-stone)] uppercase gap-2 flex-shrink-0 select-none">
                <div>
                  {editorMode === "split" && (
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={syncScroll} 
                        onChange={(e) => setSyncScroll(e.target.checked)} 
                        className="accent-[var(--color-yan-red)] w-3 h-3" 
                      />
                      <span>Scroll Sincronizado</span>
                    </label>
                  )}
                </div>
                <div className="flex gap-4 ml-auto">
                  <span>Palabras: {wordCount}</span>
                  <span>Caracteres: {charCount}</span>
                  <span>Lectura: ~{readingTime} min</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Sidebar Settings (Hidden in fullscreen mode) */}
        {!isFullscreen && (
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
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Etiquetas</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Buscar etiquetas..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-1.5 outline-none text-xs text-[var(--color-yan-charcoal)] transition-colors"
                  />
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)]">
                    {filteredTags.length > 0 ? (
                      filteredTags.map((tag: any) => {
                        const isSelected = selectedTagIds.includes(tag.id);
                        const tagName = langTab === "es" ? tag.name_es : (tag.name_en || tag.name_es);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedTagIds(prev => prev.filter(id => id !== tag.id));
                              } else {
                                setSelectedTagIds(prev => [...prev, tag.id]);
                              }
                            }}
                            className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-all duration-200 border cursor-pointer select-none rounded-none ${
                              isSelected
                                ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] border-[var(--color-yan-charcoal)] font-semibold"
                                : "bg-[var(--color-yan-surface)] text-[var(--color-yan-stone)] border-[var(--color-yan-border)] hover:border-[var(--color-yan-red)] hover:text-[var(--color-yan-red)]"
                            }`}
                          >
                            {tagName} {isSelected ? "✓" : "+"}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-[var(--color-yan-stone)] italic p-1">Sin etiquetas.</span>
                    )}
                  </div>
                  <div className="pt-2 border-t border-[var(--color-yan-border-light)] flex gap-2">
                    <input
                      type="text"
                      placeholder="Nueva etiqueta..."
                      value={quickTagName}
                      onChange={(e) => setQuickTagName(e.target.value)}
                      className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-2 py-1 outline-none text-xs text-[var(--color-yan-charcoal)]"
                    />
                    <button
                      type="button"
                      disabled={isCreatingQuickTag || !quickTagName.trim()}
                      onClick={async () => {
                        if (!quickTagName.trim()) return;
                        try {
                          setIsCreatingQuickTag(true);
                          const newTag = await createTag(quickTagName);
                          if (newTag) {
                            setAvailableTags(prev => [...prev, newTag]);
                            setSelectedTagIds(prev => [...prev, newTag.id]);
                            setQuickTagName("");
                          }
                        } catch (e) {
                          console.error("Error creating quick tag:", e);
                          alert("Error al crear la etiqueta de forma rápida.");
                        } finally {
                          setIsCreatingQuickTag(false);
                        }
                      }}
                      className="px-3 py-1 bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] disabled:opacity-50 text-[var(--color-yan-ivory)] text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center justify-center rounded-none"
                    >
                      {isCreatingQuickTag ? "..." : "Añadir"}
                    </button>
                  </div>
                </div>
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
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Meta Palabras Clave (SEO Keywords)</label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="palabra1, palabra2, frase clave..."
                  className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-3 py-2 outline-none text-xs text-[var(--color-yan-charcoal)]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showUploader && (
        <MediaUploader 
          onClose={() => setShowUploader(false)} 
          onSelect={(url) => {
            if (uploadTarget === "cover") {
              setCoverImage(url);
            } else {
              const textarea = textareaRef.current;
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
