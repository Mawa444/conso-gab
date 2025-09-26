import { useState, useCallback } from "react";
import { useRealBusinesses, type RealBusiness } from "@/hooks/use-real-businesses";

interface NearestCommerceFilters {
  category?: string;
  priceRange?: string;
  rating?: number;
  verified?: boolean;
  openNow?: boolean;
  maxDistance?: number;
}

interface UseNearestCommerceReturn {
  findNearestCommerce: (filters: NearestCommerceFilters) => RealBusiness | null;
  findNearestByCategory: (categoryId: string) => RealBusiness | null;
  findTopRatedNearby: (limit?: number) => RealBusiness[];
}

export const useNearestCommerce = (userLat?: number, userLng?: number): UseNearestCommerceReturn => {
  const { businesses } = useRealBusinesses();
  const [userLocation] = useState({ lat: userLat || 0.4162, lng: userLng || 9.4673 });

  const calculateDistance = useCallback((business: RealBusiness): number => {
    if (!business.latitude || !business.longitude) return 999; // Si pas de coordonnées, distance très élevée
    
    const R = 6371; // Rayon de la Terre en km
    const dLat = (business.latitude - userLocation.lat) * Math.PI / 180;
    const dLon = (business.longitude - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(business.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, [userLocation]);

  const findNearestCommerce = useCallback((filters: NearestCommerceFilters): RealBusiness | null => {
    let filteredBusinesses = businesses;

    // Filtrer par catégorie
    if (filters.category && filters.category !== "all") {
      filteredBusinesses = businesses.filter(b => b.category === filters.category);
    }

    // Appliquer les autres filtres
    filteredBusinesses = filteredBusinesses.filter(business => {
      if (filters.verified !== undefined && business.is_verified !== filters.verified) return false;
      
      if (filters.maxDistance) {
        const distance = calculateDistance(business);
        if (distance > filters.maxDistance) return false;
      }
      
      return true;
    });

    // Trouver le plus proche
    if (filteredBusinesses.length === 0) return null;

    return filteredBusinesses.reduce((nearest, current) => {
      const currentDistance = calculateDistance(current);
      const nearestDistance = calculateDistance(nearest);
      return currentDistance < nearestDistance ? current : nearest;
    });
  }, [businesses, calculateDistance]);

  const findNearestByCategory = useCallback((categoryId: string): RealBusiness | null => {
    return findNearestCommerce({ category: categoryId });
  }, [findNearestCommerce]);

  const findTopRatedNearby = useCallback((limit: number = 5): RealBusiness[] => {
    const businessesWithDistance = businesses
      .filter(business => business.latitude && business.longitude)
      .map(business => {
        const dist = calculateDistance(business);
        return {
          ...business,
          distance: dist
        };
      });

    return businessesWithDistance
      .filter(business => business.distance <= 5) // Dans un rayon de 5km
      .sort((a, b) => {
        // Trier par vérification d'abord, puis par distance
        if (a.is_verified && !b.is_verified) return -1;
        if (!a.is_verified && b.is_verified) return 1;
        return a.distance - b.distance;
      })
      .slice(0, limit);
  }, [businesses, calculateDistance]);

  return {
    findNearestCommerce,
    findNearestByCategory,
    findTopRatedNearby
  };
};