import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const hasFetched = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const fetchRecommendations = useCallback(async (pos: typeof position) => {
    // Utiliser la position fournie ou la position par défaut
    const effectivePosition = pos || DEFAULT_POSITION;

    setLoading(true);
    setError(null);

    try {
      const [businessResults, catalogResults] = await Promise.all([
        GeoLocationService.getNearestBusinesses(effectivePosition, stableOptions.geoOptions),
        GeoLocationService.getNearestCatalogs(effectivePosition, stableOptions.geoOptions)
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
      hasFetched.current = true;
    } catch (err: any) {
      console.error('Erreur lors de la récupération des recommandations:', err);
      setError(err.message || 'Erreur lors du chargement des recommandations');
    } finally {
      setLoading(false);
    }
  }, [stableOptions.geoOptions]);

  // Récupérer les recommandations au montage et quand la position change
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si on a une position valide (pas la position par défaut), charger immédiatement
    if (position && position !== DEFAULT_POSITION) {
      fetchRecommendations(position);
      return;
    }

    // Si le chargement de position est terminé ou si on attend trop longtemps
    // utiliser la position par défaut après 2 secondes max
    if (!positionLoading) {
      fetchRecommendations(position);
    } else {
      // Timeout de sécurité : charger avec position par défaut après 2s
      timeoutRef.current = setTimeout(() => {
        if (!hasFetched.current) {
          fetchRecommendations(DEFAULT_POSITION);
        }
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [position?.latitude, position?.longitude, positionLoading, fetchRecommendations]);

  // Rafraîchissement automatique si activé
  useEffect(() => {
    if (stableOptions.refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchRecommendations(position);
      }, stableOptions.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [stableOptions.refreshInterval, fetchRecommendations, position]);

  const refresh = useCallback(() => {
    fetchRecommendations(position);
  }, [fetchRecommendations, position]);

  // Ne montrer loading que si on n'a pas encore chargé les données
  const isLoading = loading && !hasFetched.current;

  return {
    businesses,
    catalogs,
    loading: isLoading,
    error,
    refresh,
    lastUpdate,
    currentPosition: position
  };
};
