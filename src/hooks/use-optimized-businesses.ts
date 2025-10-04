import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from './use-user-location';

export const useOptimizedBusinesses = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location: userLocation, loading: locationLoading } = useUserLocation();

  // Memoize the fetch function to prevent unnecessary re-creations
  const fetchBusinesses = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Utiliser le RPC get_nearest_businesses pour trier par distance
        const { data, error: rpcError } = await supabase.rpc('get_nearest_businesses', {
          user_lat: userLocation.latitude,
          user_lng: userLocation.longitude,
          radius_meters: 50000, // 50km de rayon
          limit_count: 20
        });

        if (rpcError) throw rpcError;

        // Transform data with minimal processing
        const transformedData = data?.map((business: any) => ({
          id: business.id,
          name: business.business_name,
          type: business.business_category || 'Non spécifié',
          description: business.description,
          address: `${business.address || ''}${business.city ? ', ' + business.city : ''}`,
          verified: business.is_verified || false,
          rating: 4.5, // Default rating
          distance: business.distance_meters 
            ? business.distance_meters < 1000 
              ? `${Math.round(business.distance_meters)}m`
              : `${(business.distance_meters / 1000).toFixed(1)}km`
            : "N/A",
          distance_meters: business.distance_meters
        })) || [];

        setBusinesses(transformedData);
      } catch (err) {
        console.error('Error fetching businesses:', err);
        setError('Erreur lors du chargement des entreprises');
      } finally {
        setLoading(false);
      }
    };
  }, [userLocation.latitude, userLocation.longitude]);

  useEffect(() => {
    // Attendre que la géolocalisation soit disponible
    if (!locationLoading) {
      fetchBusinesses();
    }
  }, [fetchBusinesses, locationLoading]);

  return {
    businesses,
    loading: loading || locationLoading,
    error,
    refreshBusinesses: fetchBusinesses,
    userLocation
  };
};