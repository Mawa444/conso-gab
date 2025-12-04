import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGeoLocation } from '@/features/geolocation/hooks/useGeoLocation';
import { GeoLocationService, GeoRecommendation, GeoRecommendationsOptions } from '@/services/geoLocationService';

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

  // Stabiliser les options avec useMemo pour éviter les re-renders infinis
  const stableOptions = useMemo(() => {
    const {
      autoRefresh = true,
      refreshInterval = 0,
      initialRadius = 2,
      maxRadius = 50,
      minResults = 5,
      limit = 50
    } = options;

    return {
      autoRefresh,
      refreshInterval,
      geoOptions: { initialRadius, maxRadius, minResults, limit }
    };
  }, [
    options.autoRefresh,
    options.refreshInterval,
    options.initialRadius,
    options.maxRadius,
    options.minResults,
    options.limit
  ]);

  const fetchRecommendations = useCallback(async () => {
    if (!position) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [businessResults, catalogResults] = await Promise.all([
        GeoLocationService.getNearestBusinesses(position, stableOptions.geoOptions),
        GeoLocationService.getNearestCatalogs(position, stableOptions.geoOptions)
      ]);

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
    } catch (err: any) {
      console.error('Erreur lors de la récupération des recommandations:', err);
      setError(err.message || 'Erreur lors du chargement des recommandations');
    } finally {
      setLoading(false);
    }
  }, [position, stableOptions.geoOptions]);

  // Récupérer les recommandations au montage et quand la position change
  useEffect(() => {
    if (!positionLoading && position && stableOptions.autoRefresh) {
      fetchRecommendations();
    }
  }, [position?.latitude, position?.longitude, positionLoading, stableOptions.autoRefresh, fetchRecommendations]);

  // Rafraîchissement automatique si activé
  useEffect(() => {
    if (stableOptions.refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchRecommendations();
      }, stableOptions.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [stableOptions.refreshInterval, fetchRecommendations]);

  const refresh = useCallback(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    businesses,
    catalogs,
    loading: loading || positionLoading,
    error,
    refresh,
    lastUpdate,
    currentPosition: position
  };
};
