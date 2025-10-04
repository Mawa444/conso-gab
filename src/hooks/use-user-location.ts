import { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setError(null);
        setLoading(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        setError('Impossible d\'obtenir votre position');
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

  return { location, loading, error };
};
