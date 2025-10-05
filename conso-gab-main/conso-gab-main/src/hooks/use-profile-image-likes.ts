import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface UseProfileImageLikesResult {
  likesCount: number;
  isLiked: boolean;
  isLoading: boolean;
  toggleLike: () => Promise<void>;
}

export const useProfileImageLikes = (
  profileUserId: string,
  imageType: 'avatar' | 'cover'
): UseProfileImageLikesResult => {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch likes count and user's like status
  const fetchLikes = async () => {
    try {
      // Get total likes count
      const { count, error: countError } = await supabase
        .from('profile_image_likes')
        .select('*', { count: 'exact', head: true })
        .eq('profile_user_id', profileUserId)
        .eq('image_type', imageType);

      if (countError) throw countError;
      setLikesCount(count || 0);

      // Check if current user has liked
      if (user) {
        const { data, error: likeError } = await supabase
          .from('profile_image_likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('profile_user_id', profileUserId)
          .eq('image_type', imageType)
          .maybeSingle();

        if (likeError) throw likeError;
        setIsLiked(!!data);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [profileUserId, imageType, user]);

  const toggleLike = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour liker');
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('profile_image_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('profile_user_id', profileUserId)
          .eq('image_type', imageType);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        const { error } = await supabase
          .from('profile_image_likes')
          .insert({
            user_id: user.id,
            profile_user_id: profileUserId,
            image_type: imageType
          });

        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Erreur lors de la mise à jour du like');
    } finally {
      setIsLoading(false);
    }
  };

  return { likesCount, isLiked, isLoading, toggleLike };
};
