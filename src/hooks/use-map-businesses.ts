import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LngLatBounds } from "maplibre-gl";

export interface MapBusiness {
  id: string;
  business_name: string;
  business_category: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  is_active: boolean;
  distance_meters?: number;
}

interface UseMapBusinessesOptions {
  autoFetch?: boolean;
  initialBounds?: LngLatBounds;
}

export const useMapBusinesses = (options: UseMapBusinessesOptions = {}) => {
  const { autoFetch = true, initialBounds } = options;
  const [businesses, setBusinesses] = useState<MapBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBounds, setCurrentBounds] = useState<LngLatBounds | null>(
    initialBounds || null
  );

  const fetchBusinessesInBounds = useCallback(async (bounds: LngLatBounds) => {
    setLoading(true);
    setError(null);

    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      // Try RPC first, fallback to direct query
      try {
        const { data, error: fetchError } = await (supabase as any).rpc(
          "get_businesses_in_bbox",
          {
            min_lng: sw.lng,
            min_lat: sw.lat,
            max_lng: ne.lng,
            max_lat: ne.lat,
            limit_count: 500,
          }
        );

        if (!fetchError && data) {
          setBusinesses(data as MapBusiness[]);
          return;
        }
      } catch {
        // RPC doesn't exist, use fallback
      }

      // Fallback: query business_profiles directly
      const { data, error: fetchError } = await supabase
        .from('business_profiles')
        .select('id, business_name, business_category, description, address, city, phone, email, logo_url, latitude, longitude, is_verified, is_active')
        .eq('is_active', true)
        .gte('longitude', sw.lng)
        .lte('longitude', ne.lng)
        .gte('latitude', sw.lat)
        .lte('latitude', ne.lat)
        .limit(500);

      if (fetchError) throw fetchError;

      setBusinesses((data || []).filter(b => b.latitude && b.longitude) as MapBusiness[]);
    } catch (err: any) {
      console.error("Error fetching businesses:", err);
      setError(err.message || "Erreur lors du chargement des entreprises");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNearestBusinesses = useCallback(
    async (lat: number, lng: number, radiusMeters: number = 20000) => {
      setLoading(true);
      setError(null);

      try {
        // Try RPC first
        try {
          const { data, error: fetchError } = await (supabase as any).rpc(
            "get_nearest_businesses",
            {
              user_lat: lat,
              user_lng: lng,
              radius_meters: radiusMeters,
              limit_count: 100,
            }
          );

          if (!fetchError && data) {
            setBusinesses(data as MapBusiness[]);
            return;
          }
        } catch {
          // RPC doesn't exist, use fallback
        }

        // Fallback: get all active businesses with coordinates
        const { data, error: fetchError } = await supabase
          .from('business_profiles')
          .select('id, business_name, business_category, description, address, city, phone, email, logo_url, latitude, longitude, is_verified, is_active')
          .eq('is_active', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .limit(100);

        if (fetchError) throw fetchError;

        setBusinesses((data || []) as MapBusiness[]);
      } catch (err: any) {
        console.error("Error fetching nearest businesses:", err);
        setError(err.message || "Erreur lors du chargement des entreprises");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch automatique si initialBounds fourni
  useEffect(() => {
    if (autoFetch && currentBounds) {
      fetchBusinessesInBounds(currentBounds);
    }
  }, [autoFetch, currentBounds, fetchBusinessesInBounds]);

  return {
    businesses,
    loading,
    error,
    fetchBusinessesInBounds,
    fetchNearestBusinesses,
    setCurrentBounds,
  };
};
