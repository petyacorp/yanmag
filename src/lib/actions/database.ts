'use server';

import { createClient } from '@/lib/supabase/server';

export interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
  is_primary_key: boolean;
}

export interface RelationInfo {
  source_table: string;
  source_column: string;
  target_table: string;
  target_column: string;
}

export interface ExtensionInfo {
  name: string;
  version: string;
}

export interface IndexInfo {
  table_name: string;
  index_name: string;
  index_definition: string;
}

export interface FunctionInfo {
  name: string;
  return_type: string;
}

export interface PolicyInfo {
  schema_name: string;
  table_name: string;
  policy_name: string;
  command: string;
  roles: string[];
}

export interface DatabaseSchemaMetadata {
  tables: ColumnInfo[];
  relations: RelationInfo[];
  extensions: ExtensionInfo[];
  indexes: IndexInfo[];
  functions: FunctionInfo[];
  policies: PolicyInfo[];
}

export async function getDatabaseSchema(): Promise<DatabaseSchemaMetadata> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_schema_metadata');
  
  if (error) {
    console.error('Error fetching schema metadata:', error.message);
    throw error;
  }
  
  return data as DatabaseSchemaMetadata;
}
