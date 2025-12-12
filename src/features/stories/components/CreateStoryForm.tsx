/**
 * Formulaire de création de story/annonce éphémère
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X, Upload, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { StoryInsert, StoryType, STORY_TYPE_CONFIG } from "../types";
import { useCreateStory } from "../hooks/useStories";
import { cn } from "@/lib/utils";

interface CreateStoryFormProps {
  businessId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateStoryForm = ({ businessId, onSuccess, onCancel }: CreateStoryFormProps) => {
  const createStory = useCreateStory();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [storyType, setStoryType] = useState<StoryType>('announcement');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<StoryInsert>({
    defaultValues: {
      business_id: businessId,
      story_type: 'announcement',
      title: '',
      description: ''
    }
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      const newImages: string[] = [];
      
      for (const file of Array.from(e.target.files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `stories/${businessId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('business-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from('business-images')
          .getPublicUrl(filePath);

        newImages.push(data.publicUrl);
      }

      setImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) uploadée(s)`);
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: StoryInsert) => {
    try {
      await createStory.mutateAsync({
        ...data,
        business_id: businessId,
        story_type: storyType,
        images: images,
        cover_url: images[0] || null
      });
      onSuccess?.();
    } catch (error) {
      // Handled by hook
    }
  };

  const showPriceFields = ['flash_sale', 'promo', 'discount'].includes(storyType);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Nouvelle annonce</h2>
        <p className="text-sm text-muted-foreground">
          Publiez une annonce visible pendant 24h
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
          <span className="text-primary">📍</span> 
          Votre story sera automatiquement géolocalisée à l'adresse de votre commerce pour apparaître dans le radar des clients à proximité.
        </div>
      </div>

      {/* Type de story */}
      <div className="space-y-2">
        <Label>Type d'annonce *</Label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(STORY_TYPE_CONFIG).map(([type, config]) => (
            <button
              key={type}
              type="button"
              onClick={() => setStoryType(type as StoryType)}
              className={cn(
                "p-3 rounded-lg border-2 text-center transition-all",
                storyType === type 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-2xl block mb-1">{config.icon}</span>
              <span className="text-xs font-medium">{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Images (max 5)</Label>
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ))}
          
          {images.length < 5 && (
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Titre */}
      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input 
          id="title" 
          placeholder="Ex: Vente flash sur nos pizzas!" 
          {...register("title", { required: "Le titre est requis" })} 
        />
        {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Décrivez votre annonce..."
          rows={3}
          {...register("description")} 
        />
      </div>

      {/* Prix (si promo/vente flash) */}
      {showPriceFields && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="original_price">Prix original (FCFA)</Label>
            <Input 
              id="original_price" 
              type="number"
              placeholder="10000"
              {...register("original_price", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo_price">Prix promo (FCFA)</Label>
            <Input 
              id="promo_price" 
              type="number"
              placeholder="7500"
              {...register("promo_price", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount_percentage">Réduction (%)</Label>
            <Input 
              id="discount_percentage" 
              type="number"
              placeholder="25"
              min={0}
              max={100}
              {...register("discount_percentage", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo_code">Code promo (optionnel)</Label>
            <Input 
              id="promo_code" 
              placeholder="FLASH25"
              {...register("promo_code")}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={createStory.isPending}>
          {createStory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publier l'annonce
        </Button>
      </div>
    </form>
  );
};
