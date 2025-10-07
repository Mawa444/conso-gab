import { useState, useEffect, useCallback } from 'react';
import { useGeoLocationContext } from '@/contexts/GeoLocationContext';
import { GeoLocationService, GeoRecommendation, GeoRecommendationsOptions } from '@/services/geoLocationService';

interface UseGeoRecommendationsOptions extends GeoRecommendationsOptions {
  autoRefresh?: boolean; // Actualiser automatiquement quand la position change
  refreshInterval?: number; // Intervalle de rafraîchissement en ms (0 = désactivé)
}

export const useGeoRecommendations = (options: UseGeoRecommendationsOptions = {}) => {
  const { position, loading: positionLoading } = useGeoLocationContext();
  const [businesses, setBusinesses] = useState<GeoRecommendation<any>[]>([]);
  const [catalogs, setCatalogs] = useState<GeoRecommendation<any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const {
    autoRefresh = true,
    refreshInterval = 0,
    ...geoOptions
  } = options;

  const fetchRecommendations = useCallback(async () => {
    if (!position) return;

    setLoading(true);
    setError(null);

    try {
      // Récupérer les entreprises et catalogues en parallèle
      const [businessResults, catalogResults] = await Promise.all([
        GeoLocationService.getNearestBusinesses(position, geoOptions),
        GeoLocationService.getNearestCatalogs(position, geoOptions)
      ]);

      setBusinesses(businessResults);
      setCatalogs(catalogResults);
      setLastUpdate(Date.now());
    } catch (err: any) {
      console.error('Erreur lors de la récupération des recommandations:', err);
      setError(err.message || 'Erreur lors du chargement des recommandations');
    } finally {
      setLoading(false);
    }
  }, [position, geoOptions]);

  // Récupérer les recommandations au montage et quand la position change
  useEffect(() => {
    if (!positionLoading && position && autoRefresh) {
      fetchRecommendations();
    }
  }, [position?.latitude, position?.longitude, positionLoading, autoRefresh, fetchRecommendations]);

  // Rafraîchissement automatique si activé
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchRecommendations();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchRecommendations]);

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
