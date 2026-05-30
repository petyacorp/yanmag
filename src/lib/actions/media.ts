'use server';

import { createClient } from '@/lib/supabase/server';

export async function uploadImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get('file') as File;
  
  if (!file) throw new Error('No file provided');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `articles/${fileName}`;

  const { data, error } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(data.path);

  return { path: data.path, url: publicUrl };
}

export async function deleteImage(path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from('media').remove([path]);
  if (error) throw error;
}

export async function getMediaLibrary() {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('media')
    .list('articles', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) throw error;

  return (data || []).map((file) => ({
    name: file.name,
    path: `articles/${file.name}`,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/articles/${file.name}`,
    size: file.metadata?.size || 0,
    created_at: file.created_at,
  }));
}
