'use server';

import { createClient } from '@/lib/supabase/server';

export async function uploadImage(formData: FormData) {
  try {
    const supabase = await createClient();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || '';
    
    if (!file) return { success: false, error: 'No file provided' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const filePath = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

    console.log(`[STORAGE UPLOAD] Uploading file ${file.name} (size: ${file.size}) to path ${filePath}`);

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[STORAGE UPLOAD ERROR] Supabase upload failed:', error);
      return { success: false, error: error.message || String(error) };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(data.path);

    console.log(`[STORAGE UPLOAD SUCCESS] Public URL: ${publicUrl}`);

    return { success: true, path: data.path, url: publicUrl };
  } catch (e: any) {
    console.error('[STORAGE UPLOAD CATCH] Unexpected error:', e);
    return { success: false, error: e?.message || String(e) };
  }
}

export async function deleteImage(path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage.from('media').remove([path]);
  if (error) throw error;
}

export async function getMediaLibrary(folderPath: string = '') {
  const supabase = await createClient();
  const cleanFolder = folderPath.replace(/^\/+|\/+$/g, '');
  
  const { data, error } = await supabase.storage
    .from('media')
    .list(cleanFolder, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (error) throw error;

  return (data || [])
    .filter((file) => file.name !== '.keep')
    .map((file) => {
      const isFolder = !file.id;
      const path = cleanFolder ? `${cleanFolder}/${file.name}` : file.name;
      const url = isFolder
        ? ''
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

      return {
        name: file.name,
        path,
        url,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        isFolder,
      };
    });
}

export async function createMediaFolder(folderPath: string, folderName: string) {
  try {
    const supabase = await createClient();
    const cleanFolder = folderPath.replace(/^\/+|\/+$/g, '');
    
    // Create folder name slug
    const cleanFolderName = folderName.trim().replace(/[\/\\?%*:|"<>]/g, '-');
    const fullPath = cleanFolder ? `${cleanFolder}/${cleanFolderName}/.keep` : `${cleanFolderName}/.keep`;

    // Upload an empty file to instantiate the folder prefix
    const { error } = await supabase.storage
      .from('media')
      .upload(fullPath, new Blob([''], { type: 'text/plain' }), {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || String(e) };
  }
}

export async function deleteFolder(folderPath: string) {
  const supabase = await createClient();
  const cleanFolder = folderPath.replace(/^\/+|\/+$/g, '');

  // 1. List files inside the directory
  const { data, error } = await supabase.storage.from('media').list(cleanFolder);
  if (error) throw error;

  if (data && data.length > 0) {
    // Delete files directly in this folder
    const filesToDelete = data
      .filter((item) => item.id)
      .map((item) => `${cleanFolder}/${item.name}`);

    if (filesToDelete.length > 0) {
      const { error: removeError } = await supabase.storage.from('media').remove(filesToDelete);
      if (removeError) throw removeError;
    }

    // For any subfolders, we delete their .keep files
    const subfolderKeepFiles = data
      .filter((item) => !item.id)
      .map((item) => `${cleanFolder}/${item.name}/.keep`);

    if (subfolderKeepFiles.length > 0) {
      await supabase.storage.from('media').remove(subfolderKeepFiles);
    }
  }

  // 2. Finally, delete this folder's .keep file
  const { error: finalError } = await supabase.storage.from('media').remove([`${cleanFolder}/.keep`]);
  if (finalError) throw finalError;
}

