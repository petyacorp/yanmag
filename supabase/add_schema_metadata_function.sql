-- ============================================
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
$$;
