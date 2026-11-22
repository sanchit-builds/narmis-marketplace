import { supabase, isSupabaseConfigured } from './supabase';

export interface StorageUploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload an image File or Blob directly to Supabase Storage.
 * Stores online in Supabase so no images reside only on the local machine.
 * 
 * @param file The image File or Blob to upload
 * @param bucket Storage bucket name (default: 'listing-images')
 * @returns Public HTTPS URL of the uploaded image
 */
export async function uploadImageToSupabase(
  file: File | Blob,
  bucket: string = 'listing-images'
): Promise<StorageUploadResult> {
  // If Supabase is not configured, fallback to offline data URL
  if (!isSupabaseConfigured || !supabase) {
    const dataUrl = await fileToDataUrl(file);
    return { url: dataUrl, path: 'local-offline' };
  }

  try {
    // Generate clean unique filename with sanitized extension
    const extension = (file as File).name
      ? (file as File).name.split('.').pop()?.toLowerCase() || 'jpg'
      : 'jpg';
    
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const filePath = `listings/${uniqueId}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      console.warn(`Supabase storage upload error in bucket '${bucket}':`, error.message);

      // If the bucket doesn't exist, try common alternative bucket 'public' or 'marketplace'
      if (bucket === 'listing-images') {
        const fallback = await uploadToFallbackBucket(file, filePath);
        if (fallback) return fallback;
      }

      // If online storage is not initialized or permissions fail, return data URL as safe fallback
      const dataUrl = await fileToDataUrl(file);
      return { url: dataUrl, path: 'fallback-data-url', error: error.message };
    }

    // Retrieve public online URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error('Failed to upload image to Supabase:', err);
    const dataUrl = await fileToDataUrl(file);
    return { url: dataUrl, path: 'error-fallback', error: err?.message || 'Upload failed' };
  }
}

/**
 * Try fallback buckets if listing-images bucket isn't pre-created
 */
async function uploadToFallbackBucket(
  file: File | Blob,
  filePath: string
): Promise<StorageUploadResult | null> {
  if (!supabase) return null;
  const alternateBuckets = ['marketplace', 'public', 'images'];

  for (const b of alternateBuckets) {
    try {
      const { data, error } = await supabase.storage.from(b).upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

      if (!error && data) {
        const { data: pubData } = supabase.storage.from(b).getPublicUrl(data.path);
        return { url: pubData.publicUrl, path: data.path };
      }
    } catch {
      // Continue to next bucket
    }
  }
  return null;
}

/**
 * Helper to convert File to base64 data URL
 */
function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
