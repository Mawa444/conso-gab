import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGeoLocation } from "@/features/geolocation/hooks/useGeoLocation";
import { useEffect, useState } from "react";

export const useRoamingFeed = (radiusMeters = 50000) => {
  const { position } = useGeoLocation();
  const [lastFetchPosition, setLastFetchPosition] = useState<{lat: number, lng: number} | null>(null);

  // Calculate distance between two points to trigger refresh
  const getDistanceFromLastFetch = () => {
    if (!position || !lastFetchPosition) return 0;
    
    const R = 6371e3;
    const φ1 = (position.latitude * Math.PI) / 180;
    const φ2 = (lastFetchPosition.lat * Math.PI) / 180;
    const Δφ = ((lastFetchPosition.lat - position.latitude) * Math.PI) / 180;
    const Δλ = ((lastFetchPosition.lng - position.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const shouldRefresh = getDistanceFromLastFetch() > 100; // Refresh if moved 100m

  const query = useInfiniteQuery({
    queryKey: ['roaming-feed', position?.latitude, position?.longitude], // Key changes with position, but we debounce manually if needed
    queryFn: async ({ pageParam = 0 }) => {
      if (!position) throw new Error("No position");
      
      const { data, error } = await supabase.rpc('get_unified_feed' as any, {
        lat: position.latitude,
        lng: position.longitude,
        radius_meters: radiusMeters,
        limit_count: 10,
        offset_count: pageParam
      });

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 10) return undefined;
      return allPages.length * 10;
    },
    enabled: !!position,
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });

  // Track fetch position
  useEffect(() => {
    if (position && !lastFetchPosition) {
      setLastFetchPosition({ lat: position.latitude, lng: position.longitude });
    } else if (position && shouldRefresh) {
      // Trigger a refresh logic if needed, or rely on React Query key change
      // React Query key includes lat/lng, so it might change too often.
      // Optimization: Round lat/lng in queryKey to avoid Micro-updates?
      // For now, let's keep it simple.
      setLastFetchPosition({ lat: position.latitude, lng: position.longitude });
    }
  }, [position]);

  return {
    ...query,
    shouldRefresh
  };
};
