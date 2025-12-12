
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGeoLocation } from '@/features/geolocation/hooks/useGeoLocation';

type RecommendationType = 'business' | 'catalog' | 'product' | 'story';

interface UseGeoRecommendationsOptions {
  type: RecommendationType;
  radiusMeters?: number;
  limit?: number;
  searchQuery?: string;
  categoryFilter?: string; // Only for business type
  enabled?: boolean;
}

export const useGeoRecommendations = ({
  type,
  radiusMeters = 50000,
  limit = 20,
  searchQuery,
  categoryFilter,
  enabled = true,
}: UseGeoRecommendationsOptions) => {
  const { position, loading: geoLoading, error: geoError } = useGeoLocation();

  return useQuery({
    queryKey: ['geo-recommendations', type, position?.latitude, position?.longitude, radiusMeters, limit, searchQuery, categoryFilter],
    queryFn: async () => {
      if (!position) throw new Error('Position not available');

      let rpcName: 'get_nearest_businesses' | 'get_nearest_catalogs' | 'get_nearest_products' | 'get_nearest_stories';
      const params: any = {
        lat: position.latitude,
        lng: position.longitude,
        radius_meters: radiusMeters,
        limit_count: limit,
        // offset_count: 0 // TODO: Add pagination support
        search_query: searchQuery || null,
      };

      switch (type) {
        case 'business':
          rpcName = 'get_nearest_businesses';
          params.category_filter = categoryFilter || null;
          break;
        case 'catalog':
          rpcName = 'get_nearest_catalogs';
          break;
        case 'product':
          rpcName = 'get_nearest_products';
          break;
        case 'story':
          rpcName = 'get_nearest_stories';
          break;
      }

      // Manual types in supabase-override.d.ts ensure this works
      const { data, error } = await supabase.rpc(rpcName as any, params);

      if (error) {
        console.error(`Error fetching nearest ${type}:`, error);
        throw error;
      }

      return data;
    },
    enabled: enabled && !!position && !geoLoading,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
