import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessCustomer {
  id: string;
  customer_id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  status: string;
  tags: string[];
  notes: string;
  total_spent: number;
  total_orders: number;
  last_interaction_at: string;
  created_at: string;
}

export const useBusinessCustomers = (businessId: string, search?: string, status?: string) => {
  return useQuery({
    queryKey: ['business-customers', businessId, search, status],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_business_customers' as any, {
        p_business_id: businessId,
        p_search: search || null,
        p_status: status || null,
        p_limit: 50
      });

      if (error) throw error;
      return data as BusinessCustomer[];
    },
    enabled: !!businessId
  });
};

export const useBusinessFeatures = (businessId: string) => {
  const queryClient = useQueryClient();

  const toggleFeature = useMutation({
    mutationFn: async ({ key, enabled }: { key: string, enabled: boolean }) => {
      const { data, error } = await supabase.rpc('toggle_business_feature' as any, {
        p_business_id: businessId,
        p_feature_key: key,
        p_is_enabled: enabled
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-profile', businessId] }); // Refresh business profile to get new settings
    }
  });

  return { toggleFeature };
};
