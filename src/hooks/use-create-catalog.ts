import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CreateCatalogInput {
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  catalog_type?: 'products' | 'services';
  isPublic?: boolean;
  images?: any[];
  cover_url?: string;
  cover_image_url?: string;
  geo_city?: string;
  geo_district?: string;
  availability_zone?: string;
  keywords?: string[];
  synonyms?: string[];
  has_limited_quantity?: boolean;
  on_sale?: boolean;
  sale_percentage?: number;
  delivery_available?: boolean;
  delivery_zones?: string[];
  delivery_cost?: number;
  contact_whatsapp?: string;
  contact_phone?: string;
  contact_email?: string;
  business_hours?: any;
  base_price?: number;
  price_type?: 'fixed' | 'from' | 'variable';
  price_currency?: string;
  price_details?: any[];
}

export const useCreateCatalog = (businessId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: CreateCatalogInput) => {
      if (!businessId) throw new Error("Aucun businessId fourni");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      // Use only the fields that exist in the catalogs table
      const insertData = {
        business_id: businessId,
        name: payload.name?.trim() || "Catalogue sans nom",
        description: payload.description?.trim() || null,
        is_active: true,
        display_order: 0
      };

      const { data, error } = await supabase
        .from('catalogs')
        .insert(insertData)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Create catalog error:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({
        title: 'Catalogue créé',
        description: 'Votre nouveau catalogue a été créé avec succès.'
      });
    },
    onError: (err: any) => {
      console.error('Erreur création catalogue complète:', err);
      
      let errorMessage = "Impossible de créer le catalogue.";
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error?.message) {
        errorMessage = err.error.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      toast({
        title: 'Erreur de création',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });

  return {
    createCatalog: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
};