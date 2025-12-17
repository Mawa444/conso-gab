/**
 * Formulaire de création/édition de catalogue amélioré
 * Avec upload multi-images et géolocalisation héritée du business
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Catalog, CatalogInsert } from "@/types/entities/catalog.types";
import { useCreateCatalog, useUpdateCatalog } from "../hooks/useCatalog";
import { Loader2, X, ImagePlus, Tag, Truck, Phone, Mail, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CatalogFormProps {
  businessId: string;
  initialData?: Catalog;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  { value: 'restauration', label: '🍽️ Restauration' },
  { value: 'mode', label: '👗 Mode & Vêtements' },
  { value: 'beaute', label: '💄 Beauté & Bien-être' },
  { value: 'electronique', label: '📱 Électronique' },
  { value: 'services', label: '🔧 Services' },
  { value: 'artisanat', label: '🎨 Artisanat' },
  { value: 'alimentaire', label: '🛒 Alimentaire' },
  { value: 'immobilier', label: '🏠 Immobilier' },
  { value: 'automobile', label: '🚗 Automobile' },
  { value: 'autre', label: '📦 Autre' }
];

const CATALOG_TYPES = [
  { value: 'products', label: 'Produits', icon: '📦' },
  { value: 'services', label: 'Services', icon: '🔧' }
];

export const CatalogForm = ({ businessId, initialData, onSuccess, onCancel }: CatalogFormProps) => {
  const createCatalog = useCreateCatalog();
  const updateCatalog = useUpdateCatalog();
  
  const isEditing = !!initialData;
  const isLoading = createCatalog.isPending || updateCatalog.isPending;

  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(() => {
    if (initialData?.images) {
      if (Array.isArray(initialData.images)) return initialData.images;
      return [];
    }
    return [];
  });
  const [catalogType, setCatalogType] = useState<string>(initialData?.catalog_type || 'products');
  const [category, setCategory] = useState<string>(initialData?.category || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CatalogInsert>({
    defaultValues: initialData ? {
      ...initialData
    } : {
      business_id: businessId,
      name: "",
      description: "",
      category: "",
      catalog_type: 'products',
      is_public: false,
      is_active: true,
      price: undefined,
      delivery_available: false,
      on_sale: false
    }
  });

  const isOnSale = watch('on_sale');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      const newImages: string[] = [];
      
      for (const file of Array.from(e.target.files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `catalogs/${businessId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('business-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          // Try another bucket if business-images doesn't exist
          const { error: fallbackError } = await supabase.storage
            .from('catalogs')
            .upload(filePath, file);
          
          if (fallbackError) {
            console.error('Fallback upload error:', fallbackError);
            continue;
          }
          
          const { data: fallbackData } = supabase.storage
            .from('catalogs')
            .getPublicUrl(filePath);
          newImages.push(fallbackData.publicUrl);
          continue;
        }

        const { data } = supabase.storage
          .from('business-images')
          .getPublicUrl(filePath);

        newImages.push(data.publicUrl);
      }

      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages].slice(0, 10)); // Max 10 images
        toast.success(`${newImages.length} image(s) uploadée(s)`);
      }
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

  const setCoverImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [selected] = newImages.splice(index, 1);
      return [selected, ...newImages];
    });
    toast.success("Image de couverture définie");
  };

  const onSubmit = async (data: CatalogInsert) => {
    try {
      const payload: CatalogInsert = { 
        ...data, 
        business_id: businessId,
        catalog_type: catalogType,
        category: category,
        images: images,
        cover_url: images[0] || null
      };
      
      if (isEditing && initialData) {
        await updateCatalog.mutateAsync({ id: initialData.id, ...payload });
      } else {
        await createCatalog.mutateAsync(payload);
      }
      onSuccess?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Modifier le catalogue" : "Nouveau catalogue"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Créez un catalogue pour présenter vos produits ou services
        </p>
      </div>

      {/* Type de catalogue */}
      <div className="space-y-2">
        <Label>Type de catalogue *</Label>
        <div className="grid grid-cols-3 gap-2">
          {CATALOG_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setCatalogType(type.value)}
              className={cn(
                "p-3 rounded-lg border-2 text-center transition-all",
                catalogType === type.value 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-2xl block mb-1">{type.icon}</span>
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Images - Galerie multi-images */}
      <div className="space-y-2">
        <Label>
          Images du catalogue 
          <span className="text-muted-foreground text-xs ml-2">
            (première = couverture, max 10)
          </span>
        </Label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, index) => (
            <div 
              key={index} 
              className={cn(
                "relative w-24 h-24 rounded-lg overflow-hidden group border-2",
                index === 0 ? "border-primary ring-2 ring-primary/20" : "border-transparent"
              )}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              
              {index === 0 && (
                <Badge className="absolute top-1 left-1 text-[10px] px-1.5">
                  Couverture
                </Badge>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                {index !== 0 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={() => setCoverImage(index)}
                    title="Définir comme couverture"
                  >
                    ⭐
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {images.length < 10 && (
            <label className={cn(
              "w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
              "border-border hover:border-primary/50 hover:bg-muted/50"
            )}>
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Ajouter</span>
                </>
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

      {/* Nom */}
      <div className="space-y-2">
        <Label htmlFor="name">Nom du catalogue *</Label>
        <Input 
          id="name" 
          placeholder="Ex: Collection Été 2024, Menu du Chef..." 
          {...register("name", { required: "Le nom est requis" })} 
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Décrivez le contenu de ce catalogue..."
          rows={3}
          {...register("description")} 
        />
      </div>

      {/* Catégorie + Prix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Prix de base (FCFA)</Label>
          <Input 
            id="price" 
            type="number"
            placeholder="0"
            {...register("price", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Options promotionnelles */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-primary" />
            <Label htmlFor="on_sale" className="cursor-pointer">En promotion</Label>
          </div>
          <Switch 
            id="on_sale"
            checked={watch("on_sale") || false}
            onCheckedChange={(checked) => setValue("on_sale", checked)}
          />
        </div>
        
        {isOnSale && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="sale_percentage">Réduction (%)</Label>
              <Input 
                id="sale_percentage" 
                type="number"
                placeholder="25"
                min={0}
                max={100}
                {...register("sale_percentage", { valueAsNumber: true })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Options avancées */}
      <div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Masquer" : "Afficher"} les options avancées
        </Button>
        
        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 border rounded-lg">
            {/* Livraison */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <Label htmlFor="delivery_available">Livraison disponible</Label>
              </div>
              <Switch 
                id="delivery_available"
                checked={watch("delivery_available") || false}
                onCheckedChange={(checked) => setValue("delivery_available", checked)}
              />
            </div>
            
            {watch("delivery_available") && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="delivery_cost">Frais de livraison (FCFA)</Label>
                <Input 
                  id="delivery_cost" 
                  type="number"
                  placeholder="1500"
                  {...register("delivery_cost", { valueAsNumber: true })}
                />
              </div>
            )}

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_whatsapp" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </Label>
                <Input 
                  id="contact_whatsapp" 
                  placeholder="+241..."
                  {...register("contact_whatsapp")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input 
                  id="contact_email" 
                  type="email"
                  placeholder="contact@..."
                  {...register("contact_email")}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visibilité */}
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div>
          <Label htmlFor="is_public" className="cursor-pointer font-medium">
            Publier immédiatement
          </Label>
          <p className="text-xs text-muted-foreground">
            Rendre ce catalogue visible par tous les utilisateurs
          </p>
        </div>
        <Switch 
          id="is_public"
          checked={watch("is_public") || false}
          onCheckedChange={(checked) => setValue("is_public", checked)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Mettre à jour" : "Créer le catalogue"}
        </Button>
      </div>
    </form>
  );
};
