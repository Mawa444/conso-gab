/**
 * Hooks pour les Business Stories
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BusinessStory, StoryInsert, StoryUpdate } from "../types";
import { toast } from "sonner";

// Fetch public active stories (non expirées)
export const usePublicStories = (options?: {
  city?: string;
  storyType?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['public-stories', options],
    queryFn: async () => {
      let query = (supabase as any)
        .from('business_stories')
        .select(`
          *,
          business_profiles (
            id,
            business_name,
            logo_url,
            business_category,
            city,
            quartier
          )
        `)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (options?.city) {
        query = query.eq('geo_city', options.city);
      }
      
      if (options?.storyType) {
        query = query.eq('story_type', options.storyType);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map((story: any) => ({
        ...story,
        images: Array.isArray(story.images) ? story.images : []
      })) as BusinessStory[];
    },
    refetchInterval: 60000 // Refetch every minute to check expiry
  });
};

// Fetch stories for a specific business
export const useBusinessStories = (businessId: string) => {
  return useQuery({
    queryKey: ['business-stories', businessId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('business_stories')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((story: any) => ({
        ...story,
        images: Array.isArray(story.images) ? story.images : []
      })) as BusinessStory[];
    },
    enabled: !!businessId
  });
};

// Create a new story
export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (story: StoryInsert) => {
      const { data, error } = await (supabase as any)
        .from('business_stories')
        .insert(story)
        .select()
        .single();

      if (error) throw error;
      return data as BusinessStory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business-stories', data.business_id] });
      queryClient.invalidateQueries({ queryKey: ['public-stories'] });
      toast.success("Story publiée avec succès!");
    },
    onError: (error) => {
      console.error('Error creating story:', error);
      toast.error("Erreur lors de la publication de la story");
    }
  });
};

// Update a story
export const useUpdateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: StoryUpdate) => {
      const { data, error } = await (supabase as any)
        .from('business_stories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as BusinessStory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business-stories', data.business_id] });
      queryClient.invalidateQueries({ queryKey: ['public-stories'] });
      toast.success("Story mise à jour");
    },
    onError: (error) => {
      console.error('Error updating story:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  });
};

// Delete a story
export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, businessId }: { id: string; businessId: string }) => {
      const { error } = await (supabase as any)
        .from('business_stories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, businessId };
    },
    onSuccess: ({ businessId }) => {
      queryClient.invalidateQueries({ queryKey: ['business-stories', businessId] });
      queryClient.invalidateQueries({ queryKey: ['public-stories'] });
      toast.success("Story supprimée");
    },
    onError: (error) => {
      console.error('Error deleting story:', error);
      toast.error("Erreur lors de la suppression");
    }
  });
};

// Record a story view
export const useRecordStoryView = () => {
  return useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await (supabase as any)
        .from('story_views')
        .insert({ story_id: storyId });

      if (error) throw error;
    }
  });
};
