"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { BookOpen, X } from "lucide-react";

/**
 * ImageGuideFile — Resident Evil "File" style interactive component.
 * Renders as a glowing book icon with "Compresión de imágenes" label.
 * On click, plays an atmospheric retro audio cue and opens an aged parchment modal.
 */
export default function ImageGuideFile({ compact = false }: { compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // Control looping ambient background music based on isOpen state
  useEffect(() => {
    if (isOpen) {
      if (!ambientAudioRef.current) {
        ambientAudioRef.current = new Audio("/audio/Resident Evil Remake Soundtrack Save Heaven (1).mp3");
        ambientAudioRef.current.loop = true;
      }
      ambientAudioRef.current.volume = 0.25; // Soft ambient volume
      ambientAudioRef.current.play().catch(err => {
        console.warn("Autoplay / audio playback of Save Room theme was prevented by browser:", err);
      });
    } else {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.currentTime = 0; // Reset track to start
      }
    }

    // Clean up on component unmount
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* ── Trigger: Glowing Book Icon ── */}
      <button
        onClick={handleOpen}
        className={`group flex items-center gap-3 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
          compact ? "mb-4" : "mb-6"
        }`}
        title="Abrir guía de compresión de imágenes"
      >
        {/* Book Icon Container */}
        <div
          className={`relative flex items-center justify-center bg-gradient-to-br from-[#2A1F1A] to-[#1A1310] border border-[#5A3E2E]/60 shadow-lg animate-re-file-glow transition-transform duration-300 group-hover:rotate-[-3deg] ${
            compact ? "w-10 h-10 rounded" : "w-14 h-14 rounded-md"
          }`}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-[var(--color-yan-red)]/10 to-transparent" />
          <BookOpen
            className={`relative z-10 text-[#D4A574] group-hover:text-[#E8C49A] transition-colors duration-300 ${
              compact ? "w-5 h-5" : "w-7 h-7"
            }`}
            strokeWidth={1.5}
          />
          {/* Corner accent */}
          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[var(--color-yan-red)]/50 rounded-full" />
        </div>

        {/* Label */}
        <div className="text-left">
          <p
            className={`font-mono uppercase tracking-[0.15em] text-[var(--color-yan-charcoal)] group-hover:text-[var(--color-yan-red)] transition-colors duration-300 ${
              compact ? "text-[10px]" : "text-xs"
            }`}
          >
            Compresión de imágenes
          </p>
          <p
            className={`font-mono text-[var(--color-yan-stone)] mt-0.5 ${
              compact ? "text-[9px]" : "text-[10px]"
            }`}
          >
            Archivo • Guía de optimización
          </p>
        </div>
      </button>

      {/* ── Modal: RE File Document ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-re-backdrop-in"
          onClick={handleClose}
        >
          {/* Backdrop — dark cinematic vignette */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />

          {/* Document Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg animate-re-file-open"
          >
            {/* Aged paper document (Enhanced Parchment Style) */}
            <div
              className="relative overflow-hidden border-2 border-[#4A3B2B] shadow-2xl p-2 rounded-[2px]"
              style={{
                background: "linear-gradient(135deg, #F3EAD3 0%, #EADCB9 40%, #DFCE9F 80%, #D8C592 100%)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 80px rgba(115, 83, 56, 0.4), inset 0 0 20px rgba(58, 41, 29, 0.35)",
              }}
            >
              {/* Inner vintage frame line */}
              <div className="relative border border-[#A18B6E]/40 h-full p-4 sm:p-6 rounded-[1px]">
                
                {/* Paper texture overlay (Fine noise + subtle fiber patterns) */}
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-[inherit]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                    backgroundSize: "120px",
                  }}
                />

                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-2.5 right-2.5 p-1.5 text-[#5A4B3A]/60 hover:text-[#5A4B3A] hover:bg-[#5A4B3A]/5 transition-colors duration-200 rounded-full"
                  aria-label="Cerrar archivo"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header with RE-style ornament */}
                <div className="flex items-start gap-4 mb-6 pb-4 border-b border-[#9E8B6F]/50">
                  <div className="p-2.5 bg-[#2A1F1A] border border-[#5A3E2E]/60 shadow-md shrink-0 rounded-sm">
                    <BookOpen className="w-6 h-6 text-[#D4A574]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3
                      className="font-display text-xl sm:text-2xl font-bold text-[#201710] tracking-wide"
                      style={{ fontVariant: "small-caps" }}
                    >
                      Compresión de Imágenes
                    </h3>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A6953] mt-1">
                      Archivo de instrucciones • YAN MAG
                    </p>
                  </div>
                </div>

                {/* Body text — RE typewriter style */}
                <div className="space-y-5 text-[#30261A]">
                  <p className="text-sm font-sans font-medium leading-relaxed">
                    Para mantener el rendimiento y velocidad de carga del portal sin sacrificar la
                    fidelidad visual, procesa tus fotos con esta guía antes de subirlas:
                  </p>

                  {/* Steps */}
                  <div className="space-y-4 pl-1">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 text-[11px] font-mono font-bold bg-[#2A1F1A] text-[#D4A574] border border-[#5A3E2E]/40 shrink-0 mt-0.5 rounded-sm">
                        1
                      </span>
                      <p className="text-sm font-sans leading-relaxed">
                        Comprimir en{" "}
                        <a
                          href="https://squoosh.app/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[var(--color-yan-red)] underline underline-offset-2 hover:text-[#8B2920] transition-colors"
                        >
                          Squoosh
                        </a>{" "}
                        <span className="text-xs text-[#7A6953] font-mono">(https://squoosh.app/)</span>
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 text-[11px] font-mono font-bold bg-[#2A1F1A] text-[#D4A574] border border-[#5A3E2E]/40 shrink-0 mt-0.5 rounded-sm">
                        2
                      </span>
                      <p className="text-sm font-sans leading-relaxed">
                        Seleccionar{" "}
                        <span className="font-bold font-mono text-[#201710]">Resize</span> y elegir
                        un ancho (<span className="font-bold font-mono text-[#201710]">Width</span>)
                        de{" "}
                        <span className="font-bold font-mono text-[var(--color-yan-red)]">
                          1920px
                        </span>
                        .
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 text-[11px] font-mono font-bold bg-[#2A1F1A] text-[#D4A574] border border-[#5A3E2E]/40 shrink-0 mt-0.5 rounded-sm">
                        3
                      </span>
                      <p className="text-sm font-sans leading-relaxed">
                        Seleccionar{" "}
                        <span className="font-bold font-mono text-[#201710]">Compress</span>, elegir
                        formato{" "}
                        <span className="font-bold font-mono text-[var(--color-yan-red)]">AVIF</span>{" "}
                        o{" "}
                        <span className="font-bold font-mono text-[var(--color-yan-red)]">WebP</span>
                        , y definir la calidad al{" "}
                        <span className="font-bold font-mono text-[var(--color-yan-red)]">80%</span>{" "}
                        para asegurar que se vea muy similar a la fotografía original.
                      </p>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div className="pt-3 mt-4 border-t border-[#9E8B6F]/40">
                    <p className="text-[10px] font-mono text-[#7A6953] uppercase tracking-widest text-center">
                      — Fin del archivo —
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
