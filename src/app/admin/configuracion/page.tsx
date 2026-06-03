import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="pb-6 border-b border-[var(--color-yan-border)]">
        <h1 className="text-3xl font-bold tracking-tight mb-2 font-display text-[var(--color-yan-charcoal)]">Configuración</h1>
        <p className="text-[var(--color-yan-stone)] text-sm">Ajustes generales del sitio web y panel.</p>
      </div>

      <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none overflow-hidden">
        <div className="p-6 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)]">
          <h2 className="text-lg font-bold font-display text-[var(--color-yan-charcoal)]">Información del Sitio</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Nombre del Sitio</label>
              <input type="text" defaultValue="YAN MAG" className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">URL del Sitio</label>
              <input type="text" defaultValue="https://yanmag.com" className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Descripción Corta (SEO)</label>
            <textarea 
              defaultValue="Revista digital independiente de arte, moda y cultura contemporánea." 
              className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm resize-none h-24 transition-colors"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none overflow-hidden">
        <div className="p-6 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)]">
          <h2 className="text-lg font-bold font-display text-[var(--color-yan-charcoal)]">Redes Sociales</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <label className="w-24 text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)]">Instagram</label>
            <input type="text" defaultValue="https://instagram.com/yanmag" className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-24 text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)]">Twitter / X</label>
            <input type="text" defaultValue="https://twitter.com/yanmag" className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center px-6 py-3 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] hover:bg-[var(--color-yan-red)] rounded-none transition-colors text-sm font-medium tracking-wide">
          <Save className="w-5 h-5 mr-2" strokeWidth={1.5} />
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
