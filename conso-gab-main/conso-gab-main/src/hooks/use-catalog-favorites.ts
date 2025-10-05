import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCatalogFavorites = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's favorite catalogs
  const {
    data: favoriteCatalogs = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['catalog-favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('catalog_likes')
        .select(`
          catalog_id,
          catalogs (
            id,
            name,
            description,
            category,
            cover_image_url,
            cover_url,
            business_id,
            created_at,
            is_public
          )
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data?.map(item => item.catalogs).filter(Boolean) || [];
    },
    enabled: !!userId
  });

  // Check if a catalog is favorited
  const isFavorited = (catalogId: string): boolean => {
    return favoriteCatalogs.some((catalog: any) => catalog.id === catalogId);
  };

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (catalogId: string) => {
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const isCurrentlyFavorited = isFavorited(catalogId);
      
      if (isCurrentlyFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('catalog_likes')
          .delete()
          .eq('user_id', userId)
          .eq('catalog_id', catalogId);
        
        if (error) throw error;
        return { action: 'removed', catalogId };
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('catalog_likes')
          .insert({ user_id: userId, catalog_id: catalogId });
        
        if (error) throw error;
        return { action: 'added', catalogId };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['catalog-favorites', userId] });
      queryClient.invalidateQueries({ queryKey: ['catalog-likes', result.catalogId] });
      
      toast({
        title: result.action === 'added' ? 'Ajouté aux favoris' : 'Retiré des favoris',
        description: result.action === 'added' 
          ? 'Ce catalogue a été ajouté à vos favoris.'
          : 'Ce catalogue a été retiré de vos favoris.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier les favoris.',
        variant: 'destructive'
      });
      console.error('Error toggling favorite:', error);
    }
  });

  return {
    favoriteCatalogs,
    isLoading,
    error,
    isFavorited,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isToggling: toggleFavoriteMutation.isPending
  };
};

// Hook for managing catalog shares
export const useCatalogShares = () => {
  const { toast } = useToast();

  const shareCatalog = async (catalogId: string, catalogName: string) => {
    try {
      const shareData = {
        title: `Catalogue: ${catalogName}`,
        text: `Découvrez ce catalogue sur Gaboma`,
        url: `${window.location.origin}/catalog/${catalogId}`
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: 'Partagé avec succès',
          description: 'Le catalogue a été partagé.'
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Lien copié',
          description: 'Le lien du catalogue a été copié dans le presse-papier.'
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: 'Erreur de partage',
          description: 'Impossible de partager ce catalogue.',
          variant: 'destructive'
        });
      }
    }
  };

  return { shareCatalog };
};