import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { GeoPosition, GeoLocationContextType, GeoLocationState } from './types';
import { GeoService, DEFAULT_POSITION } from './geo.service';
import { toast } from 'sonner';

const STORAGE_KEY = 'gaboma_last_position';

const GeoLocationContext = createContext<GeoLocationContextType | undefined>(undefined);

export const GeoLocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GeoLocationState>(() => {
    // Initialize from storage if available
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only use stored if less than 24h old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return {
            position: parsed,
            loading: false,
            error: null,
            permissionDenied: false,
            isTracking: false
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse stored location', e);
    }
    return {
      position: DEFAULT_POSITION,
      loading: false, // Optimistic UI: Don't block app start
      error: null,
      permissionDenied: false,
      isTracking: false
    };
  });

  const watchId = useRef<number | null>(null);

  const updatePosition = useCallback((position: GeoPosition) => {
    setState(prev => ({
      ...prev,
      position,
      loading: false,
      error: null,
      permissionDenied: false
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error('Geolocation error:', error);
    let message = 'Erreur de géolocalisation';
    let permissionDenied = false;

    if (error instanceof GeolocationPositionError) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Accès à la localisation refusé';
          permissionDenied = true;
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Position indisponible';
          break;
        case error.TIMEOUT:
          message = 'Délai d\'attente dépassé';
          break;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    setState(prev => ({
      ...prev,
      loading: false,
      error: message,
      permissionDenied
    }));

    // Toast only on explicit errors, not silent failures if we have a fallback
    if (permissionDenied) {
      toast.error(message, {
        description: "L'application utilise votre position pour afficher les commerces à proximité."
      });
    }
  }, []);

  const requestPosition = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const pos = await GeoService.getCurrentPosition();
      updatePosition(pos);
    } catch (error) {
      handleError(error);
    }
  }, [updatePosition, handleError]);

  const startTracking = useCallback(() => {
    if (watchId.current !== null) return;

    if (!navigator.geolocation) {
      handleError(new Error('GEOLOCATION_NOT_SUPPORTED'));
      return;
    }

    setState(prev => ({ ...prev, isTracking: true }));

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        updatePosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        });
      },
      (err) => handleError(err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, [updatePosition, handleError]);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  // Initial request if no valid stored position or if it's the default
  useEffect(() => {
    if (state.position === DEFAULT_POSITION) {
      requestPosition();
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <GeoLocationContext.Provider value={{
      ...state,
      requestPosition,
      startTracking,
      stopTracking
    }}>
      {children}
    </GeoLocationContext.Provider>
  );
};

export const useGeoLocation = () => {
  const context = useContext(GeoLocationContext);
  if (context === undefined) {
    throw new Error('useGeoLocation must be used within a GeoLocationProvider');
  }
  return context;
};
