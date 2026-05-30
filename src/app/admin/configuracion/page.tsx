import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Configuración</h1>
        <p className="text-yan-muted">Ajustes generales del sitio web y panel.</p>
      </div>

      <div className="bg-yan-surface border border-yan-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-yan-border">
          <h2 className="text-xl font-bold">Información del Sitio</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-yan-muted mb-2">Nombre del Sitio</label>
              <input type="text" defaultValue="YAN MAG" className="w-full bg-yan-surface-elevated border border-yan-border rounded-md px-4 py-2 outline-none focus:border-yan-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-yan-muted mb-2">URL del Sitio</label>
              <input type="text" defaultValue="https://yanmag.com" className="w-full bg-yan-surface-elevated border border-yan-border rounded-md px-4 py-2 outline-none focus:border-yan-accent" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-yan-muted mb-2">Descripción Corta (SEO)</label>
            <textarea 
              defaultValue="Revista digital independiente de arte, moda y cultura contemporánea." 
              className="w-full bg-yan-surface-elevated border border-yan-border rounded-md px-4 py-2 outline-none focus:border-yan-accent resize-none h-24"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="bg-yan-surface border border-yan-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-yan-border">
          <h2 className="text-xl font-bold">Redes Sociales</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <label className="w-24 text-sm font-medium text-yan-muted">Instagram</label>
            <input type="text" defaultValue="https://instagram.com/yanmag" className="flex-1 bg-yan-surface-elevated border border-yan-border rounded-md px-4 py-2 outline-none focus:border-yan-accent text-sm" />
          </div>
          <div className="flex items-center space-x-4">
            <label className="w-24 text-sm font-medium text-yan-muted">Twitter / X</label>
            <input type="text" defaultValue="https://twitter.com/yanmag" className="flex-1 bg-yan-surface-elevated border border-yan-border rounded-md px-4 py-2 outline-none focus:border-yan-accent text-sm" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center px-6 py-3 bg-yan-accent text-white rounded-md hover:bg-yan-accent-dark transition-colors font-medium shadow-lg shadow-yan-accent/20">
          <Save className="w-5 h-5 mr-2" />
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
