"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Globe, Settings, Share2, Search } from "lucide-react";
import { getSiteSettings, updateSiteSettings } from "@/lib/actions/settings";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // General settings state
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // Bilingual strings
  const [taglineEs, setTaglineEs] = useState("");
  const [taglineEn, setTaglineEn] = useState("");
  const [descriptionEs, setDescriptionEs] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [langTab, setLangTab] = useState<"es" | "en">("es");

  // Social URLs
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");

  // SEO & Analytics
  const [defaultMetaTitle, setDefaultMetaTitle] = useState("");
  const [defaultMetaDescription, setDefaultMetaDescription] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getSiteSettings();
        if (data) {
          setSiteName(data.site_name || "");
          setLogoUrl(data.logo_url || "");
          setFaviconUrl(data.favicon_url || "");
          setTaglineEs(data.tagline_es || "");
          setTaglineEn(data.tagline_en || "");
          setDescriptionEs(data.description_es || "");
          setDescriptionEn(data.description_en || "");
          setSocialInstagram(data.social_instagram || "");
          setSocialTwitter(data.social_twitter || "");
          setSocialFacebook(data.social_facebook || "");
          setSocialTiktok(data.social_tiktok || "");
          setSocialYoutube(data.social_youtube || "");
          setDefaultMetaTitle(data.default_meta_title || "");
          setDefaultMetaDescription(data.default_meta_description || "");
          setGoogleAnalyticsId(data.google_analytics_id || "");
        }
      } catch (e) {
        console.error("Error fetching site settings:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      
      const payload = {
        site_name: siteName,
        logo_url: logoUrl || null,
        favicon_url: faviconUrl || null,
        tagline_es: taglineEs || null,
        tagline_en: taglineEn || null,
        description_es: descriptionEs || null,
        description_en: descriptionEn || null,
        social_instagram: socialInstagram || null,
        social_twitter: socialTwitter || null,
        social_facebook: socialFacebook || null,
        social_tiktok: socialTiktok || null,
        social_youtube: socialYoutube || null,
        default_meta_title: defaultMetaTitle || null,
        default_meta_description: defaultMetaDescription || null,
        google_analytics_id: googleAnalyticsId || null,
      };

      await updateSiteSettings(payload);
      setMessage({ type: "success", text: "Configuración guardada exitosamente." });
      
      // Auto-dismiss success message
      setTimeout(() => setMessage(null), 4000);
    } catch (e) {
      console.error("Error updating site settings:", e);
      setMessage({ type: "error", text: "Ocurrió un error al guardar los cambios." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-[var(--color-yan-stone)]">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-yan-red)]" />
        <p className="font-mono text-xs uppercase tracking-widest">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="pb-6 border-b border-[var(--color-yan-border)] flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-display text-[var(--color-yan-charcoal)]">Configuración</h1>
          <p className="text-[var(--color-yan-stone)] text-sm">Ajustes generales del sitio web y panel.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 border rounded-none text-xs font-mono uppercase tracking-wider ${
          message.type === "success" 
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
            : "bg-red-500/10 text-red-600 border-red-500/20"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* General Site Info */}
        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none overflow-hidden">
          <div className="p-6 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-[var(--color-yan-red)]" />
            <h2 className="text-base font-bold font-display text-[var(--color-yan-charcoal)]">Información del Sitio</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Nombre del Sitio</label>
                <input 
                  type="text" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                  className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">URL del Logotipo</label>
                <input 
                  type="text" 
                  value={logoUrl} 
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                  className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">URL del Favicon</label>
                <input 
                  type="text" 
                  value={faviconUrl} 
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="/favicon.ico"
                  className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bilingual texts */}
        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none overflow-hidden">
          <div className="p-6 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-[var(--color-yan-red)]" />
              <h2 className="text-base font-bold font-display text-[var(--color-yan-charcoal)]">Textos Editoriales</h2>
            </div>
            
            {/* Translation switch tab */}
            <div className="flex bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-0.5">
              <button 
                type="button"
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${langTab === "es" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
                onClick={() => setLangTab("es")}
              >
                Español
              </button>
              <button 
                type="button"
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${langTab === "en" ? "bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)]" : "text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)]"}`}
                onClick={() => setLangTab("en")}
              >
                Inglés
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {langTab === "es" ? (
              <>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Eslogan / Tagline (Español)</label>
                  <input 
                    type="text" 
                    value={taglineEs} 
                    onChange={(e) => setTaglineEs(e.target.value)}
                    placeholder="Revista de arte, moda y diseño..."
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Descripción del Sitio (Español)</label>
                  <textarea 
                    value={descriptionEs} 
                    onChange={(e) => setDescriptionEs(e.target.value)}
                    placeholder="Descripción larga de YAN MAG en español..."
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm resize-none h-24 transition-colors"
                  ></textarea>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Eslogan / Tagline (Inglés)</label>
                  <input 
                    type="text" 
                    value={taglineEn} 
                    onChange={(e) => setTaglineEn(e.target.value)}
                    placeholder="Art, fashion, and design magazine..."
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Descripción del Sitio (Inglés)</label>
                  <textarea 
                    value={descriptionEn} 
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Long description of YAN MAG in english..."
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm resize-none h-24 transition-colors"
                  ></textarea>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Social Networks */}
        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none overflow-hidden">
          <div className="p-6 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] flex items-center gap-2.5">
            <Share2 className="w-4 h-4 text-[var(--color-yan-red)]" />
            <h2 className="text-base font-bold font-display text-[var(--color-yan-charcoal)]">Redes Sociales</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <label className="w-28 text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)]">Instagram</label>
              <input 
                type="text" 
                value={socialInstagram} 
                onChange={(e) => setSocialInstagram(e.target.value)}
                placeholder="https://instagram.com/yanmag" 
                className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-28 text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)]">Twitter / X</label>
              <input 
                type="text" 
                value={socialTwitter} 
                onChange={(e) => setSocialTwitter(e.target.value)}
                placeholder="https://twitter.com/yanmag" 
                className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-28 text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)]">Facebook</label>
              <input 
                type="text" 
                value={socialFacebook} 
                onChange={(e) => setSocialFacebook(e.target.value)}
                placeholder="https://facebook.com/yanmag" 
                className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-28 text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)]">TikTok</label>
              <input 
                type="text" 
                value={socialTiktok} 
                onChange={(e) => setSocialTiktok(e.target.value)}
                placeholder="https://tiktok.com/@yanmag" 
                className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-28 text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)]">YouTube</label>
              <input 
                type="text" 
                value={socialYoutube} 
                onChange={(e) => setSocialYoutube(e.target.value)}
                placeholder="https://youtube.com/yanmag" 
                className="flex-1 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* SEO & Analytics */}
        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none overflow-hidden">
          <div className="p-6 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[var(--color-yan-red)]" />
            <h2 className="text-base font-bold font-display text-[var(--color-yan-charcoal)]">SEO & Analítica</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Meta Título por Defecto</label>
                <input 
                  type="text" 
                  value={defaultMetaTitle} 
                  onChange={(e) => setDefaultMetaTitle(e.target.value)}
                  placeholder="YAN MAG | Arte, Moda y Cultura"
                  className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">ID de Google Analytics</label>
                <input 
                  type="text" 
                  value={googleAnalyticsId} 
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors font-mono" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Meta Descripción por Defecto</label>
              <textarea 
                value={defaultMetaDescription} 
                onChange={(e) => setDefaultMetaDescription(e.target.value)}
                placeholder="Descripción SEO por defecto..."
                className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2 outline-none text-[var(--color-yan-charcoal)] text-sm resize-none h-20 transition-colors"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center px-6 py-3 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] hover:bg-[var(--color-yan-red)] rounded-none transition-colors text-sm font-medium tracking-wide disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" strokeWidth={1.5} />
            )}
            Guardar Cambios
          </button>
        </div>

      </form>
    </div>
  );
}
