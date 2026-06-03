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
      <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface)]">
          <h2 className="text-xl font-bold font-display text-[var(--color-yan-charcoal)]">Gestor de Medios</h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--color-yan-surface-elevated)] border border-transparent hover:border-[var(--color-yan-border)] rounded-none text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[var(--color-yan-border)] px-4 bg-[var(--color-yan-surface-elevated)]">
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload' ? 'border-[var(--color-yan-red)] text-[var(--color-yan-red)]' : 'border-transparent text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]'}`}
            onClick={() => setActiveTab('upload')}
          >
            Subir Archivos
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'library' ? 'border-[var(--color-yan-red)] text-[var(--color-yan-red)]' : 'border-transparent text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]'}`}
            onClick={() => setActiveTab('library')}
          >
            Biblioteca
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[var(--color-yan-surface)]">
          {activeTab === 'upload' ? (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-[var(--color-yan-border)] rounded-none bg-[var(--color-yan-surface-elevated)] hover:border-[var(--color-yan-red)] hover:bg-[var(--color-yan-surface)] transition-all cursor-pointer p-12">
              <Upload className="w-12 h-12 text-[var(--color-yan-stone)] mb-4" strokeWidth={1.5} />
              <p className="text-lg font-medium text-[var(--color-yan-charcoal)] mb-1">Arrastra tus archivos aquí</p>
              <p className="text-sm text-[var(--color-yan-stone)] mb-4">o haz clic para seleccionar</p>
              <button className="px-6 py-2 bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none hover:border-[var(--color-yan-red)] transition-colors text-sm font-medium text-[var(--color-yan-charcoal)]">
                Seleccionar archivos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="group relative aspect-video rounded-none overflow-hidden border border-[var(--color-yan-border)] cursor-pointer hover:border-[var(--color-yan-red)] transition-colors"
                  onClick={() => onSelect(img)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Mock ${idx}`} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[var(--color-yan-ivory)] text-sm font-medium px-3 py-1 bg-[var(--color-yan-red)] rounded-none">
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
