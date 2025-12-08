import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CatalogService } from "@/services/catalog.service";
import { CreateCatalogInput } from "@/types/entities/catalog.types";

export const useCreateCatalog = (businessId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: CreateCatalogInput) => {
      if (!businessId) throw new Error("Aucun businessId fourni");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");


      // Delegate to CatalogService which handles all mapping and validation
      const data = await CatalogService.createCatalog(businessId, payload);
      return { data, error: null };


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