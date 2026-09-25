import { supabase, isSupabaseConfigured } from './supabase.js';

export const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25 MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

/**
 * Validate media file format, mime type, extension, and file size.
 * Returns { valid: boolean, error?: string, mediaType: 'image' | 'video' }
 */
export function validateMediaFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'Selected file is empty or corrupted.' };
  }

  const name = (file.name || '').toLowerCase();
  const mime = (file.type || '').toLowerCase();

  const isImageMime = ALLOWED_IMAGE_TYPES.includes(mime) || mime.startsWith('image/');
  const isVideoMime = ALLOWED_VIDEO_TYPES.includes(mime) || mime.startsWith('video/');

  const isImageExt = ALLOWED_IMAGE_EXTS.some(ext => name.endsWith(ext));
  const isVideoExt = ALLOWED_VIDEO_EXTS.some(ext => name.endsWith(ext));

  if (isImageMime || isImageExt) {
    if (file.size > MAX_IMAGE_SIZE) {
      return { 
        valid: false, 
        error: `Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 25 MB.` 
      };
    }
    return { valid: true, mediaType: 'image' };
  }

  if (isVideoMime || isVideoExt) {
    if (file.size > MAX_VIDEO_SIZE) {
      return { 
        valid: false, 
        error: `Video file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 100 MB.` 
      };
    }
    return { valid: true, mediaType: 'video' };
  }

  return { 
    valid: false, 
    error: 'Unsupported file format. Please select an image (JPG, PNG, WebP) or video (MP4, WebM, MOV).' 
  };
}

/**
 * Generate preview data URL / Object URL for local rendering before upload.
 */
export async function getMediaPreview(file) {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (validation.mediaType === 'image') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read image preview.'));
      reader.readAsDataURL(file);
    });
  } else {
    return URL.createObjectURL(file);
  }
}

/**
 * Upload an image or video file to Supabase Storage.
 * Safe fallback to object URL / base64 if Supabase is offline or unconfigured.
 */
export async function uploadMedia(file, bucket = 'gallery') {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const mediaType = validation.mediaType;
  const preview = await getMediaPreview(file);
  const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : (mediaType === 'image' ? 'jpg' : 'mp4');
  const cleanName = (file.name || 'media').replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  const folder = mediaType === 'image' ? 'images' : 'videos';
  const storagePath = `${folder}/${uniqueId}-${cleanName}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          contentType: file.type || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4'),
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.warn(`Supabase Storage upload warning (${bucket}/${storagePath}):`, error.message || error);
        return {
          url: preview,
          fileUrl: preview,
          storagePath: null,
          mediaType,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4'),
          preview
        };
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      const publicUrl = urlData?.publicUrl || preview;

      return {
        url: publicUrl,
        fileUrl: publicUrl,
        storagePath: data.path,
        mediaType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4'),
        preview
      };
    } catch (e) {
      console.warn('Supabase media upload error, using local preview fallback:', e);
      return {
        url: preview,
        fileUrl: preview,
        storagePath: null,
        mediaType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4'),
        preview
      };
    }
  }

  return {
    url: preview,
    fileUrl: preview,
    storagePath: null,
    mediaType,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4'),
    preview
  };
}

/**
 * Delete a file from Supabase Storage bucket.
 */
export async function deleteStorageFile(bucket, storagePath) {
  if (!storagePath || !isSupabaseConfigured || !supabase) return true;
  try {
    const { error } = await supabase.storage.from(bucket).remove([storagePath]);
    if (error) {
      console.warn(`Storage delete warning (${bucket}/${storagePath}):`, error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`Storage delete exception (${bucket}/${storagePath}):`, e);
    return false;
  }
}
