import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeoLocation } from '@/features/geolocation/hooks/useGeoLocation';
import { GeoLocationService, GeoRecommendation, GeoRecommendationsOptions } from '@/services/geoLocationService';
import { DEFAULT_POSITION } from '@/features/geolocation/geo.service';

interface UseGeoRecommendationsOptions extends GeoRecommendationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useGeoRecommendations = (options: UseGeoRecommendationsOptions = {}) => {
  const { position, loading: positionLoading } = useGeoLocation();
  const [businesses, setBusinesses] = useState<GeoRecommendation<any>[]>([]);
  const [catalogs, setCatalogs] = useState<GeoRecommendation<any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const isMounted = useRef(true);
  const hasInitialFetch = useRef(false);

  const {
    autoRefresh = true,
    refreshInterval = 0,
    initialRadius = 2,
    maxRadius = 50,
    minResults = 5,
    limit = 50
  } = options;

  const geoOptions = { initialRadius, maxRadius, minResults, limit };

  const fetchRecommendations = useCallback(async () => {
    // Utiliser la position réelle ou la position par défaut
    const effectivePosition = position || DEFAULT_POSITION;

    setLoading(true);
    setError(null);

    try {
      const [businessResults, catalogResults] = await Promise.all([
        GeoLocationService.getNearestBusinesses(effectivePosition, geoOptions),
        GeoLocationService.getNearestCatalogs(effectivePosition, geoOptions)
      ]);

      if (!isMounted.current) return;

      // S'assurer que les données incluent carousel_images et cover_image_url
      const enrichedBusinesses = businessResults.map(result => ({
        ...result,
        item: {
          ...result.item,
          carousel_images: result.item.carousel_images || [],
          cover_image_url: result.item.cover_image_url || null
        }
      }));

      setBusinesses(enrichedBusinesses);
      setCatalogs(catalogResults);
      setLastUpdate(Date.now());
      hasInitialFetch.current = true;
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error('Erreur lors de la récupération des recommandations:', err);
      setError(err.message || 'Erreur lors du chargement des recommandations');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [position?.latitude, position?.longitude, initialRadius, maxRadius, minResults, limit]);

  // Effet principal : charger les données au montage
  useEffect(() => {
    isMounted.current = true;

    // Ne pas attendre la géolocalisation - charger immédiatement
    if (!hasInitialFetch.current) {
      fetchRecommendations();
    }

    return () => {
      isMounted.current = false;
    };
  }, []); // Seulement au montage

  // Recharger quand la position change (après le premier chargement)
  useEffect(() => {
    if (hasInitialFetch.current && position && !positionLoading) {
      fetchRecommendations();
    }
  }, [position?.latitude, position?.longitude, positionLoading]);

  // Rafraîchissement automatique si activé
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchRecommendations, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchRecommendations]);

  const refresh = useCallback(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    businesses,
    catalogs,
    loading,
    error,
    refresh,
    lastUpdate,
    currentPosition: position
  };
};
