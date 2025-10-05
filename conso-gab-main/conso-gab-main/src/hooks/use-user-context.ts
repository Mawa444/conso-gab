import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface UserContext {
  profile: Record<string, any> | null;
  businesses: Array<Record<string, any>>;
  current_mode: Record<string, any> | null;
}

/**
 * Hook optimisé pour récupérer le contexte utilisateur complet
 * Remplace 3 requêtes séparées par 1 seule requête RPC
 * Gain: ~2000ms
 */
export const useUserContext = () => {
  return useQuery({
    queryKey: ['user-context'],
    queryFn: async (): Promise<UserContext> => {
      logger.time('user-context-fetch');
      
      const { data, error } = await supabase.rpc('get_user_context');
      
      logger.timeEnd('user-context-fetch');
      
      if (error) {
        logger.error('Failed to fetch user context', { error: error.message }, error);
        throw error;
      }

      // Parse the JSONB response
      const parsed = (typeof data === 'string' ? JSON.parse(data) : data) as any;
      
      logger.debug('User context fetched', { 
        hasProfile: !!parsed?.profile,
        businessCount: parsed?.businesses?.length || 0,
        currentMode: parsed?.current_mode?.current_mode
      });
      
      return {
        profile: parsed?.profile || null,
        businesses: parsed?.businesses || [],
        current_mode: parsed?.current_mode || null,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaced cacheTime)
    retry: 2,
  });
};
