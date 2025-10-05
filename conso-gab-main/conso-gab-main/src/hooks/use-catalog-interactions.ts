import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Hook pour gérer les likes sur les catalogues
export const useCatalogLikes = (catalogId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likesQuery = useQuery({
    queryKey: ['catalog-likes', catalogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_likes')
        .select('*')
        .eq('catalog_id', catalogId);
      
      if (error) throw error;
      return data || [];
    }
  });

  const userLikeQuery = useQuery({
    queryKey: ['catalog-user-like', catalogId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('catalog_likes')
        .select('*')
        .eq('catalog_id', catalogId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      if (userLikeQuery.data) {
        // Unlike
        const { error } = await supabase
          .from('catalog_likes')
          .delete()
          .eq('catalog_id', catalogId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { action: 'unlike' };
      } else {
        // Like
        const { error } = await supabase
          .from('catalog_likes')
          .insert({
            catalog_id: catalogId,
            user_id: user.id
          });
        
        if (error) throw error;
        return { action: 'like' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-likes', catalogId] });
      queryClient.invalidateQueries({ queryKey: ['catalog-user-like', catalogId] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: "Impossible de traiter votre réaction",
        variant: 'destructive'
      });
    }
  });

  return {
    likes: likesQuery.data || [],
    likesCount: likesQuery.data?.length || 0,
    isLiked: !!userLikeQuery.data,
    isLoading: likesQuery.isLoading || userLikeQuery.isLoading,
    toggleLike: toggleLike.mutate,
    isToggling: toggleLike.isPending
  };
};

// Hook pour gérer les commentaires sur les catalogues
export const useCatalogComments = (catalogId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['catalog-comments', catalogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_comments')
        .select('*')
        .eq('catalog_id', catalogId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const addComment = useMutation({
    mutationFn: async ({ comment, rating }: { comment: string; rating?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from('catalog_comments')
        .insert({
          catalog_id: catalogId,
          user_id: user.id,
          comment: comment.trim(),
          rating
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-comments', catalogId] });
      toast({
        title: 'Commentaire ajouté',
        description: 'Votre commentaire a été publié avec succès'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter votre commentaire",
        variant: 'destructive'
      });
    }
  });

  return {
    comments: commentsQuery.data || [],
    commentsCount: commentsQuery.data?.length || 0,
    isLoading: commentsQuery.isLoading,
    addComment: addComment.mutate,
    isAdding: addComment.isPending
  };
};

// Hook pour gérer les likes sur les images de catalogue
export const useCatalogImageLikes = (catalogId: string, imageUrl: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likesQuery = useQuery({
    queryKey: ['catalog-image-likes', catalogId, imageUrl],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_image_likes')
        .select('*')
        .eq('catalog_id', catalogId)
        .eq('image_url', imageUrl);
      
      if (error) throw error;
      return data || [];
    }
  });

  const userLikeQuery = useQuery({
    queryKey: ['catalog-image-user-like', catalogId, imageUrl],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('catalog_image_likes')
        .select('*')
        .eq('catalog_id', catalogId)
        .eq('image_url', imageUrl)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      if (userLikeQuery.data) {
        // Unlike
        const { error } = await supabase
          .from('catalog_image_likes')
          .delete()
          .eq('catalog_id', catalogId)
          .eq('image_url', imageUrl)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { action: 'unlike' };
      } else {
        // Like
        const { error } = await supabase
          .from('catalog_image_likes')
          .insert({
            catalog_id: catalogId,
            image_url: imageUrl,
            user_id: user.id
          });
        
        if (error) throw error;
        return { action: 'like' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-image-likes', catalogId, imageUrl] });
      queryClient.invalidateQueries({ queryKey: ['catalog-image-user-like', catalogId, imageUrl] });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: "Impossible de traiter votre réaction",
        variant: 'destructive'
      });
    }
  });

  return {
    likes: likesQuery.data || [],
    likesCount: likesQuery.data?.length || 0,
    isLiked: !!userLikeQuery.data,
    isLoading: likesQuery.isLoading || userLikeQuery.isLoading,
    toggleLike: toggleLike.mutate,
    isToggling: toggleLike.isPending
  };
};

// Hook pour gérer les commentaires sur les images de catalogue
export const useCatalogImageComments = (catalogId: string, imageUrl: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['catalog-image-comments', catalogId, imageUrl],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_image_comments')
        .select('*')
        .eq('catalog_id', catalogId)
        .eq('image_url', imageUrl)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const addComment = useMutation({
    mutationFn: async ({ comment }: { comment: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from('catalog_image_comments')
        .insert({
          catalog_id: catalogId,
          image_url: imageUrl,
          user_id: user.id,
          comment: comment.trim()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-image-comments', catalogId, imageUrl] });
      toast({
        title: 'Commentaire ajouté',
        description: 'Votre commentaire a été publié avec succès'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter votre commentaire",
        variant: 'destructive'
      });
    }
  });

  return {
    comments: commentsQuery.data || [],
    commentsCount: commentsQuery.data?.length || 0,
    isLoading: commentsQuery.isLoading,
    addComment: addComment.mutate,
    isAdding: addComment.isPending
  };
};