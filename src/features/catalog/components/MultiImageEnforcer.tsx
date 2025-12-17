import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Crop, Check, AlertCircle, Camera, X, Star } from 'lucide-react';
import { useEnhancedImageUpload } from '@/hooks/use-enhanced-image-upload';
import { Badge } from '@/components/ui/badge';

interface ImageData {
  url: string;
  path: string;
  id: string;
}

interface MultiImageEnforcerProps {
  onImagesChanged: (images: ImageData[]) => void;
  bucket: string;
  folder?: string;
  currentImages?: ImageData[];
  minImages?: number;
  maxImages?: number;
  label?: string;
  description?: string;
  coverIndex?: number;
  onCoverChanged?: (index: number) => void;
}

export const MultiImageEnforcer = ({ 
  onImagesChanged,
  bucket, 
  folder = 'uploads',
  currentImages = [],
  minImages = 4,
  maxImages = 10,
  label = "Images (16:9)",
  description = "Format 16:9 requis, max 2MB chacune",
  coverIndex = 0,
  onCoverChanged
}: MultiImageEnforcerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState<ImageData[]>(currentImages);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  const { uploadProcessedImage, isUploading, isProcessing } = useEnhancedImageUpload();

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    for (const file of filesToProcess) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      
      // Initialiser le progress
      setUploadProgress(prev => ({ ...prev, [tempId]: 10 }));

      try {
        // Simuler le progress pendant le traitement
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({ 
            ...prev, 
            [tempId]: Math.min((prev[tempId] || 0) + 15, 90) 
          }));
        }, 500);

        const result = await uploadProcessedImage(file, {
          bucket,
          folder,
          exactDimensions: { width: 1920, height: 1080 }, // Format 16:9
          maxSize: 2097152 // 2MB
        });

        clearInterval(progressInterval);

        if (result) {
          const newImage: ImageData = {
            url: result.url,
            path: result.path,
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`
          };

          setImages(prev => {
            const updated = [...prev, newImage];
            onImagesChanged(updated);
            return updated;
          });

          setUploadProgress(prev => ({ ...prev, [tempId]: 100 }));
          
          // Reset progress après un délai
          setTimeout(() => {
            setUploadProgress(prev => {
              const { [tempId]: removed, ...rest } = prev;
              return rest;
            });
          }, 1000);
        } else {
          setUploadProgress(prev => {
            const { [tempId]: removed, ...rest } = prev;
            return rest;
          });
        }
      } catch (error) {
        setUploadProgress(prev => {
          const { [tempId]: removed, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [uploadProcessedImage, bucket, folder, onImagesChanged, images.length, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
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

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      onImagesChanged(updated);
      
      // Ajuster l'index de couverture si nécessaire
      if (onCoverChanged && coverIndex >= updated.length && updated.length > 0) {
        onCoverChanged(0);
      }
      
      return updated;
    });
  };

  const setCoverImage = (index: number) => {
    if (onCoverChanged) {
      onCoverChanged(index);
    }
  };

  const isProcessingOrUploading = isProcessing || isUploading;
  const hasMinimumImages = images.length >= minImages;
  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium">{label}</label>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <Badge variant={hasMinimumImages ? "default" : "secondary"}>
          {images.length}/{minImages} min
        </Badge>
      </div>

      {/* Images existantes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img 
                  src={image.url} 
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay avec actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setCoverImage(index)}
                    className="text-xs"
                  >
                    <Star className={`w-3 h-3 ${index === coverIndex ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    Couverture
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Badge de couverture */}
                {index === coverIndex && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500 text-black text-xs">
                      <Star className="w-3 h-3 fill-current mr-1" />
                      Couverture
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Progress si en upload */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="bg-white rounded-lg p-2 min-w-[100px]">
                    <Progress value={Object.values(uploadProgress)[0] || 0} className="h-1" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zone d'upload */}
      {canAddMore && (
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
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="font-medium mb-1">
                  {images.length === 0 ? 'Ajoutez vos images' : `Ajouter des images (${images.length}/${maxImages})`}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Format 16:9 • Glissez-déposez ou cliquez pour sélectionner
                </p>
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                  <AlertCircle className="w-3 h-3" />
                  <span>Recadrage automatique • Max 2MB • WebP/JPEG</span>
                </div>
                
                {!hasMinimumImages && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-orange-800">
                      <strong>Minimum {minImages} images requis</strong> pour publier le catalogue
                    </p>
                  </div>
                )}
              </div>

              <Button 
                onClick={openFileDialog}
                disabled={isProcessingOrUploading}
                size="sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                {images.length === 0 ? 'Choisir des images' : 'Ajouter une image'}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files) handleFileSelect(files);
              }}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {images.length >= maxImages && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Limite atteinte ({maxImages} images maximum)
          </p>
        </div>
      )}
    </div>
  );
};
