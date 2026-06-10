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
  const creatorName = user?.user_metadata?.full_name || user?.email || 'Sistema';

  // Insert the task
  const { data, error } = await supabase
    .from('dashboard_tasks')
    .insert({ 
      title: title.trim(), 
      status: 'pending',
      created_by: creatorName,
      creator_id: user?.id || null
    })
    .select()
    .single();

  if (error) throw error;

  // Parse @mentions and notify mentioned users
  try {
    const { getAdminUsers } = await import('./users');
    const { createNotification } = await import('./notifications');
    const adminUsers = await getAdminUsers();
    
    const titleLower = title.toLowerCase();
    for (const admin of adminUsers) {
      // Don't notify the creator
      if (user && admin.id === user.id) continue;

      const emailPrefix = admin.email.split('@')[0].toLowerCase();
      const fullName = admin.full_name?.toLowerCase().trim();
      const mentionEmail = `@${emailPrefix}`;
      const mentionName = fullName ? `@${fullName}` : null;

      if (titleLower.includes(mentionEmail) || (mentionName && titleLower.includes(mentionName))) {
        await createNotification(
          admin.id,
          `${creatorName} te ha mencionado en la tarea: "${title.trim()}"`,
          'mention',
          data.id
        );
      }
    }
  } catch (notifError) {
    console.error('Failed to process task mentions notifications:', notifError);
    // Do not fail task creation if notification fails
  }

  revalidatePath('/admin');
  return data;
}

export async function updateDashboardTaskStatus(
  id: string,
  status: DashboardTaskStatus
): Promise<DashboardTask> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the task before update to know creator and original status
  const { data: task, error: fetchError } = await supabase
    .from('dashboard_tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from('dashboard_tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // If status changes to completed, send notifications
  if (status === 'completed' && task.status !== 'completed') {
    try {
      const completerName = user?.user_metadata?.full_name || user?.email || 'Sistema';
      const { createNotification } = await import('./notifications');
      const { getAdminUsers } = await import('./users');

      // 1. Notify creator if they didn't complete it themselves
      if (task.creator_id && (!user || task.creator_id !== user.id)) {
        await createNotification(
          task.creator_id,
          `${completerName} ha completado tu tarea: "${task.title}"`,
          'task_completed',
          id
        );
      }

      // 2. Notify other mentioned users in the task
      const adminUsers = await getAdminUsers();
      const titleLower = task.title.toLowerCase();
      for (const admin of adminUsers) {
        // Skip creator (already handled) and completer
        if (admin.id === task.creator_id || (user && admin.id === user.id)) continue;

        const emailPrefix = admin.email.split('@')[0].toLowerCase();
        const fullName = admin.full_name?.toLowerCase().trim();
        const mentionEmail = `@${emailPrefix}`;
        const mentionName = fullName ? `@${fullName}` : null;

        if (titleLower.includes(mentionEmail) || (mentionName && titleLower.includes(mentionName))) {
          await createNotification(
            admin.id,
            `La tarea en la que fuiste mencionado "${task.title}" fue marcada como HECHA por ${completerName}.`,
            'task_completed',
            id
          );
        }
      }
    } catch (notifError) {
      console.error('Failed to send task completion notifications:', notifError);
    }
  }

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

