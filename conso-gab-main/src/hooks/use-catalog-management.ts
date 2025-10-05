// ✅ HOOKS SIMPLES ET FOCUSÉS - Single Responsibility Principle

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types simplifiés (à définir dans catalog.types.ts)
interface Catalog {
  id: string;
  business_id: string;
  catalog_name: string;
  catalog_type: string;
  description?: string;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CatalogCreationData {
  catalog_name: string;
  catalog_type: string;
  description?: string;
  is_public?: boolean;
  business_id?: string;
}

// ✅ HOOK 1: Liste des catalogues (READ)
export function useCatalogs(businessId?: string) {
  return useQuery({
    queryKey: ['catalogs', businessId],
    queryFn: async () => {
      let query = supabase
        .from('catalogs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Catalog[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ✅ HOOK 2: Création de catalogue (CREATE)
export function useCreateCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CatalogCreationData) => {
      const { data: catalog, error } = await supabase
        .from('catalogs')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return catalog as Catalog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    },
  });
}

// ✅ HOOK 3: Mise à jour de catalogue (UPDATE)
export function useUpdateCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CatalogCreationData> }) => {
      const { data: catalog, error } = await supabase
        .from('catalogs')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return catalog as Catalog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    },
  });
}

// ✅ HOOK 4: Suppression de catalogue (DELETE)
export function useDeleteCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('catalogs')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    },
  });
}

// ✅ HOOK 5: Recherche avec filtres (BONUS - Simple)
export function useCatalogSearch() {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    isPublic: undefined as boolean | undefined,
  });

  const query = useQuery({
    queryKey: ['catalogs', 'search', filters],
    queryFn: async () => {
      let query = supabase
        .from('catalogs')
        .select('*')
        .eq('is_active', true);

      if (filters.search) {
        query = query.ilike('catalog_name', `%${filters.search}%`);
      }

      if (filters.type) {
        query = query.eq('catalog_type', filters.type);
      }

      if (filters.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Catalog[];
    },
    enabled: !!filters.search || !!filters.type || filters.isPublic !== undefined,
  });

  return { ...query, filters, setFilters };
}