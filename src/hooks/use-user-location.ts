import { useState, useEffect, useCallback } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

const DEFAULT_LOCATION: UserLocation = {
  latitude: 0.4162, // Libreville par défaut
  longitude: 9.4673,
  accuracy: 1000
};

export const useUserLocation = () => {
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setError(null);
        setPermissionDenied(false);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError('Vous avez refusé l\'accès à votre position. Les résultats sont affichés autour de Libreville.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setError('Votre position est actuellement indisponible. Les résultats sont affichés autour de Libreville.');
        } else if (error.code === error.TIMEOUT) {
          setError('La demande de géolocalisation a expiré. Les résultats sont affichés autour de Libreville.');
        } else {
          setError('Impossible d\'obtenir votre position. Les résultats sont affichés autour de Libreville.');
        }
        
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    const cleanup = requestLocation();
    return cleanup;
  }, [requestLocation]);

  const retryLocation = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

  return { 
    location, 
    loading, 
    error, 
    permissionDenied,
    retryLocation 
  };
};
