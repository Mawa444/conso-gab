import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Crop, Check, AlertCircle, Camera } from 'lucide-react';
import { useEnhancedImageUpload } from '@/hooks/use-enhanced-image-upload';

interface ImageEnforcerProps {
  onImageUploaded: (result: { url: string; path: string }) => void;
  bucket: string;
  folder?: string;
  currentImageUrl?: string;
  label?: string;
  description?: string;
}

export const ImageEnforcer = ({ 
  onImageUploaded, 
  bucket, 
  folder = 'uploads',
  currentImageUrl,
  label = "Image (1300×1300 px)",
  description = "Format carré requis, max 2MB"
}: ImageEnforcerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { uploadProcessedImage, isUploading, isProcessing } = useEnhancedImageUpload();

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Créer un aperçu immédiat
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setUploadProgress(10);

    try {
      // Simuler le progress pendant le traitement
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const result = await uploadProcessedImage(file, {
        bucket,
        folder,
        exactDimensions: { width: 1300, height: 1300 },
        maxSize: 2097152 // 2MB
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result) {
        onImageUploaded({ url: result.url, path: result.path });
        setPreviewUrl(result.url);
        
        // Reset progress après un délai
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        setPreviewUrl(currentImageUrl || null);
        setUploadProgress(0);
      }
    } catch (error) {
      setPreviewUrl(currentImageUrl || null);
      setUploadProgress(0);
    }

    // Nettoyer l'URL de prévisualisation temporaire
    if (preview !== currentImageUrl) {
      URL.revokeObjectURL(preview);
    }
  }, [uploadProcessedImage, bucket, folder, onImageUploaded, currentImageUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const isProcessingOrUploading = isProcessing || isUploading;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{label}</label>
        {isProcessingOrUploading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isProcessing && <Crop className="w-3 h-3 animate-spin" />}
            {isUploading && <Upload className="w-3 h-3 animate-pulse" />}
            {isProcessing ? 'Recadrage...' : 'Upload...'}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">{description}</p>

      <Card 
        className={`border-2 border-dashed transition-all duration-200 ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${isProcessingOrUploading ? 'opacity-75' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6">
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Aperçu" 
                  className="w-full h-48 object-cover rounded-lg mx-auto"
                  style={{ aspectRatio: '1/1', maxWidth: '200px' }}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="bg-white rounded-lg p-3 min-w-[120px]">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-center mt-2">
                        {isProcessing ? 'Recadrage...' : `${uploadProgress}%`}
                      </p>
                    </div>
                  </div>
                )}
                {uploadProgress === 100 && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openFileDialog}
                disabled={isProcessingOrUploading}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Changer l'image
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Image carrée 1300×1300px</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Glissez-déposez ou cliquez pour sélectionner
                </p>
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                  <AlertCircle className="w-3 h-3" />
                  <span>Recadrage automatique • Max 2MB • WebP/JPEG</span>
                </div>
              </div>

              <Button 
                onClick={openFileDialog}
                disabled={isProcessingOrUploading}
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choisir une image
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};
