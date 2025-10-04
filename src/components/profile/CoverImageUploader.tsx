import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';
import { useEnhancedImageUpload } from '@/hooks/use-enhanced-image-upload';
import { toast } from 'sonner';

interface CoverImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string, path: string) => void;
  bucket: string;
  folder?: string;
  label?: string;
}

export const CoverImageUploader = ({ 
  currentImageUrl, 
  onImageUploaded,
  bucket,
  folder = 'covers',
  label = "Image de couverture"
}: CoverImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { uploadProcessedImage, isUploading, isProcessing } = useEnhancedImageUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      const result = await uploadProcessedImage(file, {
        bucket,
        folder,
        exactDimensions: { width: 1920, height: 1080 },
        maxSize: 5242880 // 5MB
      });

      if (result) {
        onImageUploaded(result.url, result.path);
        setPreviewUrl(result.url);
        toast.success("Image de couverture mise à jour");
      } else {
        setPreviewUrl(currentImageUrl || null);
      }
    } catch (error) {
      setPreviewUrl(currentImageUrl || null);
      toast.error("Erreur lors de l'upload");
    } finally {
      if (preview !== currentImageUrl) {
        URL.revokeObjectURL(preview);
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageUploaded('', '');
    toast.success("Image de couverture supprimée");
  };

  const isLoading = isUploading || isProcessing;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <p className="text-xs text-muted-foreground">Format 1920x1080px (16:9), max 5MB</p>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Cover preview */}
          <div className="relative w-full h-48 bg-muted flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Couverture" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune image de couverture</p>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('cover-image-input')?.click()}
              disabled={isLoading}
              className="flex-1"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {previewUrl ? 'Modifier' : 'Ajouter une couverture'}
            </Button>
            
            {previewUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>

          <input
            id="cover-image-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};
