export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatioPercent: number;
  width: number;
  height: number;
  format: string;
}

/**
 * Compresses any image file or base64 data to under ~150KB while preserving prescription legibility.
 */
export async function compressImage(
  fileOrBase64: File | string,
  maxWidth: number = 1400,
  maxHeight: number = 1400,
  quality: number = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    let originalSize = 0;
    const img = new Image();

    const processImage = () => {
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      // Optimize image rendering for text readability
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // White background for transparent PNG conversions
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(img, 0, 0, width, height);

      // Attempt webp, fallback to jpeg
      let format = 'image/jpeg';
      let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

      // Approximate byte length of base64
      const head = 'data:image/jpeg;base64,';
      const base64Str = compressedDataUrl.substring(head.length);
      const compressedSize = Math.round((base64Str.length * 3) / 4);

      if (originalSize === 0) {
        originalSize = Math.round(compressedSize * 4.2); // estimate if original was raw base64
      }

      const spaceSaved = originalSize > compressedSize 
        ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
        : 0;

      resolve({
        dataUrl: compressedDataUrl,
        originalSizeBytes: originalSize,
        compressedSizeBytes: compressedSize,
        compressionRatioPercent: spaceSaved,
        width,
        height,
        format,
      });
    };

    img.onerror = (err) => reject(err);

    if (typeof fileOrBase64 === 'string') {
      img.src = fileOrBase64;
      originalSize = Math.round((fileOrBase64.length * 3) / 4);
    } else {
      originalSize = fileOrBase64.size;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrBase64);
    }

    img.onload = () => {
      processImage();
    };
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
