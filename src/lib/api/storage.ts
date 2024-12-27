import { supabase } from '../supabase';

/**
 * Upload a file to a temporary location in the storage bucket
 */
export async function uploadTemp(file: File) {
  // Generate a unique temp path
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const tempPath = `temp/${timestamp}-${Math.random().toString(36).slice(2)}.${extension}`;

  // Upload to temp directory
  const { data, error } = await supabase.storage
    .from('community-assets')
    .upload(tempPath, file);

  if (error) throw error;
  return { path: tempPath };
}

/**
 * Move a file from one location to another in the storage bucket
 */
export async function moveFile(source: string, destination: string) {
  // First copy the file
  const { data: copyData, error: copyError } = await supabase.storage
    .from('community-assets')
    .copy(source, destination);

  if (copyError) throw copyError;

  // Then delete the original
  const { error: deleteError } = await supabase.storage
    .from('community-assets')
    .remove([source]);

  if (deleteError) throw deleteError;

  return { path: destination };
}

/**
 * Delete a file from the storage bucket
 */
export async function deleteFile(path: string) {
  const { error } = await supabase.storage
    .from('community-assets')
    .remove([path]);

  if (error) throw error;
}

/**
 * Get a public URL for a file
 */
export async function getPublicUrl(path: string) {
  const { data } = supabase.storage
    .from('community-assets')
    .getPublicUrl(path);

  return data.publicUrl;
}
