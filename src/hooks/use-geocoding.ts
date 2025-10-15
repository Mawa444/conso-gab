import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createDomainLogger } from '@/lib/logger';

const logger = createDomainLogger('Geocoding');

interface DetailedLocation {
  country: string;
  countryCode: string;
  region: string;
  province: string;
  city: string;
  district?: string;
  neighborhood?: string;
  suburb?: string;
  village?: string;
  postcode?: string;
  road?: string;
  houseNumber?: string;
  latitude: number;
  longitude: number;
  displayName: string;
  formattedAddress: string;
}

interface GeolocationResult {
  location: DetailedLocation | null;
  isLoading: boolean;
  error: string | null;
}

export const useGeocoding = () => {
  const [result, setResult] = useState<GeolocationResult>({
    location: null,
    isLoading: false,
    error: null
  });

  const reverseGeocode = async (latitude: number, longitude: number): Promise<DetailedLocation | null> => {
    setResult(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Utiliser l'API Nominatim (OpenStreetMap) pour le géocodage inversé
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=fr`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données géographiques');
      }

      const data = await response.json();
      
      if (!data || !data.address) {
        throw new Error('Aucune adresse trouvée pour cette position');
      }

      const address = data.address;
      
      const detailedLocation: DetailedLocation = {
        country: address.country || 'Gabon',
        countryCode: address.country_code?.toUpperCase() || 'GA',
        region: address.state || address.region || '',
        province: address.state || address.region || '',
        city: address.city || address.town || address.village || '',
        district: address.suburb || address.district || '',
        neighborhood: address.neighbourhood || address.quarter || '',
        suburb: address.suburb || '',
        village: address.village || '',
        postcode: address.postcode || '',
        road: address.road || address.street || '',
        houseNumber: address.house_number || '',
        latitude,
        longitude,
        displayName: data.display_name || '',
        formattedAddress: formatAddress(address)
      };

      // Stocker les nouvelles données géographiques pour enrichir la base
      await storeNewLocationData(detailedLocation);

      setResult({
        location: detailedLocation,
        isLoading: false,
        error: null
      });

      return detailedLocation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setResult({
        location: null,
        isLoading: false,
        error: errorMessage
      });
      
      toast.error(`Géolocalisation: ${errorMessage}`);
      return null;
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  };

  const getDetailedLocation = async (): Promise<DetailedLocation | null> => {
    try {
      setResult(prev => ({ ...prev, isLoading: true, error: null }));
      
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      return await reverseGeocode(latitude, longitude);
    } catch (error) {
      let message = 'Erreur lors de la récupération de votre position';
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position indisponible. Vérifiez votre connexion GPS.';
            break;
          case error.TIMEOUT:
            message = 'Délai d\'attente dépassé. Réessayez.';
            break;
        }
      }
      
      setResult({
        location: null,
        isLoading: false,
        error: message
      });
      
      toast.error(message);
      return null;
    }
  };

  return {
    ...result,
    getDetailedLocation,
    reverseGeocode
  };
};

// Fonction utilitaire pour formater une adresse lisible
const formatAddress = (address: any): string => {
  const parts = [];
  
  if (address.house_number && address.road) {
    parts.push(`${address.house_number} ${address.road}`);
  } else if (address.road) {
    parts.push(address.road);
  }
  
  if (address.neighbourhood || address.quarter) {
    parts.push(address.neighbourhood || address.quarter);
  }
  
  if (address.suburb && address.suburb !== (address.neighbourhood || address.quarter)) {
    parts.push(address.suburb);
  }
  
  if (address.city || address.town || address.village) {
    parts.push(address.city || address.town || address.village);
  }
  
  if (address.state || address.region) {
    parts.push(address.state || address.region);
  }
  
  if (address.country) {
    parts.push(address.country);
  }
  
  return parts.filter(Boolean).join(', ');
};

// Fonction pour stocker les nouvelles données géographiques
const storeNewLocationData = async (location: DetailedLocation) => {
  try {
    // Pour l'instant, on enregistre seulement dans les logs en attendant la création des tables
    logger.debug('Nouvelle localisation détectée', {
      country: location.country,
      region: location.region,
      city: location.city,
      neighborhood: location.neighborhood,
      formattedAddress: location.formattedAddress,
      coordinates: [location.latitude, location.longitude]
    });

    // Les tables geographic_* seront créées plus tard pour enrichir la base de données géographique
    // TODO: Implémenter le stockage en base une fois les tables créées
  } catch (error) {
    logger.warn('Erreur lors du stockage des données géographiques', { error });
  }
};