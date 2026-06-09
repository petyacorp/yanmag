"use client";

import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  editLinkPrefix?: string;
  onEdit?: (row: any) => void;
  onDelete?: (id: string) => void;
}

export default function DataTable({ columns, data, editLinkPrefix, onEdit, onDelete }: DataTableProps) {
  return (
    <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] rounded-none overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-yan-surface-elevated)] border-b border-[var(--color-yan-border)]">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-[10px] font-mono tracking-wider text-[var(--color-yan-stone)] uppercase">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-[10px] font-mono tracking-wider text-[var(--color-yan-stone)] uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-yan-border)]">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[var(--color-yan-surface-elevated)]/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-[var(--color-yan-charcoal)] font-sans">
                    {col.key === 'status' ? (
                      <span className={`px-2.5 py-1 rounded-none text-[10px] font-mono uppercase tracking-widest border ${
                        row[col.key] === 'published' || row[col.key] === 'Publicado'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
                      }`}>
                        {row[col.key] === 'published' ? 'Publicado' : row[col.key] === 'draft' ? 'Borrador' : row[col.key]}
                      </span>
                    ) : col.key === 'title' && editLinkPrefix ? (
                      <Link 
                        href={`${editLinkPrefix}/${row.id}/editar`}
                        className="font-medium hover:text-[var(--color-yan-red)] hover:underline transition-colors"
                      >
                        {row[col.key]}
                      </Link>
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-right text-sm">
                  <div className="flex items-center justify-end space-x-2">
                    {row.slug ? (
                      <Link 
                        href={`/articulo/${row.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[var(--color-yan-stone)] hover:text-[var(--color-yan-charcoal)] border border-transparent hover:border-[var(--color-yan-border)] hover:bg-[var(--color-yan-surface-elevated)] rounded-none transition-colors"
                        title="Previsualizar"
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </Link>
                    ) : (
                      <button className="p-1.5 text-[var(--color-yan-stone)]/40 cursor-not-allowed border border-transparent rounded-none" title="No disponible" disabled>
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                    {editLinkPrefix ? (
                      <Link href={`${editLinkPrefix}/${row.id || i}/editar`} className="p-1.5 text-[var(--color-yan-stone)] hover:text-[var(--color-yan-red)] border border-transparent hover:border-[var(--color-yan-border)] hover:bg-[var(--color-yan-surface-elevated)] rounded-none transition-colors" title="Editar">
                        <Edit className="w-4 h-4" strokeWidth={1.5} />
                      </Link>
                    ) : onEdit ? (
                      <button 
                        onClick={() => onEdit(row)} 
                        className="p-1.5 text-[var(--color-yan-stone)] hover:text-[var(--color-yan-red)] border border-transparent hover:border-[var(--color-yan-border)] hover:bg-[var(--color-yan-surface-elevated)] rounded-none transition-colors" 
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    ) : null}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(row.id || i)} 
                        className="p-1.5 text-[var(--color-yan-stone)] hover:text-[var(--color-yan-red)] border border-transparent hover:border-[var(--color-yan-border)] hover:bg-[var(--color-yan-surface-elevated)] rounded-none transition-colors" 
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-[var(--color-yan-stone)] font-mono text-xs tracking-wider">
                  No hay datos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
