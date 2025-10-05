import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductInsert = TablesInsert<'products'>;
type ProductUpdate = TablesUpdate<'products'>;

export interface ProductWithCatalog extends Product {
  catalog?: Tables<'catalogs'>;
  business?: Tables<'business_profiles'>;
}

export const useProductManagement = (businessId?: string, catalogId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products with filters
  const {
    data: products = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['products', businessId, catalogId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          catalog:catalogs(*),
          business:business_profiles(*)
        `);

      if (businessId) {
        query = query.eq('business_id', businessId);
      }
      if (catalogId) {
        query = query.eq('catalog_id', catalogId);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ProductWithCatalog[];
    },
    enabled: !!(businessId || catalogId)
  });

  // Fetch published products for public display
  const {
    data: publishedProducts = [],
    isLoading: isLoadingPublished
  } = useQuery({
    queryKey: ['published-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          catalog:catalogs(*),
          business:business_profiles(*)
        `)
        .eq('is_active', true)
        .eq('catalogs.is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProductWithCatalog[];
    }
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: Omit<ProductInsert, 'business_id'>) => {
      if (!businessId) throw new Error('Business ID is required');
      
      const { data, error } = await supabase
        .from('products')
        .insert({ ...productData, business_id: businessId })
        .select(`
          *,
          catalog:catalogs(*),
          business:business_profiles(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produit créé",
        description: "Votre nouveau produit a été créé avec succès."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit.",
        variant: "destructive"
      });
      console.error('Error creating product:', error);
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProductUpdate }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          catalog:catalogs(*),
          business:business_profiles(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produit mis à jour",
        description: "Les modifications ont été sauvegardées."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit.",
        variant: "destructive"
      });
      console.error('Error updating product:', error);
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé définitivement."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive"
      });
      console.error('Error deleting product:', error);
    }
  });

  // Toggle product visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', productId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['published-products'] });
      toast({
        title: data.is_active ? "Produit publié" : "Produit retiré",
        description: data.is_active 
          ? "Votre produit est maintenant visible par tous."
          : "Votre produit n'est plus visible publiquement."
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
    products,
    publishedProducts,
    isLoading,
    isLoadingPublished,
    error,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    toggleVisibility: toggleVisibilityMutation.mutate,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isToggling: toggleVisibilityMutation.isPending
  };
};