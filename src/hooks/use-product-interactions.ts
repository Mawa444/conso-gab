import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Favorite = Tables<'favorites'>;
type Review = Tables<'reviews'>;
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
          business:business_profiles(*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });

  // Check if business is favorited
  const isFavorited = (businessId: string) => {
    return favorites.some(fav => fav.business_id === businessId);
  };

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ businessId }: { businessId: string }) => {
      if (!userId) throw new Error('User must be authenticated');

      const existingFavorite = favorites.find(fav => fav.business_id === businessId);

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
          ? "Ce commerce a été ajouté à vos favoris."
          : "Ce commerce a été retiré de vos favoris."
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
    mutationFn: async (reviewData: Omit<ReviewInsert, 'user_id'>) => {
      if (!userId) throw new Error('User must be authenticated');
      
      const { data, error } = await supabase
        .from('reviews')
        .insert({ ...reviewData, user_id: userId })
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

  // Get reviews for a business
  const useReviews = (businessId?: string) => {
    return useQuery({
      queryKey: ['reviews', businessId],
      queryFn: async () => {
        if (!businessId) return [];
        
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      enabled: !!businessId
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