"use client";

import { useState } from "react";
import { 
  Database, Table, FileCode, Shield, Code, Layers, 
  HelpCircle, Search, Copy, Check, ChevronRight, Play, Info
} from "lucide-react";
import type { DatabaseSchemaMetadata, ColumnInfo, RelationInfo } from "@/lib/actions/database";

interface DatabaseVisualizerProps {
  initialData: DatabaseSchemaMetadata | null;
  isSchemaPending: boolean;
}

type DBTab = "visualizer" | "tables" | "functions" | "indexes" | "extensions" | "policies";

export default function DatabaseVisualizer({ initialData, isSchemaPending }: DatabaseVisualizerProps) {
  const [activeTab, setActiveTab] = useState<DBTab>("visualizer");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Helper to copy text to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Predefined ER Diagram node coordinates
  const tablePositions: Record<string, { x: number; y: number }> = {
    'article_tags': { x: 30, y: 150 },
    'tags': { x: 30, y: 30 },
    'dashboard_tasks': { x: 320, y: 20 },
    'articles': { x: 320, y: 180 },
    'categories': { x: 640, y: 180 },
    'profiles': { x: 640, y: 440 },
    'pages': { x: 320, y: 550 },
    'site_settings': { x: 30, y: 330 },
    'newsletter_subscribers': { x: 30, y: 550 },
  };

  // Group columns by table name
  const tablesMap: Record<string, ColumnInfo[]> = {};
  if (initialData?.tables) {
    initialData.tables.forEach(col => {
      if (!tablesMap[col.table_name]) {
        tablesMap[col.table_name] = [];
      }
      tablesMap[col.table_name].push(col);
    });
  }

  const tableNames = Object.keys(tablesMap).sort();

  // Filter tables/views based on search
  const filteredTableNames = tableNames.filter(name => 
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // SQL code to create metadata function in Supabase
  const metadataSql = `-- ============================================
-- YAN MAG — Database Schema Metadata Query Function
-- ============================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates a helper function to query schemas, tables, columns,
-- relationships, indexes, functions, and RLS policies.
-- ============================================

CREATE OR REPLACE FUNCTION public.get_schema_metadata()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  tables_json JSONB;
  relations_json JSONB;
  extensions_json JSONB;
  indexes_json JSONB;
  functions_json JSONB;
  policies_json JSONB;
BEGIN
  -- 1. Query columns and tables in the public schema
  SELECT jsonb_agg(t) INTO tables_json
  FROM (
    SELECT 
      c.table_name,
      c.column_name,
      c.data_type,
      c.is_nullable = 'YES' AS is_nullable,
      c.column_default,
      -- Check if column is primary key
      EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = c.table_name
          AND kcu.column_name = c.column_name
      ) AS is_primary_key
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    ORDER BY c.table_name, c.ordinal_position
  ) t;

  -- 2. Query foreign keys / relationships
  SELECT jsonb_agg(r) INTO relations_json
  FROM (
    SELECT
      tc.table_name AS source_table, 
      kcu.column_name AS source_column, 
      ccu.table_name AS target_table,
      ccu.column_name AS target_column
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
  ) r;

  -- 3. Query extensions
  SELECT jsonb_agg(e) INTO extensions_json
  FROM (
    SELECT extname AS name, extversion AS version FROM pg_extension
  ) e;

  -- 4. Query indexes
  SELECT jsonb_agg(i) INTO indexes_json
  FROM (
    SELECT tablename AS table_name, indexname AS index_name, indexdef AS index_definition 
    FROM pg_indexes 
    WHERE schemaname = 'public'
  ) i;

  -- 5. Query custom functions (excluding Postgres internals and metadata helpers)
  SELECT jsonb_agg(f) INTO functions_json
  FROM (
    SELECT 
      routine_name AS name,
      data_type AS return_type
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name NOT IN ('get_schema_metadata', 'get_user_role')
  ) f;

  -- 6. Query Row-Level Security policies
  SELECT jsonb_agg(p) INTO policies_json
  FROM (
    SELECT 
      schemaname AS schema_name,
      tablename AS table_name,
      policyname AS policy_name,
      cmd AS command,
      roles
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
  ) p;

  -- Combine everything into a single JSON response
  result := jsonb_build_object(
    'tables', COALESCE(tables_json, '[]'::jsonb),
    'relations', COALESCE(relations_json, '[]'::jsonb),
    'extensions', COALESCE(extensions_json, '[]'::jsonb),
    'indexes', COALESCE(indexes_json, '[]'::jsonb),
    'functions', COALESCE(functions_json, '[]'::jsonb),
    'policies', COALESCE(policies_json, '[]'::jsonb)
  );

  RETURN result;
END;
$$;`;

  // Draw relationship lines on the ER SVG canvas
  const renderSchemaLines = () => {
    if (!initialData?.relations) return null;
    
    const cardWidth = 240;
    const cardHeight = 150;

    return initialData.relations.map((rel, index) => {
      const sourcePos = tablePositions[rel.source_table];
      const targetPos = tablePositions[rel.target_table];

      // Skip drawing if coordinates are not mapped
      if (!sourcePos || !targetPos) return null;

      // Draw connection lines from closer edges
      const isSourceLeft = sourcePos.x < targetPos.x;
      const x1 = sourcePos.x + (isSourceLeft ? cardWidth : 0);
      const y1 = sourcePos.y + 60;

      const x2 = targetPos.x + (isSourceLeft ? 0 : cardWidth);
      const y2 = targetPos.y + 30;

      const dx = Math.abs(x2 - x1) * 0.4;
      const pathD = `M ${x1} ${y1} C ${x1 + (isSourceLeft ? dx : -dx)} ${y1}, ${x2 + (isSourceLeft ? -dx : dx)} ${y2}, ${x2} ${y2}`;

      const isHovered = selectedTable === rel.source_table || selectedTable === rel.target_table;

      return (
        <path
          key={`${rel.source_table}-${rel.source_column}-${index}`}
          d={pathD}
          fill="none"
          stroke={isHovered ? "var(--color-yan-red)" : "var(--color-yan-border)"}
          strokeWidth={isHovered ? 2.5 : 1.5}
          className="transition-all duration-300"
          markerEnd={isHovered ? "url(#arrow-red)" : "url(#arrow-gray)"}
        />
      );
    });
  };

  return (
    <div className="bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] min-h-[80vh] flex flex-col relative shadow-sm">
      
      {/* Toast popup */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 font-mono text-xs uppercase tracking-widest shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          ✓ {copiedText} copiado al portapapeles
        </div>
      )}

      {/* Main Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface)]">
        <div>
          <h1 className="text-2xl font-display font-semibold text-[var(--color-yan-charcoal)] flex items-center gap-2.5">
            <Database className="w-5.5 h-5.5 text-[var(--color-yan-red)]" strokeWidth={1.5} />
            Administración de Base de Datos
          </h1>
          <p className="text-[var(--color-yan-stone)] text-xs font-mono uppercase tracking-wider mt-1">
            Visualizador de tablas, esquemas, relaciones y políticas de seguridad del portal.
          </p>
        </div>

        {!isSchemaPending && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-yan-stone)] border border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] px-2.5 py-1">
              Esquema: public
            </span>
            <button
              onClick={() => handleCopy(metadataSql, "SQL de Metadata")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-yan-surface-elevated)] hover:bg-[var(--color-yan-border-light)] border border-[var(--color-yan-border)] text-xs font-mono font-semibold uppercase transition-colors text-[var(--color-yan-charcoal)]"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Function SQL
            </button>
          </div>
        )}
      </div>

      {/* Database visualizer structure */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left internal navigation panel */}
        <aside className="w-full md:w-60 border-r border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] flex flex-col shrink-0">
          <div className="p-4 border-b border-[var(--color-yan-border)]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-yan-stone)]">
              Gestión de Base de Datos
            </span>
          </div>

          <nav className="p-2 space-y-1">
            <button
              onClick={() => setActiveTab("visualizer")}
              disabled={isSchemaPending}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-l-[3px] ${
                activeTab === "visualizer"
                  ? "bg-[var(--color-yan-surface)] text-[var(--color-yan-red)] border-[var(--color-yan-red)]"
                  : "text-[var(--color-yan-stone)] border-transparent hover:bg-[var(--color-yan-surface)] hover:text-[var(--color-yan-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <Layers className="w-4 h-4" />
              Schema Visualizer
            </button>

            <button
              onClick={() => setActiveTab("tables")}
              disabled={isSchemaPending}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-l-[3px] ${
                activeTab === "tables"
                  ? "bg-[var(--color-yan-surface)] text-[var(--color-yan-red)] border-[var(--color-yan-red)]"
                  : "text-[var(--color-yan-stone)] border-transparent hover:bg-[var(--color-yan-surface)] hover:text-[var(--color-yan-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <Table className="w-4 h-4" />
              Tablas ({tableNames.length})
            </button>

            <button
              onClick={() => setActiveTab("functions")}
              disabled={isSchemaPending}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-l-[3px] ${
                activeTab === "functions"
                  ? "bg-[var(--color-yan-surface)] text-[var(--color-yan-red)] border-[var(--color-yan-red)]"
                  : "text-[var(--color-yan-stone)] border-transparent hover:bg-[var(--color-yan-surface)] hover:text-[var(--color-yan-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <Code className="w-4 h-4" />
              Funciones ({initialData?.functions?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("indexes")}
              disabled={isSchemaPending}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-l-[3px] ${
                activeTab === "indexes"
                  ? "bg-[var(--color-yan-surface)] text-[var(--color-yan-red)] border-[var(--color-yan-red)]"
                  : "text-[var(--color-yan-stone)] border-transparent hover:bg-[var(--color-yan-surface)] hover:text-[var(--color-yan-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <Layers className="w-4 h-4" />
              Índices ({initialData?.indexes?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("extensions")}
              disabled={isSchemaPending}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-l-[3px] ${
                activeTab === "extensions"
                  ? "bg-[var(--color-yan-surface)] text-[var(--color-yan-red)] border-[var(--color-yan-red)]"
                  : "text-[var(--color-yan-stone)] border-transparent hover:bg-[var(--color-yan-surface)] hover:text-[var(--color-yan-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <Layers className="w-4 h-4" />
              Extensiones ({initialData?.extensions?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("policies")}
              disabled={isSchemaPending}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-all border-l-[3px] ${
                activeTab === "policies"
                  ? "bg-[var(--color-yan-surface)] text-[var(--color-yan-red)] border-[var(--color-yan-red)]"
                  : "text-[var(--color-yan-stone)] border-transparent hover:bg-[var(--color-yan-surface)] hover:text-[var(--color-yan-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <Shield className="w-4 h-4" />
              Políticas RLS ({initialData?.policies?.length || 0})
            </button>
          </nav>
        </aside>

        {/* Content viewer */}
        <div className="flex-1 p-6 bg-[var(--color-yan-surface)] overflow-x-auto min-w-0">
          
          {isSchemaPending ? (
            /* Meta function install guide if DB rpc is missing */
            <div className="max-w-2xl py-6">
              <div className="mb-6 p-6 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 rounded-none flex items-start gap-4">
                <div className="text-2xl mt-0.5">⚠️</div>
                <div>
                  <h3 className="font-display font-semibold text-base mb-1">
                    Pendiente Inicialización del Inspector de Datos
                  </h3>
                  <p className="text-[13px] text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                    Para habilitar el visualizador interactivo, las tablas, relaciones e índices, debes ejecutar un script helper en tu consola de Supabase SQL. Este script expone la metadata estructural de forma segura al panel administrativo.
                  </p>
                </div>
              </div>

              <div className="border border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] overflow-hidden">
                <div className="p-3 border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface)] flex justify-between items-center">
                  <span className="text-[10px] font-mono text-[var(--color-yan-stone)] uppercase tracking-wider">
                    add_schema_metadata_function.sql
                  </span>
                  <button
                    onClick={() => handleCopy(metadataSql, "SQL de Metadata")}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-yan-charcoal)] text-white text-[10px] font-mono uppercase tracking-widest hover:bg-[var(--color-yan-red)] transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar Código
                  </button>
                </div>
                <div className="p-4 overflow-x-auto max-h-80">
                  <pre className="text-[11px] font-mono text-[var(--color-yan-stone)] leading-relaxed">
                    {metadataSql}
                  </pre>
                </div>
              </div>
              
              <div className="mt-5 text-xs text-[var(--color-yan-stone)] font-mono leading-relaxed bg-[var(--color-yan-surface-elevated)] p-4 border border-[var(--color-yan-border)]">
                <p className="font-bold text-[var(--color-yan-charcoal)] mb-1">Pasos:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Haz clic en el botón de "Copiar Código".</li>
                  <li>Ve a tu panel de control de Supabase en el navegador.</li>
                  <li>Dirígete a la sección <strong>SQL Editor</strong> en el menú lateral.</li>
                  <li>Crea una nueva consulta vacía (New Query), pega el SQL y presiona <strong>Run</strong>.</li>
                  <li>Regresa a esta página y refresca tu navegador. ¡El visualizador interactivo estará activo!</li>
                </ol>
              </div>
            </div>
          ) : (
            /* Main Content active panels */
            <>
              {/* Tab 1: Interactive Schema Visualizer */}
              {activeTab === "visualizer" && initialData && (
                <div className="relative min-w-[950px] min-h-[700px] border border-[var(--color-yan-border-light)] bg-neutral-900/5 dark:bg-neutral-950/20 overflow-hidden select-none p-6">
                  
                  {/* SVG background line overlays */}
                  <svg className="absolute inset-0 pointer-events-none w-full h-full">
                    <defs>
                      <marker id="arrow-gray" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--color-yan-border)" />
                      </marker>
                      <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--color-yan-red)" />
                      </marker>
                    </defs>
                    {renderSchemaLines()}
                  </svg>

                  {/* Render Table Cards */}
                  {tableNames.map((tableName, idx) => {
                    const columns = tablesMap[tableName];
                    const pos = tablePositions[tableName] || { x: 100 + (idx % 3) * 300, y: 100 + Math.floor(idx / 3) * 200 };
                    const isSelected = selectedTable === tableName;

                    return (
                      <div
                        key={tableName}
                        style={{ left: pos.x, top: pos.y }}
                        onMouseEnter={() => setSelectedTable(tableName)}
                        onMouseLeave={() => setSelectedTable(null)}
                        className={`absolute w-60 border bg-[var(--color-yan-surface)] shadow-md transition-all duration-300 z-10 ${
                          isSelected 
                            ? "border-[var(--color-yan-red)] shadow-lg scale-[1.02]" 
                            : "border-[var(--color-yan-border)] hover:border-[var(--color-yan-stone)]"
                        }`}
                      >
                        {/* Table Card Title */}
                        <div className={`px-3.5 py-2 border-b font-mono font-bold flex items-center justify-between text-[11px] uppercase tracking-wider ${
                          isSelected ? "bg-[var(--color-yan-red)]/10 text-[var(--color-yan-red)] border-[var(--color-yan-red)]/20" : "bg-[var(--color-yan-surface-elevated)] text-[var(--color-yan-charcoal)] border-[var(--color-yan-border)]"
                        }`}>
                          <span className="flex items-center gap-1.5 truncate">
                            <Table className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                            {tableName}
                          </span>
                          <span className="text-[9px] text-[var(--color-yan-stone)] shrink-0 font-normal lowercase">
                            {columns.length} cols
                          </span>
                        </div>

                        {/* Table Columns List */}
                        <div className="py-1 divide-y divide-[var(--color-yan-border-light)] max-h-56 overflow-y-auto">
                          {columns.map(col => {
                            // Check if column is a foreign key
                            const isFk = initialData.relations.some(r => r.source_table === tableName && r.source_column === col.column_name);

                            return (
                              <div key={col.column_name} className="px-3 py-1 flex items-center justify-between gap-4 font-mono text-[10px] hover:bg-[var(--color-yan-surface-elevated)]">
                                <span className={`flex items-center gap-1 truncate ${col.is_primary_key ? "font-bold text-[var(--color-yan-charcoal)]" : "text-[var(--color-yan-charcoal)]/80"}`}>
                                  {col.is_primary_key ? (
                                    <span className="text-amber-500 font-bold" title="Primary Key">🔑</span>
                                  ) : isFk ? (
                                    <span className="text-sky-500 font-bold" title="Foreign Key">🔗</span>
                                  ) : (
                                    <span className="text-[var(--color-yan-stone)]/50">•</span>
                                  )}
                                  <span className="truncate">{col.column_name}</span>
                                </span>
                                <span className="text-[var(--color-yan-stone)] shrink-0 text-[9px] lowercase">
                                  {col.data_type}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  
                </div>
              )}

              {/* Tab 2: Tables Inspector */}
              {activeTab === "tables" && initialData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left list of tables */}
                  <div className="lg:col-span-1 border border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] p-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[var(--color-yan-stone)]" />
                      <input
                        type="text"
                        placeholder="Buscar tabla..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] focus:border-[var(--color-yan-red)] text-xs outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1 divide-y divide-[var(--color-yan-border-light)]">
                      {filteredTableNames.map(name => (
                        <button
                          key={name}
                          onClick={() => setSelectedTable(name)}
                          className={`w-full text-left px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider flex items-center justify-between ${
                            selectedTable === name
                              ? "bg-[var(--color-yan-surface)] text-[var(--color-yan-red)] font-bold border-l-2 border-l-[var(--color-yan-red)]"
                              : "text-[var(--color-yan-stone)] hover:bg-[var(--color-yan-surface)] hover:text-[var(--color-yan-charcoal)]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Table className="w-3.5 h-3.5" />
                            {name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-[var(--color-yan-stone)]" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right columns table detailed view */}
                  <div className="lg:col-span-2 border border-[var(--color-yan-border)] p-6 bg-[var(--color-yan-surface)]">
                    {selectedTable && tablesMap[selectedTable] ? (
                      <div>
                        <h3 className="font-display font-semibold text-lg text-[var(--color-yan-charcoal)] pb-3 border-b border-[var(--color-yan-border)] mb-5 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Table className="w-4 h-4 text-[var(--color-yan-red)]" />
                            Tabla: {selectedTable}
                          </span>
                          <span className="text-xs font-mono font-normal text-[var(--color-yan-stone)] lowercase">
                            {tablesMap[selectedTable].length} columnas creadas
                          </span>
                        </h3>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs font-mono">
                            <thead>
                              <tr className="border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)]">
                                <th className="p-3 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">Nombre</th>
                                <th className="p-3 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">Tipo</th>
                                <th className="p-3 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">Nullable</th>
                                <th className="p-3 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">Default</th>
                                <th className="p-3 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">PK</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-yan-border-light)]">
                              {tablesMap[selectedTable].map(col => (
                                <tr key={col.column_name} className="hover:bg-[var(--color-yan-surface-elevated)]">
                                  <td className="p-3 font-bold text-[var(--color-yan-charcoal)]">{col.column_name}</td>
                                  <td className="p-3 text-[var(--color-yan-stone)]">{col.data_type}</td>
                                  <td className="p-3">{col.is_nullable ? "YES" : "NO"}</td>
                                  <td className="p-3 text-[var(--color-yan-stone)] truncate max-w-[150px]">{col.column_default || "-"}</td>
                                  <td className="p-3">{col.is_primary_key ? "🔑" : "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center text-[var(--color-yan-stone)] font-mono text-xs flex flex-col items-center justify-center p-6">
                        <Info className="w-10 h-10 text-[var(--color-yan-stone)]/50 mb-3" />
                        <p>Selecciona una tabla del panel izquierdo para examinar su estructura de datos.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Tab 3: Database RPC Functions */}
              {activeTab === "functions" && initialData && (
                <div className="border border-[var(--color-yan-border)] p-6 bg-[var(--color-yan-surface)]">
                  <h3 className="font-display font-semibold text-base text-[var(--color-yan-charcoal)] pb-3 border-b border-[var(--color-yan-border)] mb-5">
                    Funciones y Procedimientos (RPC)
                  </h3>
                  
                  {initialData.functions && initialData.functions.length > 0 ? (
                    <div className="space-y-4">
                      {initialData.functions.map(fn => (
                        <div key={fn.name} className="border border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] p-4 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                          <div>
                            <span className="text-xs font-mono font-bold text-[var(--color-yan-charcoal)] flex items-center gap-1.5">
                              <Play className="w-3 h-3 text-sky-500 fill-sky-500" />
                              {fn.name}()
                            </span>
                            <span className="text-[10px] font-mono text-[var(--color-yan-stone)] block mt-1">
                              Returns: {fn.return_type}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono uppercase tracking-widest bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] px-2 py-0.5 font-bold text-[var(--color-yan-stone)]">
                            Security Definer
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-[var(--color-yan-stone)] font-mono text-xs">No hay funciones personalizadas en la base de datos.</p>
                  )}
                </div>
              )}

              {/* Tab 4: Database Indexes */}
              {activeTab === "indexes" && initialData && (
                <div className="border border-[var(--color-yan-border)] p-6 bg-[var(--color-yan-surface)]">
                  <h3 className="font-display font-semibold text-base text-[var(--color-yan-charcoal)] pb-3 border-b border-[var(--color-yan-border)] mb-5">
                    Índices de Base de Datos
                  </h3>

                  {initialData.indexes && initialData.indexes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="border-b border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)]">
                            <th className="p-3 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">Tabla</th>
                            <th className="p-3 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">Índice</th>
                            <th className="p-3 font-semibold uppercase text-[10px] text-[var(--color-yan-stone)] tracking-wider">Definición SQL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-yan-border-light)]">
                          {initialData.indexes.map(idx => (
                            <tr key={idx.index_name} className="hover:bg-[var(--color-yan-surface-elevated)]">
                              <td className="p-3 font-bold text-[var(--color-yan-charcoal)]">{idx.table_name}</td>
                              <td className="p-3 text-[var(--color-yan-stone)]">{idx.index_name}</td>
                              <td className="p-3 text-[var(--color-yan-stone)] font-mono text-[10px]">{idx.index_definition}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-[var(--color-yan-stone)] font-mono text-xs">No hay índices creados en la base de datos.</p>
                  )}
                </div>
              )}

              {/* Tab 5: Database Extensions */}
              {activeTab === "extensions" && initialData && (
                <div className="border border-[var(--color-yan-border)] p-6 bg-[var(--color-yan-surface)]">
                  <h3 className="font-display font-semibold text-base text-[var(--color-yan-charcoal)] pb-3 border-b border-[var(--color-yan-border)] mb-5">
                    Extensiones PostgreSQL Habilitadas
                  </h3>

                  {initialData.extensions && initialData.extensions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {initialData.extensions.map(ext => (
                        <div key={ext.name} className="border border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] p-4 relative flex flex-col justify-between h-24">
                          <span className="text-xs font-mono font-bold text-[var(--color-yan-charcoal)] uppercase tracking-wider">
                            {ext.name}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--color-yan-stone)] block mt-1">
                            Versión: {ext.version}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-[var(--color-yan-stone)] font-mono text-xs">No hay extensiones habilitadas.</p>
                  )}
                </div>
              )}

              {/* Tab 6: Database Security RLS Policies */}
              {activeTab === "policies" && initialData && (
                <div className="border border-[var(--color-yan-border)] p-6 bg-[var(--color-yan-surface)]">
                  <h3 className="font-display font-semibold text-base text-[var(--color-yan-charcoal)] pb-3 border-b border-[var(--color-yan-border)] mb-5">
                    Políticas de Seguridad de Fila (Row-Level Security)
                  </h3>

                  {initialData.policies && initialData.policies.length > 0 ? (
                    <div className="space-y-4">
                      {initialData.policies.map((pol, index) => (
                        <div key={index} className="border border-[var(--color-yan-border)] bg-[var(--color-yan-surface-elevated)] p-4 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                          <div>
                            <span className="text-[10px] font-mono text-[var(--color-yan-stone)] uppercase tracking-wider block mb-1">
                              Tabla/Bucket: {pol.schema_name}.{pol.table_name}
                            </span>
                            <span className="text-xs font-mono font-bold text-[var(--color-yan-charcoal)]">
                              {pol.policy_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono uppercase tracking-widest bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] px-2 py-0.5 font-bold text-[var(--color-yan-red)]">
                              {pol.command}
                            </span>
                            <span className="text-[9px] font-mono uppercase tracking-widest bg-[var(--color-yan-surface)] border border-[var(--color-yan-border)] px-2 py-0.5 font-bold text-[var(--color-yan-stone)]">
                              Roles: {pol.roles.join(", ")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-[var(--color-yan-stone)] font-mono text-xs">No hay políticas de seguridad RLS configuradas.</p>
                  )}
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
