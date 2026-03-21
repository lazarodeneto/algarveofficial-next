/**
 * Utility functions for image processing
 * Converts images to WebP format for better performance
 * Includes auto-trim for white/light borders
 */

const DEFAULT_WEBP_QUALITY = 0.70;
const MAX_DIMENSION = 1200;

// Trim thresholds
const LUMINANCE_THRESHOLD = 240; // Pixels lighter than this are considered "white"
const ROW_WHITE_RATIO = 0.98; // If 98% of pixels in a row are white, it's padding
const MIN_TRIM_RATIO = 0.02; // Only trim if padding exceeds 2% of dimension
const MAX_TRIM_RATIO = 0.15; // Safety limit: max 15% trim per edge

/**
 * Detect and trim white/light borders from an image
 * @param file - The image file to process
 * @returns Promise<File> - The trimmed image file
 */
export async function trimWhiteBorders(file: File): Promise<File> {
  // Skip non-image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      const { width, height } = img;
      
      // Draw original image to canvas
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);
      
      // Get pixel data
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;

      // Helper: check if pixel is "white" (high luminance)
      const isWhitePixel = (r: number, g: number, b: number, a: number) => {
        if (a < 128) return true; // Transparent = treat as white
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        return luminance >= LUMINANCE_THRESHOLD;
      };

      // Find top trim
      let topTrim = 0;
      for (let y = 0; y < height * MAX_TRIM_RATIO; y++) {
        let whiteCount = 0;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          if (isWhitePixel(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3])) {
            whiteCount++;
          }
        }
        if (whiteCount / width >= ROW_WHITE_RATIO) {
          topTrim = y + 1;
        } else {
          break;
        }
      }

      // Find bottom trim
      let bottomTrim = 0;
      for (let y = height - 1; y >= height * (1 - MAX_TRIM_RATIO); y--) {
        let whiteCount = 0;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          if (isWhitePixel(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3])) {
            whiteCount++;
          }
        }
        if (whiteCount / width >= ROW_WHITE_RATIO) {
          bottomTrim++;
        } else {
          break;
        }
      }

      // Find left trim
      let leftTrim = 0;
      for (let x = 0; x < width * MAX_TRIM_RATIO; x++) {
        let whiteCount = 0;
        for (let y = 0; y < height; y++) {
          const idx = (y * width + x) * 4;
          if (isWhitePixel(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3])) {
            whiteCount++;
          }
        }
        if (whiteCount / height >= ROW_WHITE_RATIO) {
          leftTrim = x + 1;
        } else {
          break;
        }
      }

      // Find right trim
      let rightTrim = 0;
      for (let x = width - 1; x >= width * (1 - MAX_TRIM_RATIO); x--) {
        let whiteCount = 0;
        for (let y = 0; y < height; y++) {
          const idx = (y * width + x) * 4;
          if (isWhitePixel(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3])) {
            whiteCount++;
          }
        }
        if (whiteCount / height >= ROW_WHITE_RATIO) {
          rightTrim++;
        } else {
          break;
        }
      }

      // Check if trim is meaningful (exceeds minimum threshold)
      const horizontalTrimRatio = (leftTrim + rightTrim) / width;
      const verticalTrimRatio = (topTrim + bottomTrim) / height;

      if (horizontalTrimRatio < MIN_TRIM_RATIO && verticalTrimRatio < MIN_TRIM_RATIO) {
        // No significant padding detected, return original
        resolve(file);
        return;
      }

      // Calculate new dimensions
      const newWidth = width - leftTrim - rightTrim;
      const newHeight = height - topTrim - bottomTrim;

      // Ensure we have valid dimensions
      if (newWidth <= 0 || newHeight <= 0) {
        resolve(file);
        return;
      }

      // Create new canvas with trimmed dimensions
      const trimmedCanvas = document.createElement('canvas');
      const trimmedCtx = trimmedCanvas.getContext('2d');

      if (!trimmedCtx) {
        resolve(file);
        return;
      }

      trimmedCanvas.width = newWidth;
      trimmedCanvas.height = newHeight;

      // Draw trimmed region
      trimmedCtx.drawImage(
        canvas,
        leftTrim,
        topTrim,
        newWidth,
        newHeight,
        0,
        0,
        newWidth,
        newHeight
      );

      // Convert back to file
      trimmedCanvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          const trimmedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(trimmedFile);
        },
        file.type,
        0.95
      );
    };

    img.onerror = () => {
      resolve(file); // On error, return original
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert an image file to WebP format using Canvas API
 * @param file - The original image file
 * @param quality - WebP quality (0-1), defaults to 0.70
 * @returns Promise<File> - The converted WebP file
 */
export async function convertToWebP(
  file: File,
  quality: number = DEFAULT_WEBP_QUALITY
): Promise<File> {
  // If already WebP, return as-is
  if (file.type === 'image/webp') {
    return file;
  }

  // Skip conversion for non-image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate dimensions, respecting max size
      let { width, height } = img;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }

          // Create new file with .webp extension
          const originalName = file.name.replace(/\.[^/.]+$/, '');
          const webpFile = new File([blob], `${originalName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for conversion'));
    };

    // Load the image from file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert multiple image files to WebP format
 * @param files - Array of image files
 * @param quality - WebP quality (0-1), defaults to 0.70
 * @returns Promise<File[]> - Array of converted WebP files
 */
export async function convertMultipleToWebP(
  files: File[],
  quality: number = DEFAULT_WEBP_QUALITY
): Promise<File[]> {
  const convertedFiles = await Promise.all(
    files.map((file) => convertToWebP(file, quality))
  );
  return convertedFiles;
}

/**
 * Check if the browser supports WebP encoding
 * @returns Promise<boolean>
 */
export async function supportsWebP(): Promise<boolean> {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Get estimated file size reduction percentage
 * @param originalSize - Original file size in bytes
 * @param newSize - New file size in bytes
 * @returns Percentage reduction
 */
export function getFileSizeReduction(originalSize: number, newSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - newSize) / originalSize) * 100);
}
