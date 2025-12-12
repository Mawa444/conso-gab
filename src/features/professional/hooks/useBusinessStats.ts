

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBusinessStats = (businessId: string) => {
  return useQuery({
    queryKey: ['business-stats', businessId],
    queryFn: async () => {
      // Use the robust RPC function for server-side calculation
      // @ts-ignore - RPC created via SQL migration, types not yet generated
      const { data, error } = await supabase.rpc('get_business_stats' as any, { 
        p_business_id: businessId 
      });

      if (error) {
        console.error("Error fetching business stats:", error);
        throw error;
      }

      // RPC returns a JSONB object, we just return it directly
      // structure: { visits: number, revenue: number, rating: number, unreadMessages: number }
      return data as {
        visits: number;
        revenue: number;
        rating: number;
        unreadMessages: number;
      };
    },
    enabled: !!businessId,
    refetchInterval: 30000, // Refresh every 30s
  });
};
