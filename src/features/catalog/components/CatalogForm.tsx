import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Catalog, CatalogInsert } from "../types";
import { useCreateCatalog, useUpdateCatalog } from "../hooks/useCatalog";
import { Loader2, X, Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CatalogFormProps {
  businessId: string;
  initialData?: Catalog;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CatalogForm = ({ businessId, initialData, onSuccess, onCancel }: CatalogFormProps) => {
  const createCatalog = useCreateCatalog();
  const updateCatalog = useUpdateCatalog();
  
  const isEditing = !!initialData;
  const isLoading = createCatalog.isPending || updateCatalog.isPending;

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CatalogInsert>({
    defaultValues: initialData ? {
      ...initialData
    } : {
      business_id: businessId,
      name: "",
      description: "",
      category: "",
      is_public: false,
      is_active: true,
      price: null
    }
  });

  /* Image Upload Logic */
  const [uploading, setUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(initialData?.cover_url || undefined);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${businessId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('catalogs')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('catalogs')
        .getPublicUrl(filePath);

      setCoverUrl(data.publicUrl);
      setValue('cover_url', data.publicUrl);
    } catch (error) {
       console.error("Error uploading image:", error);
       // Check if bucket exists, if not, maybe try 'catalogs' or handle error
       // We now favor 'catalogs' bucket.
    } finally {
      setUploading(false);
    }
  };


  const onSubmit = async (data: CatalogInsert) => {
    try {
      const payload = { ...data, cover_url: coverUrl };
      if (isEditing && initialData) {
        await updateCatalog.mutateAsync({ id: initialData.id, ...payload });
      } else {
        await createCatalog.mutateAsync({ ...payload, business_id: businessId });
      }
      onSuccess?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{isEditing ? "Modifier le catalogue" : "Créer un nouveau catalogue"}</h2>
        <p className="text-sm text-gray-500">Remplissez les informations ci-dessous pour {isEditing ? "mettre à jour" : "créer"} votre catalogue.</p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
            <Label>Image de couverture</Label>
            <div className="flex items-center gap-4">
                {coverUrl && <img src={coverUrl} alt="Cover" className="w-20 h-20 object-cover rounded-md" />}
                <Input type="file" onChange={handleImageUpload} disabled={uploading} accept="image/*" />
                {uploading && <Loader2 className="animate-spin" />}
            </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nom du catalogue *</Label>
          <Input 
            id="name" 
            placeholder="Ex: Menu Été 2024" 
            {...register("name", { required: "Le nom est requis" })} 
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Décrivez le contenu de ce catalogue..." 
            {...register("description")} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
             {/* TODO: Connect to a real category selector */}
            <Input 
              id="category" 
              placeholder="Ex: Restauration" 
              {...register("category")} 
            />
          </div>

          <div className="space-y-2">
             <Label htmlFor="price">Prix de base (Optionnel)</Label>
             <Input 
               id="price" 
               type="number"
               placeholder="0.00"
               {...register("price", { valueAsNumber: true })}
             />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <Switch 
            id="is_public" 
            checked={watch("is_public") || false}
            onCheckedChange={(checked) => setValue("is_public", checked)}
          />
          <Label htmlFor="is_public">Rendre public immédiatement</Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
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
