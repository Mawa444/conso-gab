import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { useEnhancedImageUpload } from '@/hooks/use-enhanced-image-upload';
import { ImageCropperModal } from './ImageCropperModal';
import { toast } from 'sonner';

interface ProfileImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string, path: string) => void;
  bucket: string;
  folder?: string;
  label?: string;
}

export const ProfileImageUploader = ({ 
  currentImageUrl, 
  onImageUploaded,
  bucket,
  folder = 'avatars',
  label = "Photo de profil"
}: ProfileImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const { uploadProcessedImage, isUploading, isProcessing } = useEnhancedImageUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setTempImageUrl(preview);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const file = new File([croppedBlob], 'profile-image.jpg', { type: 'image/jpeg' });
    
    try {
      const result = await uploadProcessedImage(file, {
        bucket,
        folder,
        exactDimensions: { width: 1300, height: 1300 },
        quality: 0.92,
        maxSize: 5242880
      });

      if (result) {
        onImageUploaded(result.url, result.path);
        setPreviewUrl(result.url);
        toast.success("Photo de profil mise à jour avec succès");
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageUploaded('', '');
    toast.success("Photo de profil supprimée");
  };

  const isLoading = isUploading || isProcessing;

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <p className="text-xs text-muted-foreground">Format carré 1300x1300px, max 3MB</p>

        <div className="flex items-center gap-4">
        {/* Avatar preview */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('profile-image-input')?.click()}
            disabled={isLoading}
          >
            <Camera className="w-4 h-4 mr-2" />
            {previewUrl ? 'Modifier' : 'Ajouter'}
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
          id="profile-image-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>

      {tempImageUrl && (
        <ImageCropperModal
          open={showCropper}
          onClose={() => {
            setShowCropper(false);
            if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
            setTempImageUrl(null);
          }}
          imageUrl={tempImageUrl}
          aspectRatio={1}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};
