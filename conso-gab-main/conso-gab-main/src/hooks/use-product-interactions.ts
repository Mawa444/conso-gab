import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Favorite = Tables<'favorites'>;
type Review = Tables<'reviews'>;
type FavoriteInsert = TablesInsert<'favorites'>;
type ReviewInsert = TablesInsert<'reviews'>;

export const useProductInteractions = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user favorites
  const {
    data: favorites = [],
    isLoading: isLoadingFavorites
  } = useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          product:products(*),
          business:business_profiles(*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Check if product is favorited
  const isFavorited = (productId: string) => {
    return favorites.some(fav => fav.product_id === productId);
  };

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ productId, businessId }: { productId: string; businessId: string }) => {
      if (!userId) throw new Error('User must be authenticated');

      const existingFavorite = favorites.find(fav => fav.product_id === productId);

      if (existingFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id);
        
        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add favorite
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: userId,
            product_id: productId,
            business_id: businessId
          })
          .select()
          .single();
        
        if (error) throw error;
        return { action: 'added', data };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      toast({
        title: result.action === 'added' ? "Ajouté aux favoris" : "Retiré des favoris",
        description: result.action === 'added' 
          ? "Ce produit a été ajouté à vos favoris."
          : "Ce produit a été retiré de vos favoris."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier les favoris.",
        variant: "destructive"
      });
      console.error('Error toggling favorite:', error);
    }
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: Omit<ReviewInsert, 'customer_id'>) => {
      if (!userId) throw new Error('User must be authenticated');
      
      const { data, error } = await supabase
        .from('reviews')
        .insert({ ...reviewData, customer_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Avis publié",
        description: "Votre avis a été publié avec succès."
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de publier l'avis.",
        variant: "destructive"
      });
      console.error('Error adding review:', error);
    }
  });

  // Get reviews for a product or business
  const useReviews = (productId?: string, businessId?: string) => {
    return useQuery({
      queryKey: ['reviews', productId, businessId],
      queryFn: async () => {
        let query = supabase
          .from('reviews')
          .select(`
            *,
            customer:profiles(*)
          `)
          .order('created_at', { ascending: false });

        if (productId) {
          query = query.eq('product_id', productId);
        }
        if (businessId) {
          query = query.eq('business_id', businessId);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        return data;
      },
      enabled: !!(productId || businessId)
    });
  };

  return {
    favorites,
    isLoadingFavorites,
    isFavorited,
    toggleFavorite: toggleFavoriteMutation.mutate,
    addReview: addReviewMutation.mutate,
    useReviews,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
    isAddingReview: addReviewMutation.isPending
  };
};