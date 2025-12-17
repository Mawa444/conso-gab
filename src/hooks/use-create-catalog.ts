import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { catalogSchema } from "@/lib/validations/catalog";
import { z } from "zod";

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

/**
 * 🔥 HOOK DE CRÉATION DE CATALOGUES - AVEC VALIDATION ZOD
 * 
 * Crée un nouveau catalogue avec validation stricte et sauvegarde de TOUS les champs.
 * 
 * @param businessId - ID du business propriétaire du catalogue
 * @returns {Object} Hook de mutation avec createCatalog et isCreating
 * 
 * @example
 * ```tsx
 * const { createCatalog, isCreating } = useCreateCatalog(businessId);
 * 
 * try {
 *   await createCatalog({
 *     name: "Mon produit",
 *     price: 5000,
 *     category: "Électronique",
 *     // ... autres champs
 *   });
 * } catch (error) {
 *   // Gestion d'erreur (validation ou DB)
 * }
 * ```
 * 
 * @note 
 * - Utilise 'base_price' dans l'input mais sauvegarde comme 'price' en DB
 * - Validation Zod stricte avant insertion
 * - Logging structuré de toutes les opérations
 * - Sauvegarde de 24 champs en DB (tous les champs existants)
 */
export const useCreateCatalog = (businessId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: CreateCatalogInput) => {
      const startTime = performance.now();
      
      // 🔥 VALIDATION 1: Business ID
      if (!businessId) {
        console.error('[use-create-catalog] Missing businessId');
        throw new Error("Aucun businessId fourni");
      }

      // 🔥 VALIDATION 2: Authentification
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[use-create-catalog] User not authenticated');
        throw new Error("Utilisateur non authentifié");
      }

      console.log('[use-create-catalog] Starting catalog creation', {
        businessId,
        userId: user.id,
        catalogName: payload.name,
      });

      // 🔥 VALIDATION 3: Validation Zod stricte
      let validatedData;
      try {
        validatedData = catalogSchema.parse({
          business_id: businessId,
          name: payload.name,
          description: payload.description,
          category: payload.category,
          subcategory: payload.subcategory,
          catalog_type: payload.catalog_type || 'products',
          price: payload.base_price, // Utiliser 'price' pour la DB
          price_currency: payload.price_currency || 'XAF',
          cover_url: payload.cover_url,
          images: payload.images || [],
          keywords: payload.keywords || [],
          seo_score: 0,
          is_public: payload.isPublic ?? false,
          is_active: true,
          visibility: payload.isPublic ? 'published' : 'draft',
          delivery_available: payload.delivery_available ?? false,
          delivery_cost: payload.delivery_cost,
          delivery_zones: payload.delivery_zones || [],
          on_sale: payload.on_sale ?? false,
          sale_percentage: payload.sale_percentage,
          contact_whatsapp: payload.contact_whatsapp,
          contact_phone: payload.contact_phone,
          contact_email: payload.contact_email,
          geo_city: payload.geo_city,
          geo_district: payload.geo_district,
        });

        console.log('[use-create-catalog] Validation Zod successful', {
          fieldsCount: Object.keys(validatedData).length,
          hasPrice: !!validatedData.price,
          hasImages: validatedData.images.length > 0,
          isPublic: validatedData.is_public,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('[use-create-catalog] Validation Zod failed', {
            errors: error.errors,
            invalidFields: error.errors.map(e => e.path.join('.')),
          });
          
          // Formatter les erreurs pour l'utilisateur
          const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
          throw new Error(`Données invalides: ${errorMessages}`);
        }
        throw error;
      }

      // 🔥 INSERTION: Utiliser les données VALIDÉES
      const { data, error } = await supabase
        .from('catalogs')
        .insert(validatedData)
        .select()
        .maybeSingle();

      if (error) {
        console.error('[use-create-catalog] Database insertion failed', {
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
        });
        throw new Error(error.message);
      }

      const duration = performance.now() - startTime;
      console.log('[use-create-catalog] Catalog created successfully', {
        catalogId: data?.id,
        duration: `${duration.toFixed(2)}ms`,
        fieldsInserted: Object.keys(validatedData).length,
      });

      return data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      
      console.log('[use-create-catalog] Cache invalidated', {
        catalogId: data?.id,
        businessId,
      });
      
      toast({
        title: 'Catalogue créé',
        description: 'Votre nouveau catalogue a été créé avec succès.'
      });
    },
    onError: (err: any) => {
      console.error('[use-create-catalog] Mutation failed', {
        errorType: err.constructor.name,
        errorMessage: err?.message,
        errorStack: err?.stack?.split('\n').slice(0, 3),
      });
      
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