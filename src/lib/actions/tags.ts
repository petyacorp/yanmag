'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getTags() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name_es', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createTag(name_es: string, name_en?: string) {
  const supabase = await createClient();
  const slug = name_es
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const { data, error } = await supabase
    .from('tags')
    .insert({ slug, name_es, name_en })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/admin/articulos');
  return data;
}

export async function updateTag(id: string, name_es: string, name_en?: string) {
  const supabase = await createClient();
  const slug = name_es
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const { data, error } = await supabase
    .from('tags')
    .update({ slug, name_es, name_en })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/admin/articulos');
  revalidatePath('/admin/etiquetas');
  return data;
}

export async function deleteTag(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('tags').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/articulos');
  revalidatePath('/admin/etiquetas');
}
