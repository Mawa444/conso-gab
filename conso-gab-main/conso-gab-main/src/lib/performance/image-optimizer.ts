/**
 * Utilitaires d'optimisation d'images
 */

export interface ImageOptimizationConfig {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Génère un srcset responsive pour une image
 */
export const generateSrcSet = (baseUrl: string, widths: number[]): string => {
  return widths
    .map(width => `${baseUrl}?w=${width} ${width}w`)
    .join(', ');
};

/**
 * Génère les sizes appropriés selon les breakpoints
 */
export const generateSizes = (config?: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string => {
  const defaults = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw'
  };
  
  const { mobile, tablet, desktop } = { ...defaults, ...config };
  
  return `(max-width: 720px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
};

/**
 * Compresse une image côté client avant upload
 */
export const compressImage = async (
  file: File,
  config: ImageOptimizationConfig = {}
): Promise<Blob> => {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.85, format = 'webp' } = config;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Image compression failed'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.readAsDataURL(file);
  });
};

/**
 * Vérifie si le format WebP est supporté par le navigateur
 */
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
};

/**
 * Calcule le placeholder blur hash (simple version)
 */
export const generatePlaceholder = (width: number = 10, height: number = 10): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='1'/%3E%3C/filter%3E%3Crect width='${width}' height='${height}' fill='%23f3f4f6' filter='url(%23b)'/%3E%3C/svg%3E`;
};
