import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type ProductWithDetails = Tables<'products'> & {
  business: Tables<'business_profiles'> | null;
  reviews: Tables<'reviews'>[];
};

export const useProduct = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          business:business_profiles(*),
          reviews(*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data as ProductWithDetails;
    },
    enabled: !!productId,
  });
};
