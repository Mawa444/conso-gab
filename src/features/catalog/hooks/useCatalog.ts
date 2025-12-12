import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Catalog, CatalogInsert, CatalogUpdate } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useCatalogs = (businessId: string) => {
  return useQuery({
    queryKey: ['catalogs', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogs')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Catalog[];
    },
  });
};

export const useCatalog = (catalogId: string) => {
  return useQuery({
    queryKey: ['catalog', catalogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalogs')
        .select('*')
        .eq('id', catalogId)
        .single();

      if (error) throw error;
      return data as Catalog;
    },
    enabled: !!catalogId,
  });
};

export const useCreateCatalog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (catalog: CatalogInsert) => {
      const { data, error } = await supabase
        .from('catalogs')
        .insert(catalog)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', data.business_id] });
      toast({
        title: 'Catalogue créé',
        description: 'Le catalogue a été créé avec succès.',
      });
    },
    onError: (error) => {
      console.error('Error creating catalog:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le catalogue.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCatalog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & CatalogUpdate) => {
      const { data, error } = await supabase
        .from('catalogs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', data.business_id] });
      queryClient.invalidateQueries({ queryKey: ['catalog', data.id] });
      toast({
        title: 'Catalogue mis à jour',
        description: 'Les modifications ont été enregistrées.',
      });
    },
    onError: (error) => {
      console.error('Error updating catalog:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le catalogue.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCatalog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (catalogId: string) => {
      // Soft delete by setting visibility to archived and is_active to false
      const { data, error } = await supabase
        .from('catalogs')
        // We need to fetch the business_id to invalidate queries
        .update({ is_active: false, visibility: 'archived' }) 
        .eq('id', catalogId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', data.business_id] });
      toast({
        title: 'Catalogue supprimé',
        description: 'Le catalogue a été archivé.',
      });
    },
    onError: (error) => {
      console.error('Error deleting catalog:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le catalogue.',
        variant: 'destructive',
      });
    },
  });
};

export const usePublicCatalogs = (filters?: { search?: string; city?: string; category?: string }) => {
  return useQuery({
    queryKey: ['public-catalogs', filters],
    queryFn: async () => {
      let query = supabase
        .from('catalogs')
        .select(`
          *,
          business_profiles (
            business_name,
            business_category,
            address,
            phone,
            city,
            slug
          )
        `)
        .eq('is_public', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      // Client-side filtering for city if not possible in join (Supabase filter on joined table is tricky without !inner)
      // We will fetch more and filter in JS if needed, or use !inner if we are sure.
      // For now, let's just return raw data and let the component filter or refactor to proper join filter later.
      // Actually, let's keep it simple as in the original page.
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
