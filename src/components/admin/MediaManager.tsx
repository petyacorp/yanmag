"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, Upload, Image as ImageIcon, Loader2, Trash2, Folder, 
  FolderPlus, ChevronRight, ArrowLeft, Copy, Check, Move, Info, Eye
} from "lucide-react";
import ImageGuideFile from "@/components/admin/ImageGuideFile";
import { 
  getMediaLibrary, deleteImage, uploadImage, 
  createMediaFolder, deleteFolder, moveMedia, getAllMediaFolders 
} from "@/lib/actions/media";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string | null;
  isFolder?: boolean;
}

export default function MediaManager() {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder navigation and management
  const [currentPath, setCurrentPath] = useState<string>(""); // Starts at root
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Selection & Moving state
  const [selectedItems, setSelectedItems] = useState<MediaFile[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [allFolders, setAllFolders] = useState<string[]>([]);
  const [destFolder, setDestFolder] = useState<string>("");
  const [moving, setMoving] = useState(false);

  // Lightbox & Preview detail sidebar
  const [activeItem, setActiveItem] = useState<MediaFile | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMediaLibrary(currentPath);
      setImages(data);
      // Clear selection when navigating
      setSelectedItems([]);
    } catch (e: any) {
      console.error("Error fetching media library:", e);
      setError("No se pudo cargar la biblioteca de medios. Verifica la conexión con Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFolders = async () => {
    try {
      const folders = await getAllMediaFolders();
      setAllFolders(folders);
    } catch (e) {
      console.error("Error loading folder tree:", e);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [currentPath]);

  // Load all folders whenever the move modal opens
  useEffect(() => {
    if (showMoveModal) {
      fetchAllFolders();
    }
  }, [showMoveModal]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setCreatingFolder(true);
      setError(null);
      const res = await createMediaFolder(currentPath, newFolderName);
      if (res.success) {
        setNewFolderName("");
        setSuccess(`Carpeta "${newFolderName}" creada correctamente.`);
        fetchImages();
      } else {
        setError(res.error || "No se pudo crear la carpeta.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Ocurrió un error inesperado al crear la carpeta.");
    } finally {
      setCreatingFolder(false);
      setTimeout(() => setSuccess(null), 4000);
    }
  };

  // Drag and Drop Upload logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setError(null);
    let successCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", currentPath);

      try {
        const res = await uploadImage(formData);
        if (res.success) {
          successCount++;
        } else {
          setError(prev => (prev ? `${prev}\n` : "") + `Error al subir ${file.name}: ${res.error}`);
        }
      } catch (e: any) {
        setError(prev => (prev ? `${prev}\n` : "") + `Error inesperado con ${file.name}: ${e.message}`);
      }
    }

    if (successCount > 0) {
      setSuccess(`Se subieron ${successCount} archivos correctamente.`);
      fetchImages();
    }
    setUploading(false);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Selection toggle
  const toggleSelect = (item: MediaFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems(prev => {
      const exists = prev.some(i => i.path === item.path);
      if (exists) {
        return prev.filter(i => i.path !== item.path);
      } else {
        return [...prev, item];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === images.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(images);
    }
  };

  // Batch delete logic
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;
    
    const message = `¿Estás seguro de que deseas eliminar ${selectedItems.length} elemento(s) seleccionado(s) y todos sus archivos/carpetas internos?`;
    if (window.confirm(message)) {
      setLoading(true);
      setError(null);
      let deletedCount = 0;

      for (const item of selectedItems) {
        try {
          if (item.isFolder) {
            await deleteFolder(item.path);
          } else {
            await deleteImage(item.path);
          }
          deletedCount++;
        } catch (e: any) {
          setError(prev => (prev ? `${prev}\n` : "") + `Error al eliminar ${item.name}: ${e.message}`);
        }
      }

      setSuccess(`Se eliminaron ${deletedCount} elementos.`);
      setSelectedItems([]);
      fetchImages();
      setActiveItem(null);
      setTimeout(() => setSuccess(null), 4000);
    }
  };

  // Move selected items to destination folder
  const handleMoveSelected = async () => {
    if (selectedItems.length === 0) return;
    setMoving(true);
    setError(null);
    let movedCount = 0;

    for (const item of selectedItems) {
      // Avoid moving folder into itself
      if (item.isFolder && (destFolder === item.path || destFolder.startsWith(item.path + "/"))) {
        setError(prev => (prev ? `${prev}\n` : "") + `No puedes mover la carpeta "${item.name}" dentro de sí misma.`);
        continue;
      }

      // Compute destination path
      const itemDestPath = destFolder ? `${destFolder}/${item.name}` : item.name;
      
      try {
        const res = await moveMedia(item.path, itemDestPath, !!item.isFolder);
        if (res.success) {
          movedCount++;
        } else {
          setError(prev => (prev ? `${prev}\n` : "") + `Error al mover ${item.name}: ${res.error}`);
        }
      } catch (e: any) {
        setError(prev => (prev ? `${prev}\n` : "") + `Error inesperado al mover ${item.name}: ${e.message}`);
      }
    }

    setSuccess(`Se trasladaron ${movedCount} elementos.`);
    setSelectedItems([]);
    setShowMoveModal(false);
    setMoving(false);
    fetchImages();
    setActiveItem(null);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Copy Link helper
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPath(url);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // Breadcrumbs builder
  const pathSegments = currentPath ? currentPath.split("/").filter(Boolean) : [];

  return (
    <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-6 min-h-[75vh] flex flex-col relative">
      
      {/* Toast notifications */}
      {success && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 font-mono text-xs uppercase tracking-widest shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5">
          ✓ {success}
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--color-yan-border)] mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-[var(--color-yan-charcoal)] mb-1">
            Administración de Medios
          </h1>
          <p className="text-[var(--color-yan-stone)] text-xs font-mono uppercase tracking-wider">
            Organiza tus imágenes en carpetas y gestiona tus recursos editoriales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple
            accept="image/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
            className="flex items-center gap-2 bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] disabled:bg-[var(--color-yan-stone)] text-[var(--color-yan-ivory)] px-4 py-2.5 text-xs font-mono uppercase tracking-widest font-semibold transition-colors"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Subir Fotos
          </button>
        </div>
      </div>

      {/* RLS or fetch errors */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-mono flex items-start justify-between">
          <span className="whitespace-pre-line">{error}</span>
          <button onClick={() => setError(null)} className="ml-4 font-sans font-bold hover:text-red-800 text-lg leading-none">×</button>
        </div>
      )}

      {/* RE "File" — Image Optimization Guide */}
      <ImageGuideFile />

      {/* Folder Navigation Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-yan-border-light)]">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-yan-stone)]">
          <button
            onClick={() => setCurrentPath("")}
            className={`hover:text-[var(--color-yan-red)] transition-colors font-mono uppercase tracking-wider ${currentPath === "" ? "text-[var(--color-yan-charcoal)] font-bold border-b border-[var(--color-yan-charcoal)]" : ""}`}
          >
            Biblioteca
          </button>
          
          {pathSegments.map((segment, idx) => {
            const segmentPath = pathSegments.slice(0, idx + 1).join("/");
            const isLast = idx === pathSegments.length - 1;
            return (
              <div key={idx} className="flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-[var(--color-yan-stone)]" />
                <button
                  onClick={() => !isLast && setCurrentPath(segmentPath)}
                  className={`hover:text-[var(--color-yan-red)] transition-colors font-mono uppercase tracking-wider max-w-[150px] truncate ${isLast ? "text-[var(--color-yan-charcoal)] font-bold border-b border-[var(--color-yan-charcoal)]" : ""}`}
                  disabled={isLast}
                >
                  {segment}
                </button>
              </div>
            );
          })}

          {currentPath !== "" && (
            <button
              onClick={() => {
                const parent = pathSegments.slice(0, -1).join("/");
                setCurrentPath(parent);
              }}
              className="ml-3 flex items-center gap-1 text-[10px] bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] px-2 py-0.5 hover:text-[var(--color-yan-red)] transition-colors font-mono uppercase"
            >
              <ArrowLeft className="w-3 h-3" />
              Subir Nivel
            </button>
          )}
        </div>

        {/* Create Folder Form */}
        <form onSubmit={handleCreateFolder} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nueva carpeta..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="px-3 py-1.5 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] text-xs outline-none transition-colors text-[var(--color-yan-charcoal)] placeholder:text-[var(--color-yan-stone)] font-mono w-44"
            disabled={creatingFolder}
          />
          <button
            type="submit"
            disabled={creatingFolder || !newFolderName.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] disabled:bg-[var(--color-yan-stone)] disabled:cursor-not-allowed text-[var(--color-yan-ivory)] text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
          >
            {creatingFolder ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
            Crear Carpeta
          </button>
        </form>
      </div>

      {/* Batch Actions Action Bar */}
      {selectedItems.length > 0 && (
        <div className="bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] border-l-4 border-l-[var(--color-yan-red)] p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
          <span className="text-xs font-mono text-[var(--color-yan-charcoal)] uppercase tracking-wider">
            {selectedItems.length} elemento{selectedItems.length > 1 ? 's' : ''} seleccionado{selectedItems.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMoveModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] hover:border-[var(--color-yan-red)] hover:text-[var(--color-yan-red)] text-xs font-mono uppercase tracking-wider font-semibold transition-all"
            >
              <Move className="w-3.5 h-3.5" />
              Mover a...
            </button>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="text-xs font-mono text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] px-2 py-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Drag & Drop Overlay Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 flex flex-col relative min-h-[50vh] ${dragOver ? 'bg-[var(--color-yan-surface-elevated)]/50 border-2 border-dashed border-[var(--color-yan-red)]' : ''}`}
      >
        {dragOver && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none z-10">
            <Upload className="w-12 h-12 text-[var(--color-yan-red)] animate-bounce mb-3" />
            <p className="font-mono text-sm uppercase tracking-widest font-bold text-[var(--color-yan-charcoal)]">Suelta los archivos para subir</p>
          </div>
        )}

        {/* Media items container */}
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--color-yan-stone)] bg-white/50">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[var(--color-yan-red)]" />
            <p className="font-mono text-xs uppercase tracking-widest font-bold">Cargando biblioteca...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Main File list (3 cols or full depending on detail pane) */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 ${activeItem ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              
              {/* Select All Toggle Card */}
              {images.length > 0 && (
                <div 
                  onClick={toggleSelectAll}
                  className="flex items-center justify-center p-4 border border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] hover:bg-[var(--color-yan-surface)] cursor-pointer transition-colors text-center"
                >
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--color-yan-stone)] font-bold">
                    {selectedItems.length === images.length ? "Desmarcar todo" : "Seleccionar todo"}
                  </span>
                </div>
              )}

              {/* Items Grid */}
              {images.length > 0 ? (
                images.map((item, idx) => {
                  const isSelected = selectedItems.some(i => i.path === item.path);
                  
                  if (item.isFolder) {
                    return (
                      <div 
                        key={item.path}
                        onClick={() => setCurrentPath(item.path)}
                        className={`group relative border p-4 bg-[var(--color-yan-surface-elevated)] hover:bg-[var(--color-yan-surface)] cursor-pointer transition-all flex flex-col justify-between h-32 ${
                          isSelected ? 'border-[var(--color-yan-red)] ring-1 ring-[var(--color-yan-red)]' : 'border-[var(--color-yan-border)] hover:border-[var(--color-yan-stone)]'
                        }`}
                      >
                        {/* Checkbox button */}
                        <button
                          onClick={(e) => toggleSelect(item, e)}
                          className={`absolute top-2 left-2 w-4 h-4 border transition-colors flex items-center justify-center ${
                            isSelected ? 'bg-[var(--color-yan-red)] border-[var(--color-yan-red)] text-white' : 'border-[var(--color-yan-stone)] bg-white opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isSelected && <span className="text-[10px] font-bold">✓</span>}
                        </button>

                        <div className="flex items-center justify-center mt-3 text-[var(--color-yan-stone)] group-hover:text-[var(--color-yan-red)] transition-colors">
                          <Folder className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        <div className="flex items-center justify-between text-xs mt-2">
                          <span className="font-mono text-[11px] truncate pr-4 text-[var(--color-yan-charcoal)] font-bold" title={item.name}>
                            {item.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveItem(item);
                            }}
                            className="text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] p-0.5"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // It's a file
                  return (
                    <div 
                      key={item.path}
                      onClick={() => setActiveItem(item)}
                      className={`group relative border p-2 bg-[var(--color-yan-surface-elevated)] hover:bg-[var(--color-yan-surface)] cursor-pointer transition-all flex flex-col justify-between h-44 ${
                        isSelected ? 'border-[var(--color-yan-red)] ring-1 ring-[var(--color-yan-red)]' : 'border-[var(--color-yan-border)] hover:border-[var(--color-yan-stone)]'
                      }`}
                    >
                      {/* Checkbox button */}
                      <button
                        onClick={(e) => toggleSelect(item, e)}
                        className={`absolute top-2 left-2 w-4 h-4 border z-10 transition-colors flex items-center justify-center ${
                          isSelected ? 'bg-[var(--color-yan-red)] border-[var(--color-yan-red)] text-white' : 'border-[var(--color-yan-stone)] bg-white opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isSelected && <span className="text-[10px] font-bold">✓</span>}
                      </button>

                      {/* Image Thumbnail Container */}
                      <div className="flex-1 bg-neutral-900 overflow-hidden relative flex items-center justify-center">
                        <img 
                          src={item.url} 
                          alt={item.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* Item details row */}
                      <div className="flex items-center justify-between text-xs mt-2 pt-1.5 border-t border-[var(--color-yan-border-light)]">
                        <span className="font-mono text-[10px] truncate pr-4 text-[var(--color-yan-stone)]" title={item.name}>
                          {item.name}
                        </span>
                        <span className="font-mono text-[9px] text-[var(--color-yan-stone)] shrink-0">
                          {Math.round(item.size / 1024)} KB
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center text-[var(--color-yan-stone)] border border-dashed border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] flex flex-col items-center justify-center p-6">
                  <Folder className="w-12 h-12 text-[var(--color-yan-stone)]/50 mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-[var(--color-yan-charcoal)]">Esta carpeta está vacía</p>
                  <p className="text-xs text-[var(--color-yan-stone)] mt-1">Sube fotos o crea una subcarpeta.</p>
                </div>
              )}
            </div>

            {/* Sidebar detailing active media item */}
            {activeItem && (
              <div className="lg:col-span-1 border border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] p-5 animate-in fade-in slide-in-from-right-5 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-yan-border)] mb-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--color-yan-charcoal)]">
                    Detalles del Recurso
                  </h3>
                  <button 
                    onClick={() => setActiveItem(null)}
                    className="text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* File Preview Thumbnail */}
                {!activeItem.isFolder ? (
                  <div className="aspect-video w-full bg-neutral-900 border border-[var(--color-yan-border)] mb-4 overflow-hidden flex items-center justify-center">
                    <img src={activeItem.url} alt={activeItem.name} className="object-contain max-h-full" />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-white border border-[var(--color-yan-border)] mb-4 flex items-center justify-center text-[var(--color-yan-stone)]">
                    <Folder className="w-12 h-12 text-[var(--color-yan-stone)]" strokeWidth={1.5} />
                  </div>
                )}

                {/* Details list */}
                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-[var(--color-yan-stone)] block mb-1">Nombre</label>
                    <span className="text-[var(--color-yan-charcoal)] font-bold break-all">{activeItem.name}</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-[var(--color-yan-stone)] block mb-1">Ruta en Storage</label>
                    <span className="text-[var(--color-yan-stone)] break-all">{activeItem.path}</span>
                  </div>

                  {!activeItem.isFolder && (
                    <>
                      <div>
                        <label className="text-[10px] text-[var(--color-yan-stone)] block mb-1">Tamaño</label>
                        <span className="text-[var(--color-yan-charcoal)]">{Math.round(activeItem.size / 1024)} KB ({activeItem.size} bytes)</span>
                      </div>

                      {activeItem.created_at && (
                        <div>
                          <label className="text-[10px] text-[var(--color-yan-stone)] block mb-1">Fecha de subida</label>
                          <span className="text-[var(--color-yan-charcoal)]">{new Date(activeItem.created_at).toLocaleString()}</span>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          onClick={() => handleCopyLink(activeItem.url)}
                          className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] text-white text-xs uppercase font-mono tracking-wider font-semibold transition-colors"
                        >
                          {copiedPath === activeItem.url ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copiar URL Pública
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>

      {/* Move Destination Modal Dialog */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-display font-semibold text-[var(--color-yan-charcoal)] pb-3 border-b border-[var(--color-yan-border)] mb-4 flex items-center gap-2">
              <Move className="w-4 h-4 text-[var(--color-yan-red)]" />
              Mover {selectedItems.length} elemento(s)
            </h3>

            <p className="text-xs text-[var(--color-yan-stone)] mb-4 font-mono leading-relaxed">
              Selecciona la carpeta de destino para trasladar tus archivos/carpetas.
            </p>

            <div className="max-h-60 overflow-y-auto border border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] mb-5">
              <ul className="divide-y divide-[var(--color-yan-border-light)] text-xs font-mono">
                {/* Root Option */}
                <li>
                  <button
                    onClick={() => setDestFolder("")}
                    className={`w-full text-left px-4 py-2.5 hover:bg-[var(--color-yan-border-light)] ${
                      destFolder === "" ? "bg-[var(--color-yan-border-light)] font-bold text-[var(--color-yan-red)]" : "text-[var(--color-yan-charcoal)]"
                    }`}
                  >
                    / Biblioteca (Raíz)
                  </button>
                </li>
                {/* List Folders */}
                {allFolders.map(folder => (
                  <li key={folder}>
                    <button
                      onClick={() => setDestFolder(folder)}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[var(--color-yan-border-light)] truncate ${
                        destFolder === folder ? "bg-[var(--color-yan-border-light)] font-bold text-[var(--color-yan-red)]" : "text-[var(--color-yan-stone)]"
                      }`}
                    >
                      / {folder}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-yan-border)]">
              <button
                onClick={() => setShowMoveModal(false)}
                disabled={moving}
                className="px-4 py-2 border border-[var(--color-yan-border)] text-xs font-mono uppercase font-semibold text-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-surface-elevated)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleMoveSelected}
                disabled={moving}
                className="flex items-center gap-2 px-5 py-2 bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] disabled:bg-[var(--color-yan-stone)] text-white text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
              >
                {moving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Confirmar Traslado
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
