import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export type MediaType = 'image' | 'video' | 'audio' | 'document';

interface UploadOptions {
  maxSizeMB?: number;
  compress?: boolean;
}

const DEFAULT_OPTIONS: Record<MediaType, UploadOptions> = {
  image: { maxSizeMB: 2, compress: true },
  video: { maxSizeMB: 50, compress: false },
  audio: { maxSizeMB: 10, compress: false },
  document: { maxSizeMB: 10, compress: false }
};

const ALLOWED_MIME_TYPES: Record<MediaType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  document: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

/**
 * Hook pour uploader des médias vers Supabase Storage
 * Support : images, vidéos, audio, documents
 */
export const useMediaUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valider le fichier
   */
  const validateFile = useCallback((file: File, mediaType: MediaType): boolean => {
    const options = DEFAULT_OPTIONS[mediaType];
    const allowedTypes = ALLOWED_MIME_TYPES[mediaType];

    // Vérifier le type MIME
    if (!allowedTypes.includes(file.type)) {
      setError(`Type de fichier non supporté : ${file.type}`);
      toast.error(`Type de fichier non supporté pour ${mediaType}`);
      return false;
    }

    // Vérifier la taille
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > (options.maxSizeMB || 10)) {
      setError(`Fichier trop volumineux : ${fileSizeMB.toFixed(2)}MB (max: ${options.maxSizeMB}MB)`);
      toast.error(`Fichier trop volumineux (max: ${options.maxSizeMB}MB)`);
      return false;
    }

    return true;
  }, []);

  /**
   * Compresser une image (si nécessaire)
   */
  const compressImage = useCallback(async (file: File): Promise<File> => {
    // Si le fichier est déjà petit, pas besoin de compresser
    if (file.size / (1024 * 1024) < 0.5) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Limiter à 1920px max
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression échouée'));
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Upload un fichier vers Supabase Storage
   */
  const uploadFile = useCallback(async (
    file: File,
    mediaType: MediaType
  ): Promise<string | null> => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return null;
    }

    // Valider le fichier
    if (!validateFile(file, mediaType)) {
      return null;
    }

    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      let fileToUpload = file;

      // Compresser les images si nécessaire
      if (mediaType === 'image' && DEFAULT_OPTIONS.image.compress) {
        setProgress(20);
        fileToUpload = await compressImage(file);
        console.log(`📦 Image compressée : ${(file.size / 1024).toFixed(2)}KB → ${(fileToUpload.size / 1024).toFixed(2)}KB`);
      }

      setProgress(40);

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${user.id}/${timestamp}_${randomString}.${fileExt}`;

      setProgress(60);

      // Upload vers Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setProgress(80);

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(data.path);

      setProgress(100);
      console.log('✅ Fichier uploadé avec succès:', publicUrl);
      
      toast.success('Fichier uploadé avec succès');
      return publicUrl;

    } catch (err: any) {
      console.error('❌ Erreur lors de l\'upload:', err);
      setError(err.message || 'Erreur lors de l\'upload');
      toast.error('Impossible d\'uploader le fichier');
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [user, validateFile, compressImage]);

  /**
   * Upload multiple files
   */
  const uploadMultipleFiles = useCallback(async (
    files: File[],
    mediaType: MediaType
  ): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const file of files) {
      const url = await uploadFile(file, mediaType);
      if (url) {
        urls.push(url);
      }
    }

    return urls;
  }, [uploadFile]);

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading,
    progress,
    error
  };
};
