import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';

export const useBusinessImageLikes = (businessId: string, imageType: 'logo' | 'cover') => {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLikes();
  }, [businessId, imageType, user]);

  const fetchLikes = async () => {
    try {
      // Compter les likes totaux
      const { count, error: countError } = await supabase
        .from('business_image_likes')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('image_type', imageType);

      if (countError) throw countError;
      setLikesCount(count || 0);

      // Vérifier si l'utilisateur a déjà liké
      if (user) {
        const { data, error: userLikeError } = await supabase
          .from('business_image_likes')
          .select('id')
          .eq('business_id', businessId)
          .eq('user_id', user.id)
          .eq('image_type', imageType)
          .maybeSingle();

        if (userLikeError && userLikeError.code !== 'PGRST116') {
          throw userLikeError;
        }
        setIsLiked(!!data);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour liker');
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // Retirer le like
        const { error } = await supabase
          .from('business_image_likes')
          .delete()
          .eq('business_id', businessId)
          .eq('user_id', user.id)
          .eq('image_type', imageType);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Ajouter le like
        const { error } = await supabase
          .from('business_image_likes')
          .insert({
            business_id: businessId,
            user_id: user.id,
            image_type: imageType
          });

        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Erreur lors de l\'action');
    } finally {
      setIsLoading(false);
    }
  };

  return { likesCount, isLiked, isLoading, toggleLike };
};
