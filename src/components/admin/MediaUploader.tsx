"use client";

import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export default function MediaUploader({ onClose, onSelect }: { onClose: () => void, onSelect: (url: string) => void }) {
  const [activeTab, setActiveTab] = useState<"upload" | "library">("library");

  const mockImages = [
    "https://images.unsplash.com/photo-1515347619362-7935701a2ab5?w=500&h=300&fit=crop",
    "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&h=300&fit=crop",
    "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?w=500&h=300&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=300&fit=crop"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-yan-surface border border-yan-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-yan-border bg-yan-surface">
          <h2 className="text-xl font-bold">Gestor de Medios</h2>
          <button onClick={onClose} className="p-1 hover:bg-yan-surface-elevated rounded-md text-yan-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-yan-border px-4 bg-yan-surface-elevated">
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload' ? 'border-yan-accent text-yan-accent' : 'border-transparent text-yan-muted hover:text-foreground'}`}
            onClick={() => setActiveTab('upload')}
          >
            Subir Archivos
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'library' ? 'border-yan-accent text-yan-accent' : 'border-transparent text-yan-muted hover:text-foreground'}`}
            onClick={() => setActiveTab('library')}
          >
            Biblioteca
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-yan-surface">
          {activeTab === 'upload' ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-yan-border rounded-lg bg-yan-surface-elevated hover:border-yan-accent hover:bg-yan-surface transition-all cursor-pointer p-12">
              <Upload className="w-12 h-12 text-yan-muted mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">Arrastra tus archivos aquí</p>
              <p className="text-sm text-yan-muted mb-4">o haz clic para seleccionar</p>
              <button className="px-6 py-2 bg-yan-surface border border-yan-border rounded-md hover:border-yan-accent transition-colors text-sm font-medium">
                Seleccionar archivos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="group relative aspect-video rounded-lg overflow-hidden border border-yan-border cursor-pointer hover:border-yan-accent"
                  onClick={() => onSelect(img)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Mock ${idx}`} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium px-3 py-1 bg-yan-accent rounded-md">
                      Insertar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
