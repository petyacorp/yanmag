'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { DashboardTask, DashboardTaskStatus, TaskComment } from '@/lib/types';

export async function getDashboardTasks(): Promise<DashboardTask[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('dashboard_tasks')
    .select(`
      *,
      task_comments(count)
    `)
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

  // Parse @mentions and notify mentioned users & creator
  try {
    const { getAdminUsers } = await import('./users');
    const { createNotification } = await import('./notifications');
    const adminUsers = await getAdminUsers();
    
    const titleLower = title.toLowerCase();
    const mentionedUsers: string[] = [];
    const mentionedNames: string[] = [];
    const otherMentionedNames: string[] = [];

    for (const admin of adminUsers) {
      const emailPrefix = admin.email.split('@')[0].toLowerCase();
      const fullName = admin.full_name?.toLowerCase().trim();
      const mentionEmail = `@${emailPrefix}`;
      const mentionName = fullName ? `@${fullName}` : null;

      if (titleLower.includes(mentionEmail) || (mentionName && titleLower.includes(mentionName))) {
        mentionedUsers.push(admin.id);
        const nameToUse = admin.full_name || emailPrefix;
        mentionedNames.push(nameToUse);

        const isSelf = user && admin.id === user.id;
        if (isSelf) {
          await createNotification(
            admin.id,
            `Te has mencionado en la tarea: "${title.trim()}"`,
            'mention',
            data.id
          );
        } else {
          otherMentionedNames.push(nameToUse);
          await createNotification(
            admin.id,
            `${creatorName} te ha mencionado en la tarea: "${title.trim()}"`,
            'mention',
            data.id
          );
        }
      }
    }

    // Also notify the creator of the task if they mentioned someone else
    if (user && otherMentionedNames.length > 0) {
      const namesList = otherMentionedNames.join(', ');
      await createNotification(
        user.id,
        `Has mencionado a ${namesList} en la tarea: "${title.trim()}"`,
        'mention',
        data.id
      );
    }
  } catch (notifError) {
    console.error('Failed to process task mentions notifications:', notifError);
  }

  // Notify all users about task creation
  try {
    const { createNotification } = await import('./notifications');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (!profilesError && profiles) {
      for (const profile of profiles) {
        const isSelf = user && profile.id === user.id;
        await createNotification(
          profile.id,
          isSelf 
            ? `Has creado la tarea: "${title.trim()}"`
            : `${creatorName} ha creado la tarea: "${title.trim()}"`,
          'system',
          data.id
        );
      }
    }
  } catch (createNotifError) {
    console.error('Failed to send task creation notifications to all users:', createNotifError);
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

  // If status changes, send notifications to all users
  if (status !== task.status) {
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
          const isSelf = user && profile.id === user.id;

          if (status === 'completed') {
            if (profile.id === task.creator_id) {
              // Task creator
              await createNotification(
                profile.id,
                isSelf 
                  ? `Has completado tu tarea: "${task.title}"`
                  : `${completerName} ha completado tu tarea: "${task.title}"`,
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
                  isSelf
                    ? `Completaste la tarea en la que fuiste mencionado: "${task.title}"`
                    : `La tarea en la que fuiste mencionado "${task.title}" fue marcada como HECHA por ${completerName}.`,
                  'task_completed',
                  id
                );
              } else {
                // Any other user
                await createNotification(
                  profile.id,
                  isSelf
                    ? `Has completado la tarea: "${task.title}"`
                    : `${completerName} ha completado la tarea: "${task.title}"`,
                  'task_completed',
                  id
                );
              }
            }
          } else if (status === 'in_progress') {
            await createNotification(
              profile.id,
              isSelf
                ? `Has comenzado a trabajar en la tarea: "${task.title}"`
                : `${completerName} ha comenzado a trabajar en la tarea: "${task.title}"`,
              'system',
              id
            );
          }
        }
      }
    } catch (notifError) {
      console.error('Failed to send task status change notifications to all users:', notifError);
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

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('task_comments')
    .select('*, profile:profiles(*)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching task comments:', error.message);
    throw error;
  }
  return data || [];
}

export async function createTaskComment(taskId: string, content: string): Promise<TaskComment> {
  if (!content || content.trim() === '') {
    throw new Error('El comentario no puede estar vacío');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const creatorName = user.user_metadata?.full_name || user.email || 'Sistema';

  const { data, error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      user_id: user.id,
      content: content.trim(),
      created_by: creatorName
    })
    .select('*, profile:profiles(*)')
    .single();

  if (error) {
    console.error('Error creating task comment:', error.message);
    throw error;
  }

  revalidatePath('/admin');
  return data;
}

export async function deleteTaskComment(commentId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('task_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting task comment:', error.message);
    throw error;
  }

  revalidatePath('/admin');
}

