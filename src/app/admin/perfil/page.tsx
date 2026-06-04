"use client";

import { useState, useEffect } from "react";
import { User, Save, Loader2, Image as ImageIcon, Trash2, Mail, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth";
import { updateProfile } from "@/lib/actions/profile";
import MediaUploader from "@/components/admin/MediaUploader";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile fields state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("");

  // Media uploader state
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await getCurrentUser();
        if (profile) {
          setFullName(profile.full_name || "");
          setEmail(profile.email || "");
          setAvatarUrl(profile.avatar_url || "");
          setRole(profile.role || "viewer");
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
        setMessage({ type: "error", text: "No se pudo cargar la información de tu perfil." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      // Notify other components (like AdminHeader) that profile updated
      window.dispatchEvent(new Event("profile-updated"));

      setMessage({ type: "success", text: "Perfil actualizado exitosamente." });
      
      // Auto-dismiss success message
      setTimeout(() => setMessage(null), 4000);
    } catch (e: any) {
      console.error("Error updating profile:", e);
      setMessage({ 
        type: "error", 
        text: e?.message || "Ocurrió un error al guardar los cambios en tu perfil." 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-[var(--color-yan-stone)]">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-yan-red)]" />
        <p className="font-mono text-xs uppercase tracking-widest">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-fade-in-up">
      <div className="pb-6 border-b border-[var(--color-yan-border)] flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-display text-[var(--color-yan-charcoal)]">Mi Perfil</h1>
          <p className="text-[var(--color-yan-stone)] text-sm">Personaliza tu identidad editorial, seudónimo y foto de avatar.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Role */}
          <div className="space-y-6 md:col-span-1">
            <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-6 flex flex-col items-center text-center">
              <span className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-4">Foto de Perfil</span>
              
              {/* Avatar display box */}
              <div className="w-32 h-32 bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] flex items-center justify-center overflow-hidden mb-4 relative group">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-[var(--color-yan-stone)]" strokeWidth={1} />
                )}
                {avatarUrl && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-none transition-colors"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setIsMediaOpen(true)}
                  className="px-4 py-2 border border-[var(--color-yan-border)] hover:border-[var(--color-yan-red)] text-xs font-mono uppercase tracking-wider text-[var(--color-yan-charcoal)] hover:text-[var(--color-yan-red)] bg-[var(--color-yan-surface-elevated)] transition-colors rounded-none"
                >
                  Cambiar Imagen
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="md:hidden px-4 py-2 border border-red-500/20 hover:border-red-500 text-xs font-mono uppercase tracking-wider text-red-600 bg-red-500/5 transition-colors rounded-none"
                  >
                    Eliminar Imagen
                  </button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--color-yan-border)] w-full">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-1">Rol Editorial</span>
                <span className="inline-block px-3 py-1 bg-[var(--color-yan-red)] text-[var(--color-yan-ivory)] text-[11px] font-mono uppercase tracking-widest font-semibold">
                  {role === "admin" ? "Administrador" : role === "editor" ? "Editor" : "Lector"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Identity Details */}
          <div className="space-y-6 md:col-span-2">
            <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none overflow-hidden">
              <div className="p-6 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] flex items-center gap-2.5">
                <User className="w-4 h-4 text-[var(--color-yan-red)]" />
                <h2 className="text-base font-bold font-display text-[var(--color-yan-charcoal)]">Detalles de Identidad</h2>
              </div>
              <div className="p-6 space-y-6">
                
                {/* Full Name / Pseudonym */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Nombre Completo o Seudónimo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Tu nombre o seudónimo de redacción"
                    className="w-full bg-[var(--color-yan-surface-elevated)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] rounded-none px-4 py-2.5 outline-none text-[var(--color-yan-charcoal)] text-sm transition-colors"
                  />
                  <p className="text-[11px] text-[var(--color-yan-stone)] mt-2">
                    Este nombre es el que aparecerá público como autor de tus artículos redactados.
                  </p>
                </div>

                {/* Email Address (Read-only) */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-yan-stone)] mb-2">Dirección de Correo</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-[var(--color-yan-border-light)] border border-[var(--color-yan-border)] rounded-none px-4 py-2.5 pl-10 outline-none text-[var(--color-yan-stone)] text-sm cursor-not-allowed font-mono"
                    />
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-[var(--color-yan-stone)]" />
                  </div>
                  <div className="mt-2.5 flex items-start gap-2 text-[11px] text-[var(--color-yan-stone)] leading-relaxed">
                    <ShieldAlert className="w-3.5 h-3.5 text-[var(--color-yan-stone)] flex-shrink-0 mt-0.5" />
                    <span>
                      El correo electrónico no puede ser modificado ya que representa tu identidad de acceso y autenticación única.
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
        </div>

        {/* Submit action */}
        <div className="flex justify-end pt-4">
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

      {/* Media Uploader Modal */}
      {isMediaOpen && (
        <MediaUploader
          onClose={() => setIsMediaOpen(false)}
          onSelect={(url) => {
            setAvatarUrl(url);
            setIsMediaOpen(false);
          }}
        />
      )}
    </div>
  );
}
