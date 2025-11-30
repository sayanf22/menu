/**
 * Image Compression Utility
 * Compresses images to target size while maintaining quality
 */

import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  useWebWorker?: boolean;
  onProgress?: (progress: number) => void;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  wasCompressed: boolean;
}

// Compression presets - all target under 500KB
export const COMPRESSION_PRESETS = {
  logo: {
    maxSizeMB: 0.15,          // 150KB max for logos
    maxWidthOrHeight: 512,
    quality: 0.85,
    useWebWorker: true,
  },
  menuImage: {
    maxSizeMB: 0.4,           // 400KB max for menu images
    maxWidthOrHeight: 1920,
    quality: 0.8,
    useWebWorker: true,
  },
} as const;

// Max upload size: 1MB - anything larger MUST be compressed
const MAX_UPLOAD_SIZE = 1 * 1024 * 1024; // 1MB

/**
 * Compress an image file with progress tracking
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = COMPRESSION_PRESETS.menuImage
): Promise<CompressionResult> {
  const originalSize = file.size;
  const targetSizeBytes = (options.maxSizeMB || 0.4) * 1024 * 1024;

  // If file is already smaller than target, return as-is
  if (originalSize <= targetSizeBytes) {
    options.onProgress?.(100);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false,
    };
  }

  // Reject files larger than 1MB that can't be compressed
  if (originalSize > MAX_UPLOAD_SIZE * 10) {
    throw new Error('File too large. Maximum 10MB allowed.');
  }

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB || 0.4,
      maxWidthOrHeight: options.maxWidthOrHeight || 1920,
      useWebWorker: options.useWebWorker ?? true,
      initialQuality: options.quality || 0.8,
      alwaysKeepResolution: false,
      fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      onProgress: options.onProgress,
    });

    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
      compressionRatio: originalSize / compressedFile.size,
      wasCompressed: true,
    };
  } catch (error) {
    console.error('Compression failed:', error);
    throw error;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getCompressionStats(result: CompressionResult): string {
  if (!result.wasCompressed) {
    return `Already optimized (${formatFileSize(result.originalSize)})`;
  }
  const savedPercent = (((result.originalSize - result.compressedSize) / result.originalSize) * 100).toFixed(0);
  return `${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (${savedPercent}% saved)`;
}