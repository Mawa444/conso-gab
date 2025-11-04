import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, MoveUp, MoveDown, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
  const [images, setImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessId}_${Date.now()}.${fileExt}`;
      const filePath = `carousel/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('catalog-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('catalog-covers')
        .getPublicUrl(filePath);

      const updatedImages = [...images, publicUrl];
      await saveImages(updatedImages);
      setImages(updatedImages);
      onImagesUpdate(updatedImages);
      toast.success("Image ajoutée avec succès");
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error("Erreur lors de l'ajout de l'image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    await saveImages(updatedImages);
    setImages(updatedImages);
    onImagesUpdate(updatedImages);
    toast.success("Image supprimée");
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];
    
    await saveImages(updatedImages);
    setImages(updatedImages);
    onImagesUpdate(updatedImages);
  };

  const saveImages = async (imagesToSave: string[]) => {
    try {
      const { error } = await supabase
        .from('business_profiles')
        .update({ carousel_images: imagesToSave })
        .eq('id', businessId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['business', businessId] });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      throw error;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Images publicitaires du carrousel</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez jusqu'à 5 images qui s'afficheront en rotation sur votre carte entreprise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                <img 
                  src={url} 
                  alt={`Publicité ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, 'up')}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                )}
                {index < images.length - 1 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, 'down')}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {images.length < 5 && (
            <Label className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <div className="text-sm text-muted-foreground">Upload...</div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ajouter une image</span>
                </>
              )}
            </Label>
          )}
        </div>
      </div>
    </Card>
  );
};
