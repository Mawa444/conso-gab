import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { debounce } from '@/utils/debounce';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

interface GeoLocationContextType {
  position: GeoPosition | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  isTracking: boolean;
  requestPosition: () => void;
  startTracking: () => void;
  stopTracking: () => void;
}

const DEFAULT_POSITION: GeoPosition = {
  latitude: 0.4162, // Libreville par défaut
  longitude: 9.4673,
  accuracy: 1000,
  timestamp: Date.now()
};

const GeoLocationContext = createContext<GeoLocationContextType | undefined>(undefined);

export const GeoLocationProvider = ({ children }: { children: ReactNode }) => {
  const [position, setPosition] = useState<GeoPosition>(DEFAULT_POSITION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Fonction de mise à jour debouncée (limite à 1 update toutes les 3 secondes)
  const debouncedPositionUpdate = useMemo(
    () => debounce((newPos: GeolocationPosition) => {
      const distance = calculateDistance(
        position.latitude,
        position.longitude,
        newPos.coords.latitude,
        newPos.coords.longitude
      );

      // Mise à jour uniquement si déplacement significatif (>50m)
      if (distance > 0.05 || position === DEFAULT_POSITION) {
        setPosition({
          latitude: newPos.coords.latitude,
          longitude: newPos.coords.longitude,
          accuracy: newPos.coords.accuracy,
          timestamp: Date.now()
        });
        setError(null);
        setPermissionDenied(false);
      }
    }, 3000),
    [position]
  );

  const handlePositionUpdate = useCallback((newPosition: GeolocationPosition) => {
    debouncedPositionUpdate(newPosition);
  }, [debouncedPositionUpdate]);

  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    setLoading(false);
    
    if (error.code === error.PERMISSION_DENIED) {
      setPermissionDenied(true);
      setError('Accès à la géolocalisation refusé. Résultats affichés pour Libreville.');
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      setError('Position indisponible. Résultats affichés pour Libreville.');
    } else if (error.code === error.TIMEOUT) {
      setError('Délai de géolocalisation dépassé. Résultats affichés pour Libreville.');
    }
  }, []);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par votre navigateur');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePositionUpdate(pos);
        setLoading(false);
      },
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, [handlePositionUpdate, handlePositionError]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation || isTracking) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        handlePositionUpdate(pos);
        setLoading(false);
      },
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    setWatchId(id);
    setIsTracking(true);
  }, [isTracking, handlePositionUpdate, handlePositionError]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
    }
  }, [watchId]);

  // Demander la position au chargement
  useEffect(() => {
    requestPosition();
  }, []);

  return (
    <GeoLocationContext.Provider
      value={{
        position,
        loading,
        error,
        permissionDenied,
        isTracking,
        requestPosition,
        startTracking,
        stopTracking
      }}
    >
      {children}
    </GeoLocationContext.Provider>
  );
};

export const useGeoLocationContext = () => {
  const context = useContext(GeoLocationContext);
  if (!context) {
    throw new Error('useGeoLocationContext must be used within GeoLocationProvider');
  }
  return context;
};

// Fonction utilitaire pour calculer la distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
