'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { DashboardTask, DashboardTaskStatus } from '@/lib/types';

export async function getDashboardTasks(): Promise<DashboardTask[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dashboard_tasks')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching dashboard tasks:', error.message);
    throw error;
  }
  return data || [];
}

export async function createDashboardTask(title: string): Promise<DashboardTask> {
  if (!title || title.trim() === '') {
    throw new Error('El título de la tarea no puede estar vacío');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const creator = user?.user_metadata?.full_name || user?.email || 'Sistema';

  const { data, error } = await supabase
    .from('dashboard_tasks')
    .insert({ 
      title: title.trim(), 
      status: 'pending',
      created_by: creator
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/admin');
  return data;
}

export async function updateDashboardTaskStatus(
  id: string,
  status: DashboardTaskStatus
): Promise<DashboardTask> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dashboard_tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/admin');
  return data;
}

export async function deleteDashboardTask(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('dashboard_tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin');
}
