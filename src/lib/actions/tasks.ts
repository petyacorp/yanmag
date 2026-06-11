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

      // Fetch all profiles to notify all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) throw profilesError;

      if (profiles && profiles.length > 0) {
        const titleLower = task.title.toLowerCase();
        for (const profile of profiles) {
          // Skip the user who completed the task
          if (user && profile.id === user.id) continue;

          if (profile.id === task.creator_id) {
            // Task creator
            await createNotification(
              profile.id,
              `${completerName} ha completado tu tarea: "${task.title}"`,
              'task_completed',
              id
            );
          } else {
            // Check if this profile was mentioned in the task
            const emailPrefix = profile.email.split('@')[0].toLowerCase();
            const fullName = profile.full_name?.toLowerCase().trim();
            const mentionEmail = `@${emailPrefix}`;
            const mentionName = fullName ? `@${fullName}` : null;
            const isMentioned = titleLower.includes(mentionEmail) || (mentionName && titleLower.includes(mentionName));

            if (isMentioned) {
              await createNotification(
                profile.id,
                `La tarea en la que fuiste mencionado "${task.title}" fue marcada como HECHA por ${completerName}.`,
                'task_completed',
                id
              );
            } else {
              // Any other user
              await createNotification(
                profile.id,
                `${completerName} ha completado la tarea: "${task.title}"`,
                'task_completed',
                id
              );
            }
          }
        }
      }
    } catch (notifError) {
      console.error('Failed to send task completion notifications to all users:', notifError);
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

