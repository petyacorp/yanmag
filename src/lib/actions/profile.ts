'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(profileData: { full_name: string; avatar_url: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  // 1. Update the database profile
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: profileData.full_name,
      avatar_url: profileData.avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile in DB:', error);
    throw error;
  }

  // 2. Sync with Supabase Auth metadata so that the JWT/session is updated immediately
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: profileData.full_name,
      avatar_url: profileData.avatar_url || null,
      name: profileData.full_name,
      picture: profileData.avatar_url || null,
    }
  });

  if (authError) {
    console.error('Warning: Error updating auth metadata:', authError);
    // We don't fail the action if DB write was successful, but logging it is important
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return data;
}

