'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'mention' | 'task_completed' | 'system';
  related_id?: string;
  is_read: boolean;
  created_at: string;
  created_by?: string;
}

/**
 * Fetch notifications for the currently logged-in user
 */
export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error.message);
    return [];
  }

  return data || [];
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', user.id); // RLS redundancy for safety

  if (error) {
    console.error('Error marking notification as read:', error.message);
    throw error;
  }

  revalidatePath('/admin');
}

/**
 * Mark all notifications for the current user as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error.message);
    throw error;
  }

  revalidatePath('/admin');
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting notification:', error.message);
    throw error;
  }

  revalidatePath('/admin');
}

/**
 * Helper to create a notification (to be used from other Server Actions)
 */
export async function createNotification(
  userId: string,
  message: string,
  type: 'mention' | 'task_completed' | 'system',
  relatedId?: string
): Promise<Notification> {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const creatorName = currentUser?.user_metadata?.full_name || currentUser?.email || 'Sistema';

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      message,
      type,
      related_id: relatedId,
      created_by: creatorName,
      is_read: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error.message);
    throw error;
  }

  revalidatePath('/admin');
  return data;
}
