/**
 * Cloudflare R2 Upload Utility
 * Uploads images through Supabase Edge Function to R2 storage
 */

import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  type?: string;
  error?: string;
}

export interface UploadOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
  maxSizeMB?: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const UPLOAD_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/upload-to-r2`;

/**
 * Upload a file to Cloudflare R2 via Edge Function
 */
export async function uploadToR2(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { folder = 'menu-images', maxSizeMB = 10 } = options;

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
    };
  }

  // Validate file size
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      success: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'anonymous';

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('userId', userId);

    // Get auth token for Edge Function
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;

    // Upload via Edge Function
    const response = await fetch(UPLOAD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Upload failed',
      };
    }

    return {
      success: true,
      url: result.url,
      filename: result.filename,
      size: result.size,
      type: result.type,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload multiple files to R2
 */
export async function uploadMultipleToR2(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (const file of files) {
    const result = await uploadToR2(file, options);
    results.push(result);
  }
  
  return results;
}

/**
 * Delete a file from R2 (requires Edge Function implementation)
 */
export async function deleteFromR2(filename: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/delete-from-r2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ filename }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get optimized image URL with R2 transformations (if using Cloudflare Images)
 */
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number; format?: 'webp' | 'avif' | 'auto' } = {}
): string {
  // R2 public URLs don't support transformations directly
  // If you need transformations, consider using Cloudflare Images or a CDN
  return url;
}
