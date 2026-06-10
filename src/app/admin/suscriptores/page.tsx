import { getNewsletterSubscribers } from "@/lib/actions/settings";
import { ArrowLeft, Users, Mail, Calendar, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const subscribers = await getNewsletterSubscribers();
  const activeCount = subscribers.filter(s => s.is_active).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header & Back Button */}
      <div className="pb-6 border-b border-[var(--color-yan-border)] flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/admin" 
            className="p-2 hover:bg-[var(--color-yan-surface-elevated)] border border-transparent hover:border-[var(--color-yan-border)] rounded-none transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-display text-[var(--color-yan-charcoal)]">
              Suscriptores
            </h1>
            <p className="text-[var(--color-yan-stone)] text-sm">
              Listado de suscriptores al newsletter del sitio.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-6 flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-mono tracking-[0.2em] uppercase text-[var(--color-yan-stone)] mb-2">
              Total Suscriptores
            </h3>
            <p className="text-3xl font-sans font-bold text-[var(--color-yan-charcoal)] tracking-tight">
              {subscribers.length}
            </p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-[var(--color-yan-surface-elevated)] text-[var(--color-yan-charcoal)] border border-[var(--color-yan-border)]">
            <Mail className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-6 flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-mono tracking-[0.2em] uppercase text-[var(--color-yan-stone)] mb-2">
              Suscripciones Activas
            </h3>
            <p className="text-3xl font-sans font-bold text-emerald-600 tracking-tight">
              {activeCount}
            </p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-[var(--color-yan-surface-elevated)] text-emerald-600 border border-[var(--color-yan-border)]">
            <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] p-6 flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-mono tracking-[0.2em] uppercase text-[var(--color-yan-stone)] mb-2">
              Suscripciones Inactivas
            </h3>
            <p className="text-3xl font-sans font-bold text-[var(--color-yan-red)] tracking-tight">
              {subscribers.length - activeCount}
            </p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center bg-[var(--color-yan-surface-elevated)] text-[var(--color-yan-red)] border border-[var(--color-yan-border)]">
            <XCircle className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Subscribers Table Card */}
      <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none overflow-hidden">
        <div className="p-6 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] flex items-center gap-2.5">
          <Users className="w-4 h-4 text-[var(--color-yan-red)]" />
          <h2 className="text-base font-bold font-display text-[var(--color-yan-charcoal)]">Registros Recientes</h2>
        </div>
        
        <div className="overflow-x-auto">
          {subscribers.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)]">
                  <th className="p-4 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">Correo Electrónico</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">Nombre</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">Fecha Alta</th>
                  <th className="p-4 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-yan-border-light)] bg-[var(--color-yan-surface)]">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[var(--color-yan-surface-elevated)] transition-colors">
                    <td className="p-4 font-bold text-[var(--color-yan-charcoal)]">{sub.email}</td>
                    <td className="p-4 text-[var(--color-yan-stone)]">{sub.name || "-"}</td>
                    <td className="p-4 text-[var(--color-yan-stone)]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--color-yan-stone)]/60" />
                        <span>
                          {new Date(sub.subscribed_at).toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest font-semibold border ${
                        sub.is_active 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}>
                        {sub.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-[var(--color-yan-stone)] font-mono text-xs">
              No hay suscriptores registrados en el boletín por el momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
