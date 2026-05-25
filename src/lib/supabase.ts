import { createClient } from '@supabase/supabase-js';

// Read values from Vite metadata environmental variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Clean setup with warning diagnostics
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase configurations are missing. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environmental parameters.'
  );
}

// Generate the operational client instance
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

/**
 * UTILS - UPLOAD IMAGES
 * Uploads local or source base64 image streams directly to your configured Supabase Storage bucket 'user-images'
 */
export async function uploadImage(file: File | Blob, pathName: string): Promise<string> {
  if (!supabaseUrl || !supabaseAnonKey) {
     throw new Error('Supabase credentials not configured in environmental parameters.');
  }

  const { data, error } = await supabase.storage
    .from('user-images')
    .upload(pathName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  // Generate public access URL
  const { data: publicUrlData } = supabase.storage
    .from('user-images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
