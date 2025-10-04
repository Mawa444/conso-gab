import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LngLatBounds } from 'maplibre-gl';

export interface MapBusiness {
  id: string;
  business_name: string;
  business_category: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  is_active: boolean;
  distance_meters?: number;
}

interface UseMapBusinessesReturn {
  businesses: MapBusiness[];
  loading: boolean;
  error: string | null;
  fetchBusinessesInBounds: (bounds: LngLatBounds) => Promise<void>;
  fetchNearestBusinesses: (lat: number, lng: number, radiusMeters?: number) => Promise<void>;
}

/**
 * Hook pour récupérer les entreprises via PostGIS
 * - fetchBusinessesInBounds: pour viewport (bbox)
 * - fetchNearestBusinesses: pour proximité utilisateur
 */
export const useMapBusinesses = (): UseMapBusinessesReturn => {
  const [businesses, setBusinesses] = useState<MapBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère les entreprises dans un bbox (viewport)
   */
  const fetchBusinessesInBounds = useCallback(async (bounds: LngLatBounds) => {
    try {
      setLoading(true);
      setError(null);

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const { data, error: rpcError } = await supabase.rpc('get_businesses_in_bbox', {
        min_lng: sw.lng,
        min_lat: sw.lat,
        max_lng: ne.lng,
        max_lat: ne.lat,
        limit_count: 500
      });

      if (rpcError) throw rpcError;

      setBusinesses(data || []);
    } catch (err: any) {
      console.error('Erreur fetch businesses bbox:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère les entreprises les plus proches
   */
  const fetchNearestBusinesses = useCallback(async (
    lat: number, 
    lng: number, 
    radiusMeters: number = 20000
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_nearest_businesses', {
        user_lat: lat,
        user_lng: lng,
        radius_meters: radiusMeters,
        limit_count: 100
      });

      if (rpcError) throw rpcError;

      setBusinesses(data || []);
    } catch (err: any) {
      console.error('Erreur fetch businesses proximité:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    businesses,
    loading,
    error,
    fetchBusinessesInBounds,
    fetchNearestBusinesses
  };
};
