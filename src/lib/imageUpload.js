import { supabase, isSupabaseConfigured } from './supabase.js';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_DIM = 1200; // Max width/height for resizing

/**
 * Compress and resize an image File to a WebP Blob.
 * Returns { blob, dataUrl } where blob is the compressed file
 * and dataUrl is a preview string.
 */
function compressImage(file, maxDim = MAX_DIM) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPG, PNG, WebP, etc.)'));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('Image is too large. Maximum allowed size is 25 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const directUrl = e.target.result;
      const img = new window.Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let dataUrl = canvas.toDataURL('image/webp', 0.85);
          if (!dataUrl || dataUrl === 'data:,') {
            dataUrl = directUrl;
          }

          canvas.toBlob(
            (blob) => {
              resolve({ blob: blob || file, dataUrl: dataUrl || directUrl });
            },
            'image/webp',
            0.85
          );
        } catch (err) {
          console.warn('Canvas processing fallback:', err);
          resolve({ blob: file, dataUrl: directUrl });
        }
      };
      img.onerror = () => resolve({ blob: file, dataUrl: directUrl });
      img.src = directUrl;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file to Supabase Storage.
 *
 * @param {File} file - The image file to upload
 * @param {string} bucket - The storage bucket name ('gallery', 'faculty', 'courses')
 * @param {number} [maxDim=1200] - Maximum dimension for resizing
 * @returns {Promise<{url: string, preview: string}>}
 *   url: The permanent public URL (Supabase CDN) or base64 data URL (fallback)
 *   preview: A base64 data URL for immediate display
 */
export async function uploadImage(file, bucket, maxDim = MAX_DIM) {
  // Step 1: Compress the image
  const { blob, dataUrl } = await compressImage(file, maxDim);

  // Step 2: If Supabase is configured, upload to Storage
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = 'webp';
      const fileName = `${bucket}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.warn(`Supabase Storage upload fallback (${bucket}):`, error.message || error);
        return { url: dataUrl, preview: dataUrl };
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: urlData?.publicUrl || dataUrl, preview: dataUrl };
    } catch (e) {
      console.warn('Supabase storage upload error, using local base64 fallback:', e);
      return { url: dataUrl, preview: dataUrl };
    }
  }

  // Fallback: No Supabase — return base64 data URL
  return { url: dataUrl, preview: dataUrl };
}

/**
 * Process an image file and return just the preview (no upload).
 * Used for immediate UI preview before form submission.
 */
export async function getImagePreview(file, maxDim = MAX_DIM) {
  const { dataUrl } = await compressImage(file, maxDim);
  return dataUrl;
}

export { MAX_FILE_SIZE };
