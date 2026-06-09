"use client";

import { useState } from "react";
import { Database, Loader2 } from "lucide-react";
import { seedArticles } from "@/lib/actions/articles";
import { useRouter } from "next/navigation";

export default function SeedArticlesButton() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSeed = async () => {
    if (loading) return;

    if (!confirm("¿Deseas generar 10 artículos aleatorios de prueba en la base de datos?")) {
      return;
    }

    try {
      setLoading(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const result = await seedArticles();

      if (result.success) {
        setSuccessMessage(`¡Éxito! Se crearon ${result.count} artículos.`);
        router.refresh();
        // Hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message || "Ocurrió un error al generar los artículos de prueba.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-[var(--color-yan-charcoal)] text-[var(--color-yan-ivory)] px-5 py-3 hover:bg-[var(--color-yan-red)] disabled:bg-[var(--color-yan-stone)] disabled:cursor-not-allowed transition-colors text-[13px] font-medium tracking-wide border border-transparent"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Database className="w-4 h-4" strokeWidth={1.5} />
        )}
        {loading ? "Generando Artículos..." : "Generar 10 Artículos de Prueba"}
      </button>

      {successMessage && (
        <p className="text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 font-mono mt-1">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="text-xs text-red-600 bg-red-500/10 border border-red-500/20 px-3 py-2 font-mono mt-1">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
