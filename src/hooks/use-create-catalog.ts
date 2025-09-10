import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Catalog = Tables<'catalogs'>;
type CatalogInsert = TablesInsert<'catalogs'>;

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
}

export const useCreateCatalog = (businessId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: CreateCatalogInput) => {
      if (!businessId) throw new Error("Aucun businessId fourni");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      const insertData: CatalogInsert = {
        business_id: businessId,
        name: payload.name?.trim() || "Catalogue sans nom",
        description: payload.description?.trim() || null,
        catalog_type: payload.catalog_type || 'products',
        category: payload.category || null,
        subcategory: payload.subcategory || null,
        images: (payload.images ?? []) as unknown as CatalogInsert['images'],
        cover_url: payload.cover_url || null,
        cover_image_url: payload.cover_image_url || null,
        geo_city: payload.geo_city || null,
        geo_district: payload.geo_district || null,
        availability_zone: (payload.availability_zone as any) || 'city',
        keywords: payload.keywords || [],
        synonyms: payload.synonyms || [],
        has_limited_quantity: payload.has_limited_quantity || false,
        on_sale: payload.on_sale || false,
        sale_percentage: payload.sale_percentage || 0,
        delivery_available: payload.delivery_available || false,
        delivery_zones: payload.delivery_zones || [],
        delivery_cost: payload.delivery_cost || 0,
        contact_whatsapp: payload.contact_whatsapp || null,
        contact_phone: payload.contact_phone || null,
        contact_email: payload.contact_email || null,
        business_hours: payload.business_hours || null,
        // Keep both visibility and is_public in sync for now
        visibility: payload.isPublic ? 'public' : 'draft',
        is_public: !!payload.isPublic,
        is_active: true,
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

      return data as Catalog;
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
      
      // Extract more specific error messages from Supabase
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
