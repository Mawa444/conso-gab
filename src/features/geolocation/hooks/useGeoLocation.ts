import { useGeoLocation } from '../GeoContext';
import { GeoService } from '../geo.service';
import { useMemo } from 'react';

export { useGeoLocation };

export const useDistance = (targetLat: number, targetLng: number) => {
  const { position } = useGeoLocation();

  return useMemo(() => {
    if (!position) return null;
    return GeoService.calculateDistance(
      position.latitude,
      position.longitude,
      targetLat,
      targetLng
    );
  }, [position, targetLat, targetLng]);
};
