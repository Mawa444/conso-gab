import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadResult {
  url: string;
  path: string;
}

export const useStorageUpload = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (
    bucket: string,
    file: File,
    options?: { folder?: string; maxSize?: number; forceSquare?: boolean }
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    try {
      // Validation du type de fichier
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }

      // Validation de la taille (si spécifiée)
      const maxSize = options?.maxSize || 5 * 1024 * 1024; // 5MB par défaut
      if (file.size > maxSize) {
        throw new Error(`L'image est trop volumineuse (max ${Math.round(maxSize / (1024 * 1024))}MB)`);
      }

      // Validation des dimensions pour images carrées (si demandée)
      if (options?.forceSquare) {
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            if (img.width !== img.height) {
              reject(new Error('L\'image doit être carrée (même largeur et hauteur)'));
            } else if (img.width > 1000 || img.height > 1000) {
              reject(new Error('L\'image ne doit pas dépasser 1000x1000 pixels'));
            } else {
              resolve(true);
            }
          };
          img.onerror = () => reject(new Error('Impossible de lire l\'image'));
          img.src = URL.createObjectURL(file);
        });
      }

      const folder = options?.folder ?? 'uploads';
      const ext = file.name.split('.').pop();
      const safeName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
      const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || `image/${ext ?? 'jpeg'}`
      });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (!data?.publicUrl) {
        throw new Error('URL publique indisponible');
      }

      return { url: data.publicUrl, path: filePath };
    } catch (e: any) {
      console.error('Upload error:', e);
      toast({
        title: 'Échec du téléversement',
        description: e?.message || "Impossible de téléverser l'image. Vérifiez la configuration du stockage.",
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImages = async (
    bucket: string,
    files: FileList | File[],
    options?: { folder?: string }
  ): Promise<UploadResult[]> => {
    const arr = Array.from(files);
    const uploaded: UploadResult[] = [];
    for (const f of arr) {
      const res = await uploadImage(bucket, f, options);
      if (res) uploaded.push(res);
    }
    return uploaded;
  };

  return { uploadImage, uploadImages, isUploading };
};
