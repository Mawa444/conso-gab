import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CatalogService } from "@/services/catalog.service";
import { useToast } from "@/hooks/use-toast";

export const useCatalogMutations = (businessId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createCatalogMutation = useMutation({
    mutationFn: async (formData: any) => {
      // 1. Fetch Business Location for Inheritance
      const { data: business, error: businessError } = await (supabase as any)
        .from('business_profiles')
        .select('latitude, longitude, city, currency')
        .eq('id', businessId)
        .single();
      
      if (businessError) {
        console.error("Failed to fetch business for location inheritance", businessError);
      }

      // 2. Prepare Payload with Location Inheritance
      const payload = {
        ...formData,
        // Inherit location if not explicit
        latitude: formData.latitude || business?.latitude,
        longitude: formData.longitude || business?.longitude,
        geo_city: formData.geo_city || business?.city,
        // Inherit currency if not explicit
        price_currency: formData.price_currency || business?.currency || 'FCFA',
        // Default flags
        is_active: true,
        visibility: formData.visibility || 'published',
        is_public: formData.visibility === 'published'
      };

      return CatalogService.createCatalog(businessId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({ title: "Catalogue créé", description: "Le catalogue a été ajouté avec succès." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de créer le catalogue", 
        variant: "destructive" 
      });
    }
  });

  const updateCatalogMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => {
      return CatalogService.updateCatalog(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({ title: "Catalogue mis à jour", description: "Les modifications ont été enregistrées." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de modifier le catalogue", 
        variant: "destructive" 
      });
    }
  });

  const deleteCatalogMutation = useMutation({
    mutationFn: (id: string) => CatalogService.deleteCatalog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({ title: "Catalogue supprimé", description: "Le catalogue a été archivé." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de supprimer le catalogue", 
        variant: "destructive" 
      });
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) => 
      CatalogService.toggleVisibility(id, isPublic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({ title: "Visibilité modifiée" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Action impossible", 
        variant: "destructive" 
      });
    }
  });

  return {
    createCatalog: createCatalogMutation.mutateAsync,
    updateCatalog: updateCatalogMutation.mutateAsync,
    deleteCatalog: deleteCatalogMutation.mutateAsync,
    toggleVisibility: toggleVisibilityMutation.mutateAsync,
    isCreating: createCatalogMutation.isPending,
    isUpdating: updateCatalogMutation.isPending,
    isDeleting: deleteCatalogMutation.isPending
  };
};
