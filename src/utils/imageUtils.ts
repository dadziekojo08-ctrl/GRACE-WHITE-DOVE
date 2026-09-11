/**
 * Student & Staff Photo Processing Utilities
 * Converts, center-crops, and optimizes uploaded student images for ID card printing.
 * Compresses images into lightweight, high-clarity JPEG data URLs (25KB - 50KB)
 * that persist reliably in Firestore documents and render cleanly in high-DPI ID card printouts.
 */

export interface ProcessedPhotoResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
}

/**
 * Standard ID Card Passport Photo specifications (width: 400px, height: 480px, aspect ratio 1:1.2)
 */
export const ID_PHOTO_WIDTH = 400;
export const ID_PHOTO_HEIGHT = 480;

/**
 * Process an uploaded image file (File/Blob) into an optimized passport photo data URL
 */
export async function processStudentPhotoFile(
  file: File | Blob,
  targetWidth: number = ID_PHOTO_WIDTH,
  targetHeight: number = ID_PHOTO_HEIGHT,
  quality: number = 0.85
): Promise<ProcessedPhotoResult> {
  // Validate file type
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, or WebP).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file. Please try another photo.'));
    };

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error('Could not decode image. The file may be corrupted.'));
      };

      img.onload = () => {
        try {
          const result = cropAndCompressImageElement(img, targetWidth, targetHeight, quality);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Process a raw data URL or image source (e.g. from webcam capture) into an optimized passport photo
 */
export async function processStudentPhotoDataUrl(
  dataUrl: string,
  targetWidth: number = ID_PHOTO_WIDTH,
  targetHeight: number = ID_PHOTO_HEIGHT,
  quality: number = 0.85
): Promise<ProcessedPhotoResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => {
      reject(new Error('Failed to load image for processing.'));
    };

    img.onload = () => {
      try {
        const result = cropAndCompressImageElement(img, targetWidth, targetHeight, quality);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    img.src = dataUrl;
  });
}

/**
 * Center-crops and resizes an HTMLImageElement to passport dimensions on a canvas
 */
function cropAndCompressImageElement(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  quality: number
): ProcessedPhotoResult {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not initialize 2D canvas context for image processing.');
  }

  // Calculate center crop maintaining target aspect ratio
  const targetRatio = targetWidth / targetHeight;
  const sourceWidth = img.naturalWidth || img.width;
  const sourceHeight = img.naturalHeight || img.height;
  const sourceRatio = sourceWidth / sourceHeight;

  let sx = 0;
  let sy = 0;
  let sWidth = sourceWidth;
  let sHeight = sourceHeight;

  if (sourceRatio > targetRatio) {
    // Source is wider than target ratio: crop sides
    sWidth = sourceHeight * targetRatio;
    sx = (sourceWidth - sWidth) / 2;
  } else {
    // Source is taller than target ratio: crop top/bottom
    // For portrait faces, offset slightly upwards (e.g. 35% from top instead of 50%) for better head framing
    sHeight = sourceWidth / targetRatio;
    sy = Math.max(0, (sourceHeight - sHeight) * 0.35);
  }

  // Draw image to canvas with high quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

  // Export to JPEG
  const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
  const sizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

  return {
    dataUrl: compressedDataUrl,
    sizeKb,
    width: targetWidth,
    height: targetHeight
  };
}

/**
 * Generates an SVG or Dicebear default avatar if no custom photo is supplied
 */
export function getDefaultStudentAvatar(fullName: string): string {
  const seed = encodeURIComponent(fullName.trim() || 'Student');
  return `https://api.dicebear.com/7.x/micah/svg?seed=${seed}`;
}
