"use client";

import { X, Upload, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getMediaLibrary, uploadImage, deleteImage } from "@/lib/actions/media";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string | null;
}

export default function MediaUploader({ onClose, onSelect }: { onClose: () => void, onSelect: (url: string) => void }) {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("library");
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await getMediaLibrary();
      setImages(data);
    } catch (e) {
      console.error("Error fetching media library:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "library") {
      fetchImages();
    }
  }, [activeTab]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData);
      
      // Auto-select the uploaded image
      onSelect(result.url);
    } catch (e) {
      console.error("Error uploading file:", e);
      alert("Error al subir el archivo. Verifica el tamaño y formato.");
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
                  <p className="text-sm text-[var(--color-yan-stone)]">Por favor espera a que se procese la imagen</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-[var(--color-yan-stone)] mb-4" strokeWidth={1.5} />
                  <p className="text-lg font-medium text-[var(--color-yan-charcoal)] mb-1">Arrastra tus archivos aquí</p>
                  <p className="text-sm text-[var(--color-yan-stone)] mb-4">o haz clic para seleccionar</p>
                  <button className="px-6 py-2 bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none hover:border-[var(--color-yan-red)] transition-colors text-sm font-medium text-[var(--color-yan-charcoal)]">
                    Seleccionar archivo
                  </button>
                </>
              )}
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="p-20 flex flex-col items-center justify-center text-[var(--color-yan-stone)]">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-yan-red)]" />
                  <p className="font-mono text-xs uppercase tracking-widest">Cargando biblioteca...</p>
                </div>
              ) : images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="group relative aspect-video rounded-none overflow-hidden border border-[var(--color-yan-border)] cursor-pointer hover:border-[var(--color-yan-red)] transition-colors bg-[var(--color-yan-surface-elevated)]"
                      onClick={() => onSelect(img.url)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.name} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[var(--color-yan-ivory)] text-xs font-mono uppercase tracking-widest px-3 py-1.5 bg-[var(--color-yan-red)] rounded-none">
                          Insertar
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, img)}
                        disabled={deletingPath === img.path}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-none opacity-0 group-hover:opacity-100 transition-all border border-white/10"
                      >
                        {deletingPath === img.path ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center border border-dashed border-[var(--color-yan-border)] rounded-none bg-[var(--color-yan-surface-elevated)] flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 text-[var(--color-yan-stone)] mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-[var(--color-yan-charcoal)] font-semibold">La biblioteca está vacía</p>
                  <p className="text-xs text-[var(--color-yan-stone)] mt-1">Sube archivos en la pestaña correspondiente.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
