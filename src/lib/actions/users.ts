'use server';

import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

/**
 * Fetch all profiles with admin or editor role for mentions
 */
export async function getAdminUsers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'editor'])
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching admin/editor users:', error.message);
    return [];
  }

  return data || [];
}
