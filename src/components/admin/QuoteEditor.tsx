"use client";

import { useState } from "react";
import { Save, Loader2, Quote } from "lucide-react";
import { updateSiteSettings } from "@/lib/actions/settings";

interface QuoteEditorProps {
  initialTaglineEs: string;
  initialTaglineEn: string;
  initialQuoteAuthor: string;
}

export default function QuoteEditor({
  initialTaglineEs,
  initialTaglineEn,
  initialQuoteAuthor,
}: QuoteEditorProps) {
  const [taglineEs, setTaglineEs] = useState(initialTaglineEs);
  const [taglineEn, setTaglineEn] = useState(initialTaglineEn);
  const [quoteAuthor, setQuoteAuthor] = useState(initialQuoteAuthor);
  const [langTab, setLangTab] = useState<"es" | "en">("es");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await updateSiteSettings({
        tagline_es: taglineEs || null,
        tagline_en: taglineEn || null,
        quote_author: quoteAuthor || null,
      });
      setMessage({ type: "success", text: "Frase editorial guardada" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e: unknown) {
      console.error(e);
      setMessage({ type: "error", text: "Error al guardar" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] flex flex-col">
      <div className="px-6 py-4 border-b border-[var(--color-yan-border)] flex items-center justify-between">
        <h2 className="text-base font-display font-semibold text-[var(--color-yan-charcoal)] flex items-center gap-2">
          <Quote className="w-4 h-4 text-[var(--color-yan-red)]" strokeWidth={1.5} />
          Frase Editorial (Tagline)
        </h2>
        <div className="flex bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] p-0.5">
          <button
            type="button"
            className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${
              langTab === "es"
                ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]"
                : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"
            }`}
            onClick={() => setLangTab("es")}
          >
            ES
          </button>
          <button
            type="button"
            className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${
              langTab === "en"
                ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]"
                : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"
            }`}
            onClick={() => setLangTab("en")}
          >
            EN
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {message && (
          <div
            className={`p-2 text-[10px] font-mono uppercase tracking-wider rounded-none ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-yan-stone)]">
            Cita / Eslogan ({langTab.toUpperCase()})
          </label>
          {langTab === "es" ? (
            <textarea
              value={taglineEs}
              onChange={(e) => setTaglineEs(e.target.value)}
              placeholder="Ej: La revista que inspira..."
              rows={3}
              className="bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] px-3 py-2 text-[12px] outline-none transition-colors text-[var(--color-yan-charcoal)] placeholder:text-[var(--color-yan-stone)] resize-none font-sans"
            />
          ) : (
            <textarea
              value={taglineEn}
              onChange={(e) => setTaglineEn(e.target.value)}
              placeholder="Ej: The magazine that inspires..."
              rows={3}
              className="bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] px-3 py-2 text-[12px] outline-none transition-colors text-[var(--color-yan-charcoal)] placeholder:text-[var(--color-yan-stone)] resize-none font-sans"
            />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-yan-stone)]">
            Autor de la cita
          </label>
          <input
            type="text"
            value={quoteAuthor}
            onChange={(e) => setQuoteAuthor(e.target.value)}
            placeholder="Ej: STEVE JOBS"
            className="bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] px-3 py-2 text-[12px] outline-none transition-colors text-[var(--color-yan-charcoal)] placeholder:text-[var(--color-yan-stone)]"
          />
        </div>
      </div>

      <div className="px-4 py-3 border-t border-[var(--color-yan-border)]">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full bg-[var(--color-yan-charcoal)] hover:bg-[var(--color-yan-red)] disabled:bg-[var(--color-yan-stone)] text-[var(--color-yan-ivory)] py-2 text-[11px] font-medium tracking-wide transition-colors"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
          )}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
