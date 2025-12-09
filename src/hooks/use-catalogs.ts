/**
 * Hook unifié pour la gestion complète des catalogues
 * CRUD: Create, Read, Update, Delete
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface CatalogFormData {
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  catalog_type?: 'products' | 'services';
  is_public?: boolean;
  cover_url?: string;
  images?: string[];
  min_price?: number;
  max_price?: number;
  price_type?: 'fixed' | 'range' | 'quote';
  price_currency?: string;
  delivery_available?: boolean;
  delivery_cost?: number;
  delivery_zones?: string[];
  keywords?: string[];
}

export interface Catalog extends CatalogFormData {
  id: string;
  business_id: string;
  is_active: boolean;
  visibility: string;
  display_order: number;
  seo_score: number;
  created_at: string;
  updated_at: string;
  // Joined data
  business_profiles?: {
    business_name: string;
    city?: string;
    quartier?: string;
    latitude?: number;
    longitude?: number;
  };
}

// Helper pour requêtes non typées (table catalogs pas dans types générés)
const catalogsTable = () => (supabase as any).from('catalogs');

export const useCatalogs = (businessId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les catalogues d'un business
  const {
    data: catalogs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['catalogs', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await catalogsTable()
        .select('*, business_profiles(business_name, city, quartier, latitude, longitude)')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Catalog[];
    },
    enabled: !!businessId
  });

  // Récupérer un catalogue par ID
  const getCatalogById = async (catalogId: string): Promise<Catalog | null> => {
    const { data, error } = await catalogsTable()
      .select('*, business_profiles(business_name, city, quartier, latitude, longitude)')
      .eq('id', catalogId)
      .single();
    
    if (error) {
      console.error('Error fetching catalog:', error);
      return null;
    }
    return data as Catalog;
  };

  // Créer un catalogue
  const createMutation = useMutation({
    mutationFn: async (formData: CatalogFormData) => {
      if (!businessId) throw new Error('Business ID requis');

      // Vérifier l'authentification
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      // Récupérer les infos géo du business
      const { data: business } = await supabase
        .from('business_profiles')
        .select('city, quartier, latitude, longitude')
        .eq('id', businessId)
        .single();

      const insertData = {
        business_id: businessId,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        category: formData.category || null,
        subcategory: formData.subcategory || null,
        catalog_type: formData.catalog_type || 'products',
        is_public: formData.is_public ?? false,
        is_active: true,
        visibility: formData.is_public ? 'published' : 'draft',
        cover_url: formData.cover_url || null,
        images: formData.images ? JSON.stringify(formData.images) : null,
        min_price: formData.min_price || null,
        max_price: formData.max_price || null,
        price_type: formData.price_type || 'fixed',
        price_currency: formData.price_currency || 'XAF',
        delivery_available: formData.delivery_available ?? false,
        delivery_cost: formData.delivery_cost || null,
        delivery_zones: formData.delivery_zones || null,
        keywords: formData.keywords || null,
        display_order: 0,
        seo_score: 0
      };

      const { data, error } = await catalogsTable()
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data as Catalog;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({
        title: 'Catalogue créé',
        description: `"${data.name}" a été créé avec succès.`
      });
    },
    onError: (error: any) => {
      console.error('Erreur création catalogue:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le catalogue',
        variant: 'destructive'
      });
    }
  });

  // Mettre à jour un catalogue
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CatalogFormData> }) => {
      const updateData: any = { ...updates };
      
      // Gérer la visibilité
      if (updates.is_public !== undefined) {
        updateData.visibility = updates.is_public ? 'published' : 'draft';
      }
      
      // Convertir images en JSON si présent
      if (updates.images) {
        updateData.images = JSON.stringify(updates.images);
      }

      const { data, error } = await catalogsTable()
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Catalog;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({
        title: 'Catalogue mis à jour',
        description: `"${data.name}" a été modifié avec succès.`
      });
    },
    onError: (error: any) => {
      console.error('Erreur mise à jour catalogue:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le catalogue',
        variant: 'destructive'
      });
    }
  });

  // Supprimer un catalogue (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (catalogId: string) => {
      const { error } = await catalogsTable()
        .update({ is_active: false, visibility: 'archived' })
        .eq('id', catalogId);

      if (error) throw error;
      return catalogId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', businessId] });
      toast({
        title: 'Catalogue supprimé',
        description: 'Le catalogue a été supprimé avec succès.'
      });
    },
    onError: (error: any) => {
      console.error('Erreur suppression catalogue:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le catalogue',
        variant: 'destructive'
      });
    }
  });

  // Toggle visibilité
  const toggleVisibility = async (catalogId: string, isPublic: boolean) => {
    return updateMutation.mutateAsync({ id: catalogId, updates: { is_public: isPublic } });
  };

  return {
    // Data
    catalogs,
    isLoading,
    error,
    refetch,
    
    // Actions
    getCatalogById,
    createCatalog: createMutation.mutateAsync,
    updateCatalog: updateMutation.mutateAsync,
    deleteCatalog: deleteMutation.mutateAsync,
    toggleVisibility,
    
    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

// Hook pour les catalogues publics (tous les utilisateurs)
export const usePublicCatalogs = (filters?: {
  category?: string;
  city?: string;
  search?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['public-catalogs', filters],
    queryFn: async () => {
      let query = catalogsTable()
        .select('*, business_profiles(business_name, city, quartier, latitude, longitude)')
        .eq('is_public', true)
        .eq('is_active', true)
        .eq('visibility', 'published');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.city) {
        query = query.eq('business_profiles.city', filters.city);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Catalog[];
    }
  });
};
