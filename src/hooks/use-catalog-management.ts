import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Catalog = Tables<'catalogs'>;
type CatalogInsert = TablesInsert<'catalogs'>;
type CatalogUpdate = TablesUpdate<'catalogs'>;

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
      const { data, error } = await supabase
        .from('catalogs')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Catalog[];
    },
    enabled: !!businessId
  });

  // Create catalog mutation
  const createCatalogMutation = useMutation({
    mutationFn: async (catalogData: Omit<CatalogInsert, 'business_id'>) => {
      const { data, error } = await supabase
        .from('catalogs')
        .insert({ ...catalogData, business_id: businessId })
        .select()
        .single();
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('catalogs')
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
      const { error } = await supabase
        .from('catalogs')
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
      const { data, error } = await supabase
        .from('catalogs')
        .update({ is_public: isPublic })
        .eq('id', catalogId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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