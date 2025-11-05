import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, X, MoveUp, MoveDown, Upload, Camera, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEnhancedImageUpload } from "@/hooks/use-enhanced-image-upload";
import { useRef, useCallback } from "react";

interface ImageData {
  url: string;
  path: string;
  id: string;
}

interface CarouselImagesManagerProps {
  businessId: string;
  currentImages: string[];
  onImagesUpdate: (images: string[]) => void;
}

export const CarouselImagesManager = ({ 
  businessId, 
  currentImages, 
  onImagesUpdate 
}: CarouselImagesManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();
  const { uploadProcessedImage, isUploading, isProcessing } = useEnhancedImageUpload();

  // Convertir les URLs actuelles en ImageData au montage
  useEffect(() => {
    const imageDataArray: ImageData[] = currentImages.map((url, index) => ({
      url,
      path: url.split('/').pop() || '',
      id: `existing-${index}`
    }));
    setImages(imageDataArray);
  }, [currentImages]);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const remainingSlots = 5 - images.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    for (const file of filesToProcess) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      
      setUploadProgress(prev => ({ ...prev, [tempId]: 10 }));

      try {
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({ 
            ...prev, 
            [tempId]: Math.min((prev[tempId] || 0) + 15, 90) 
          }));
        }, 500);

        const result = await uploadProcessedImage(file, {
          bucket: 'catalog-covers',
          folder: 'carousel',
          exactDimensions: { width: 1920, height: 1080 },
          maxSize: 2097152
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
            const urls = updated.map(img => img.url);
            saveImages(urls);
            onImagesUpdate(urls);
            return updated;
          });

          setUploadProgress(prev => ({ ...prev, [tempId]: 100 }));
          
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
        console.error('Erreur upload:', error);
        toast.error("Erreur lors de l'ajout de l'image");
        setUploadProgress(prev => {
          const { [tempId]: removed, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [uploadProcessedImage, businessId, onImagesUpdate, images]);

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

  const removeImage = async (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      const urls = updated.map(img => img.url);
      saveImages(urls);
      onImagesUpdate(urls);
      toast.success("Image supprimée");
      return updated;
    });
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    setImages(prev => {
      const updatedImages = [...prev];
      [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];
      const urls = updatedImages.map(img => img.url);
      saveImages(urls);
      onImagesUpdate(urls);
      return updatedImages;
    });
  };

  const saveImages = async (imagesToSave: string[]) => {
    try {
      const { error } = await supabase
        .from('business_profiles')
        .update({ carousel_images: imagesToSave })
        .eq('id', businessId);

      if (error) {
        console.error('Erreur sauvegarde:', error);
        toast.error("Erreur lors de la sauvegarde");
        throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      toast.success("Images enregistrées avec succès");
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const isProcessingOrUploading = isProcessing || isUploading;
  const canAddMore = images.length < 5;

  return (
    <div className="space-y-6">
      {/* En-tête avec badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Images publicitaires du carrousel</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Format 16:9 requis • Recadrage automatique • Max 2MB par image
          </p>
        </div>
        <Badge variant={images.length > 0 ? "default" : "secondary"}>
          {images.length}/5 images
        </Badge>
      </div>

      {/* Images existantes */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-video relative overflow-hidden rounded-lg border bg-muted">
                <img 
                  src={image.url} 
                  alt={`Publicité ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay avec actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => moveImage(index, 'up')}
                      title="Déplacer vers le haut"
                    >
                      <MoveUp className="w-4 h-4" />
                    </Button>
                  )}
                  {index < images.length - 1 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => moveImage(index, 'down')}
                      title="Déplacer vers le bas"
                    >
                      <MoveDown className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(image.id)}
                    title="Supprimer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Badge de position */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
              
              {/* Progress si en upload */}
              {Object.keys(uploadProgress).length > 0 && index === images.length - 1 && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="bg-background rounded-lg p-3 min-w-[120px]">
                    <Progress value={Object.values(uploadProgress)[0] || 0} className="h-2" />
                    <p className="text-xs text-center mt-2 text-muted-foreground">
                      {Math.round(Object.values(uploadProgress)[0] || 0)}%
                    </p>
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
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="font-medium mb-1">
                  {images.length === 0 ? 'Ajoutez vos images publicitaires' : `Ajouter plus d'images (${images.length}/5)`}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Format 16:9 (1920x1080) • Glissez-déposez ou cliquez pour sélectionner
                </p>
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                  <AlertCircle className="w-3 h-3" />
                  <span>Recadrage automatique • Max 2MB • WebP/JPEG optimisé</span>
                </div>
              </div>

              <Button 
                onClick={openFileDialog}
                disabled={isProcessingOrUploading}
                size="lg"
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
                e.target.value = '';
              }}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {images.length >= 5 && (
        <div className="text-center p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            ✓ Limite atteinte (5 images maximum)
          </p>
        </div>
      )}
    </div>
  );
};
