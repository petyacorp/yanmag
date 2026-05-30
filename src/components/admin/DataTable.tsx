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
}

export default function DataTable({ columns, data, editLinkPrefix }: DataTableProps) {
  return (
    <div className="bg-yan-surface border border-yan-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-yan-surface-elevated border-b border-yan-border">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-xs font-semibold text-yan-muted uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-xs font-semibold text-yan-muted uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yan-border">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-yan-surface-elevated/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-foreground">
                    {col.key === 'status' ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        row[col.key] === 'Publicado' 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {row[col.key]}
                      </span>
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-right text-sm">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-1.5 text-yan-muted hover:text-foreground rounded transition-colors" title="Ver">
                      <Eye className="w-4 h-4" />
                    </button>
                    {editLinkPrefix && (
                      <Link href={`${editLinkPrefix}/${row.id || i}/editar`} className="p-1.5 text-yan-muted hover:text-yan-accent rounded transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                    <button className="p-1.5 text-yan-muted hover:text-red-500 rounded transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-yan-muted">
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
