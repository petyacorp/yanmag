"use client";

import { X, Upload, Image as ImageIcon, Loader2, Trash2, Folder, FolderPlus, ChevronRight, ArrowLeft } from "lucide-react";
import ImageGuideFile from "@/components/admin/ImageGuideFile";
import { useState, useEffect, useRef } from "react";
import { getMediaLibrary, deleteImage, uploadImage, createMediaFolder, deleteFolder } from "@/lib/actions/media";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string | null;
  isFolder?: boolean;
}

export default function MediaUploader({ onClose, onSelect }: { onClose: () => void, onSelect: (url: string) => void }) {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("library");
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder management state
  const [currentPath, setCurrentPath] = useState<string>("articles"); // starts at 'articles' as default root
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMediaLibrary(currentPath);
      setImages(data);
    } catch (e: any) {
      console.error("Error fetching media library:", e);
      setError("No se pudo cargar la biblioteca de medios. Verifica si el bucket 'media' está creado en Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
    if (activeTab === "library") {
      fetchImages();
    }
  }, [activeTab, currentPath]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setError(null);
      setUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", currentPath);

      const result = await uploadImage(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Auto-select the uploaded image
      onSelect(result.url!);
    } catch (e: any) {
      console.error("Error uploading file:", e);
      const errorMsg = e?.message || String(e);
      setError(`Error al subir el archivo: ${errorMsg}. Asegúrate de que el bucket 'media' exista y que los permisos RLS estén configurados.`);
    } finally {
      setUploading(false);
    }
  };

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
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleDelete = async (e: React.MouseEvent, img: MediaFile) => {
    e.stopPropagation(); // prevent selecting the image
    if (window.confirm(`¿Estás seguro de que deseas eliminar la imagen "${img.name}"?`)) {
      try {
        setDeletingPath(img.path);
        await deleteImage(img.path);
        setImages(prev => prev.filter(item => item.path !== img.path));
      } catch (e) {
        console.error("Error deleting image:", e);
        alert("No se pudo eliminar la imagen.");
      } finally {
        setDeletingPath(null);
      }
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setCreatingFolder(true);
      setError(null);
      const res = await createMediaFolder(currentPath, newFolderName);
      if (res.success) {
        setNewFolderName("");
        fetchImages();
      } else {
        setError(res.error || "No se pudo crear la carpeta.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Ocurrió un error inesperado al crear la carpeta.");
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent, folder: MediaFile) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de que deseas eliminar la carpeta "${folder.name}" y todo su contenido?`)) {
      try {
        setDeletingPath(folder.path);
        await deleteFolder(folder.path);
        setImages(prev => prev.filter(item => item.path !== folder.path));
      } catch (e) {
        console.error("Error deleting folder:", e);
        alert("No se pudo eliminar la carpeta.");
      } finally {
        setDeletingPath(null);
      }
    }
  };

  // Build breadcrumbs path segments
  const pathSegments = currentPath ? currentPath.split("/").filter(Boolean) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface)]">
          <h2 className="text-xl font-bold font-display text-[var(--color-yan-charcoal)]">Gestor de Medios</h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--color-yan-surface-elevated)] border border-transparent hover:border-[var(--color-yan-border)] rounded-none text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[var(--color-yan-border)] px-4 bg-[var(--color-yan-surface-elevated)]">
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload' ? 'border-[var(--color-yan-red)] text-[var(--color-yan-red)] bg-[var(--color-yan-surface)]' : 'border-transparent text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]'}`}
            onClick={() => setActiveTab('upload')}
          >
            Subir Archivos
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'library' ? 'border-[var(--color-yan-red)] text-[var(--color-yan-red)] bg-[var(--color-yan-surface)]' : 'border-transparent text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]'}`}
            onClick={() => setActiveTab('library')}
          >
            Biblioteca
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-yan-surface)]">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-mono rounded-none flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-4 font-sans font-bold hover:text-red-800 text-lg leading-none">×</button>
            </div>
          )}

          {/* Image Optimization Guidelines */}
          {/* RE "File" — Image Optimization Guide (compact) */}
          <ImageGuideFile compact />

          {activeTab === 'upload' ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-none transition-all cursor-pointer p-12 ${
                dragOver 
                  ? 'border-[var(--color-yan-red)] bg-[var(--color-yan-surface-elevated)]' 
                  : 'border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] hover:border-[var(--color-yan-red)]'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              {uploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-[var(--color-yan-red)] animate-spin mb-4" />
                  <p className="text-lg font-medium text-[var(--color-yan-charcoal)] mb-1">Subiendo archivo...</p>
                  <p className="text-sm text-[var(--color-yan-stone)]">Subiendo a: <span className="font-mono text-xs text-[var(--color-yan-charcoal)]">{currentPath || 'Raíz'}</span></p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-[var(--color-yan-stone)] mb-4" strokeWidth={1.5} />
                  <p className="text-lg font-medium text-[var(--color-yan-charcoal)] mb-1">Arrastra tus archivos aquí</p>
                  <p className="text-sm text-[var(--color-yan-stone)] mb-1">o haz clic para seleccionar</p>
                  <p className="text-xs text-[var(--color-yan-stone)] mb-4 bg-[var(--color-yan-surface)] px-2 py-1 border border-[var(--color-yan-border)] font-mono">Destino: {currentPath || '/'}</p>
                  <button className="px-6 py-2 bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none hover:border-[var(--color-yan-red)] transition-colors text-sm font-medium text-[var(--color-yan-charcoal)]">
                    Seleccionar archivo
                  </button>
                </>
              )}
            </div>
          ) : (
            <div>
              {/* Folder Navigation Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-yan-border)]">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-yan-stone)]">
                  <button
                    onClick={() => setCurrentPath("")}
                    className={`hover:text-[var(--color-yan-red)] transition-colors font-mono uppercase tracking-wider ${currentPath === "" ? "text-[var(--color-yan-charcoal)] font-bold" : ""}`}
                  >
                    Raíz
                  </button>
                  
                  {pathSegments.map((segment, idx) => {
                    const segmentPath = pathSegments.slice(0, idx + 1).join("/");
                    const isLast = idx === pathSegments.length - 1;
                    return (
                      <div key={idx} className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-[var(--color-yan-stone)]" />
                        <button
                          onClick={() => !isLast && setCurrentPath(segmentPath)}
                          className={`hover:text-[var(--color-yan-red)] transition-colors font-mono uppercase tracking-wider max-w-[120px] truncate ${isLast ? "text-[var(--color-yan-charcoal)] font-bold" : ""}`}
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
                      className="ml-2 flex items-center gap-1 text-[10px] bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] px-1.5 py-0.5 hover:text-[var(--color-yan-red)] transition-colors text-[var(--color-yan-stone)]"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Atrás
                    </button>
                  )}
                </div>

                {/* Folder Creation Form */}
                <form onSubmit={handleCreateFolder} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nueva carpeta..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="px-3 py-1.5 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] text-xs outline-none transition-colors text-[var(--color-yan-charcoal)] placeholder:text-[var(--color-yan-stone)] w-40"
                    disabled={creatingFolder}
                  />
                  <button
                    type="submit"
                    disabled={creatingFolder || !newFolderName.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] disabled:bg-[var(--color-yan-stone)] disabled:cursor-not-allowed text-[var(--color-yan-ivory)] text-xs font-medium transition-colors"
                  >
                    {creatingFolder ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <FolderPlus className="w-3 h-3" strokeWidth={1.5} />
                    )}
                    Crear Carpeta
                  </button>
                </form>
              </div>

              {loading ? (
                <div className="p-20 flex flex-col items-center justify-center text-[var(--color-yan-stone)]">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-yan-red)]" />
                  <p className="font-mono text-xs uppercase tracking-widest">Cargando biblioteca...</p>
                </div>
              ) : images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((item, idx) => {
                    if (item.isFolder) {
                      return (
                        <div 
                          key={idx} 
                          className="group relative aspect-video flex flex-col items-center justify-center border border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] cursor-pointer hover:border-[var(--color-yan-red)] transition-all p-4"
                          onClick={() => setCurrentPath(item.path)}
                        >
                          <Folder className="w-10 h-10 text-[var(--color-yan-stone)] group-hover:text-[var(--color-yan-red)] transition-colors mb-2" strokeWidth={1.5} />
                          <span className="text-xs font-medium text-[var(--color-yan-charcoal)] truncate max-w-full font-mono uppercase tracking-wider">
                            {item.name}
                          </span>
                          <button
                            onClick={(e) => handleDeleteFolder(e, item)}
                            disabled={deletingPath === item.path}
                            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-none opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                          >
                            {deletingPath === item.path ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={idx} 
                        className="group relative aspect-video rounded-none overflow-hidden border border-[var(--color-yan-border)] cursor-pointer hover:border-[var(--color-yan-red)] transition-colors bg-[var(--color-yan-surface-elevated)]"
                        onClick={() => onSelect(item.url)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.name} className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[var(--color-yan-ivory)] text-xs font-mono uppercase tracking-widest px-3 py-1.5 bg-[var(--color-yan-red)] rounded-none">
                            Insertar
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, item)}
                          disabled={deletingPath === item.path}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-none opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                        >
                          {deletingPath === item.path ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-20 text-center border border-dashed border-[var(--color-yan-border)] rounded-none bg-[var(--color-yan-surface-elevated)] flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 text-[var(--color-yan-stone)] mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-[var(--color-yan-charcoal)] font-semibold">Esta carpeta está vacía</p>
                  <p className="text-xs text-[var(--color-yan-stone)] mt-1">Sube archivos o crea una subcarpeta.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
