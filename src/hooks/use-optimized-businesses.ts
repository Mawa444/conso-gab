import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from './use-user-location';

export const useOptimizedBusinesses = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location: userLocation, loading: locationLoading } = useUserLocation();

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Requête directe avec calcul de distance
      const { data, error: fetchError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('is_active', true)
        .eq('is_sleeping', false)
        .eq('is_deactivated', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      // Calculer la distance et trier
      const transformedData = data?.map((business: any) => {
        const lat1 = userLocation.latitude;
        const lon1 = userLocation.longitude;
        const lat2 = business.latitude || 0.4162;
        const lon2 = business.longitude || 9.4673;
        
        // Formule de Haversine pour distance précise
        const R = 6371e3; // Rayon de la Terre en mètres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distanceMeters = R * c;

        return {
          id: business.id,
          name: business.business_name,
          type: business.business_category || 'Non spécifié',
          description: business.description,
          address: `${business.address || ''}${business.city ? ', ' + business.city : ''}`,
          verified: business.is_verified || false,
          rating: 4.5,
          distance: distanceMeters < 1000 
            ? `${Math.round(distanceMeters)}m`
            : `${(distanceMeters / 1000).toFixed(1)}km`,
          distance_meters: distanceMeters,
          logo_url: business.logo_url,
          whatsapp: business.whatsapp,
          cover_image_url: business.cover_image_url
        };
      }).sort((a, b) => a.distance_meters - b.distance_meters) || [];

      setBusinesses(transformedData);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
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