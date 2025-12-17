import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Catalog, CatalogInsert, CatalogUpdate } from '@/types/entities/catalog.types';
import type { Json } from '@/integrations/supabase/types';

// Helper pour requêtes non typées
const catalogsTable = () => (supabase as any).from('catalogs');

interface CatalogDataWithImages extends Omit<CatalogInsert, 'business_id' | 'images'> {
  images?: Json; // Json compatible with DB
  title?: string;
}

export const useCatalogManagement = (businessId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch catalogs for business
  const {
    data: catalogs = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['catalogs', businessId],
    queryFn: async () => {
      const { data, error } = await catalogsTable()
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Catalog[];
    },
    enabled: !!businessId
  });

  // Create catalog mutation
  const createCatalogMutation = useMutation({
    mutationFn: async (catalogData: CatalogDataWithImages) => {
      const { images, title, ...catalogInsert } = catalogData;
      
      // Ensure RLS will work by including the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const insertData: CatalogInsert = { 
        ...catalogInsert, 
        business_id: businessId,
        name: title || catalogInsert.name || 'Catalogue sans nom'
      };
      
      const { data, error } = await catalogsTable()
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Impossible de créer le catalogue: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({
        title: "Catalogue créé",
        description: "Votre nouveau catalogue a été créé avec succès."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le catalogue.",
        variant: "destructive"
      });
      console.error('Error creating catalog:', error);
    }
  });

  // Update catalog mutation
  const updateCatalogMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CatalogUpdate }) => {
      const { data, error } = await catalogsTable()
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({
        title: "Catalogue mis à jour",
        description: "Les modifications ont été sauvegardées."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le catalogue.",
        variant: "destructive"
      });
      console.error('Error updating catalog:', error);
    }
  });

  // Delete catalog mutation
  const deleteCatalogMutation = useMutation({
    mutationFn: async (catalogId: string) => {
      const { error } = await catalogsTable()
        .delete()
        .eq('id', catalogId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({
        title: "Catalogue supprimé",
        description: "Le catalogue a été supprimé définitivement."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le catalogue.",
        variant: "destructive"
      });
      console.error('Error deleting catalog:', error);
    }
  });

  // Toggle catalog visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ catalogId, isPublic }: { catalogId: string; isPublic: boolean }) => {
      const { data, error } = await catalogsTable()
        .update({ is_public: isPublic })
        .eq('id', catalogId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Catalog & { is_public: boolean };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({
        title: data.is_public ? "Catalogue publié" : "Catalogue retiré",
        description: data.is_public 
          ? "Votre catalogue est maintenant visible par tous."
          : "Votre catalogue n'est plus visible publiquement."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la visibilité.",
        variant: "destructive"
      });
      console.error('Error toggling visibility:', error);
    }
  });

  return {
    catalogs,
    isLoading,
    error,
    createCatalog: createCatalogMutation.mutate,
    updateCatalog: updateCatalogMutation.mutate,
    deleteCatalog: deleteCatalogMutation.mutate,
    toggleVisibility: toggleVisibilityMutation.mutate,
    isCreating: createCatalogMutation.isPending,
    isUpdating: updateCatalogMutation.isPending,
    isDeleting: deleteCatalogMutation.isPending,
    isToggling: toggleVisibilityMutation.isPending
  };
};