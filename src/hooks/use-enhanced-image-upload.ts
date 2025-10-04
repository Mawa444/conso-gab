import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadResult {
  url: string;
  path: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

interface ImageProcessingOptions {
  bucket: string;
  folder?: string;
  requireSquare?: boolean;
  exactDimensions?: { width: number; height: number };
  maxSize?: number;
  quality?: number;
}

export const useEnhancedImageUpload = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateImage = useCallback((file: File): Promise<{ width: number; height: number; isValid: boolean; message?: string }> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve({ width: 0, height: 0, isValid: false, message: 'Le fichier doit être une image' });
        return;
      }

      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        
        // Vérifier les dimensions minimales (plus flexible pour 16:9)
        const minDimension = Math.min(width, height);
        if (minDimension < 800) {
          resolve({ 
            width, 
            height, 
            isValid: false, 
            message: 'L\'image doit faire au minimum 800px sur sa plus petite dimension' 
          });
          return;
        }

        resolve({ width, height, isValid: true });
      };

      img.onerror = () => {
        resolve({ width: 0, height: 0, isValid: false, message: 'Impossible de lire l\'image' });
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  const resizeAndCropImage = useCallback((
    file: File,
    targetWidth: number = 1300,
    targetHeight: number = 1300,
    quality: number = 0.92
  ): Promise<{ blob: Blob; format: string }> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Impossible de créer le contexte canvas'));
        return;
      }

      img.onload = () => {
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Calculer les dimensions pour un recadrage centré
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const x = (targetWidth - scaledWidth) / 2;
        const y = (targetHeight - scaledHeight) / 2;

        // Dessiner l'image redimensionnée et recadrée
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convertir en blob avec compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Déterminer le format optimal
              let format = 'webp';
              if (blob.size > 2097152) { // 2MB
                format = 'jpeg';
              }
              
              resolve({ blob, format });
            } else {
              reject(new Error('Échec de la conversion'));
            }
          },
          quality > 0.9 ? 'image/webp' : 'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const uploadProcessedImage = useCallback(async (
    file: File,
    options: ImageProcessingOptions
  ): Promise<ImageUploadResult | null> => {
    setIsUploading(true);
    setIsProcessing(true);

    try {
      // Validation initiale
      const validation = await validateImage(file);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Dimensions cibles - 1300x1300 pour profils/catalogues, 1920x1080 pour couvertures
      const targetWidth = options.exactDimensions?.width || 1300;
      const targetHeight = options.exactDimensions?.height || 1300;
      const maxSize = options.maxSize || 2097152; // 2MB

      // Redimensionner et recadrer
      let quality = options.quality || 0.92;
      let { blob, format } = await resizeAndCropImage(file, targetWidth, targetHeight, quality);

      // Si trop volumineux, réduire la qualité progressivement
      if (blob.size > maxSize) {
        for (const q of [0.9, 0.85, 0.8, 0.75, 0.7]) {
          const result = await resizeAndCropImage(file, targetWidth, targetHeight, q);
          if (result.blob.size <= maxSize) {
            blob = result.blob;
            format = result.format;
            quality = q;
            break;
          }
        }
      }

      // Vérification finale de la taille
      if (blob.size > maxSize) {
        throw new Error(`Image trop volumineuse après compression (${Math.round(blob.size / 1024)}KB > ${Math.round(maxSize / 1024)}KB)`);
      }

      setIsProcessing(false);

      // Upload vers Supabase
      const folder = options.folder || 'uploads';
      const ext = format === 'webp' ? 'webp' : 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, blob, {
          cacheControl: '31536000', // 1 an
          upsert: false,
          contentType: `image/${format}`
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data } = supabase.storage.from(options.bucket).getPublicUrl(filePath);
      
      if (!data?.publicUrl) {
        throw new Error('URL publique indisponible');
      }

      toast({
        title: '✅ Image optimisée',
        description: `${targetWidth}×${targetHeight}, ${Math.round(blob.size / 1024)}KB, ${format.toUpperCase()} — affichage instantané garanti.`
      });

      return {
        url: data.publicUrl,
        path: filePath,
        width: targetWidth,
        height: targetHeight,
        size: blob.size,
        format
      };

    } catch (error: any) {
      console.error('Erreur upload image:', error);
      
      let message = 'Échec du téléversement de l\'image';
      if (error.message.includes('trop volumineuse')) {
        message = '❌ Votre image dépasse 2 MB après optimisation. Essayez un fond plus simple ou moins de texte.';
      } else if (error.message.includes('800')) {
        message = '❌ L\'image doit être au moins 800px sur sa plus petite dimension.';
      }

      toast({
        title: 'Erreur d\'upload',
        description: message,
        variant: 'destructive'
      });

      return null;
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  }, [validateImage, resizeAndCropImage, toast]);

  return {
    uploadProcessedImage,
    isUploading,
    isProcessing,
    validateImage
  };
};