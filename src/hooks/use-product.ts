import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductWithDetails {
  id: string;
  business_id: string;
  catalog_id: string | null;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean | null;
  is_active: boolean | null;
  is_available: boolean | null;
  category: string | null;
  subcategory: string | null;
  images: any;
  sku: string | null;
  barcode: string | null;
  stock_quantity: number | null;
  weight: number | null;
  dimensions: any;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  business: any | null;
}

export const useProduct = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          business:business_profiles(*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data as ProductWithDetails;
    },
    enabled: !!productId,
  });
};
