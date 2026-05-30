'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CategoryFormData } from '@/lib/types';

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function createCategory(formData: CategoryFormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert(formData)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/admin/categorias');
  return data;
}

export async function updateCategory(id: string, formData: Partial<CategoryFormData>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .update(formData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/admin/categorias');
  return data;
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/admin/categorias');
}
