"use client";

import { useState } from "react";
import { Save, Loader2, Plus, Trash2, ArrowUp, ArrowDown, Radio } from "lucide-react";
import { updateTickerItems } from "@/lib/actions/settings";

interface TickerEditorProps {
  initialItemsEs: string[];
  initialItemsEn: string[];
}

export default function TickerEditor({ initialItemsEs, initialItemsEn }: TickerEditorProps) {
  const [itemsEs, setItemsEs] = useState<string[]>(initialItemsEs.length > 0 ? initialItemsEs : ['']);
  const [itemsEn, setItemsEn] = useState<string[]>(initialItemsEn.length > 0 ? initialItemsEn : ['']);
  const [langTab, setLangTab] = useState<"es" | "en">("es");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const items = langTab === "es" ? itemsEs : itemsEn;
  const setItems = langTab === "es" ? setItemsEs : setItemsEn;

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, '']);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const filteredEs = itemsEs.filter(i => i.trim() !== '');
      const filteredEn = itemsEn.filter(i => i.trim() !== '');
      await updateTickerItems(filteredEs, filteredEn);
      setMessage({ type: "success", text: "Ticker actualizado" });
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
          <Radio className="w-4 h-4 text-[var(--color-yan-red)]" strokeWidth={1.5} />
          Ticker de Noticias
        </h2>
        <div className="flex bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] p-0.5">
          <button
            type="button"
            className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${langTab === "es" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
            onClick={() => setLangTab("es")}
          >
            ES
          </button>
          <button
            type="button"
            className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${langTab === "en" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
            onClick={() => setLangTab("en")}
          >
            EN
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
        {message && (
          <div className={`p-2 text-[10px] font-mono uppercase tracking-wider rounded-none ${
            message.type === "success" 
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
              : "bg-red-500/10 text-red-600 border border-red-500/20"
          }`}>
            {message.text}
          </div>
        )}

        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 group">
            <span className="text-[9px] font-mono text-[var(--color-yan-stone)] w-4 text-right shrink-0">
              {index + 1}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={`Texto del ticker ${index + 1}...`}
              className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] px-2.5 py-1.5 text-[12px] outline-none transition-colors text-[var(--color-yan-charcoal)] placeholder:text-[var(--color-yan-stone)]"
            />
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="p-1 text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] disabled:opacity-30 transition-colors"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="p-1 text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] disabled:opacity-30 transition-colors"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
                className="p-1 text-[var(--color-yan-stone)] hover:text-red-500 disabled:opacity-30 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-yan-stone)] hover:text-[var(--color-yan-red)] transition-colors mt-2 pl-5"
        >
          <Plus className="w-3 h-3" />
          Añadir item
        </button>
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
          Guardar Ticker
        </button>
      </div>
    </div>
  );
}
