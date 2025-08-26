import { useState, useCallback } from "react";
import { allCommerces, getCommercesByCategory } from "@/data/mockCommerces";
import type { Commerce } from "@/data/mockCommerces";

interface NearestCommerceFilters {
  category?: string;
  priceRange?: string;
  rating?: number;
  verified?: boolean;
  openNow?: boolean;
  maxDistance?: number;
}

interface UseNearestCommerceReturn {
  findNearestCommerce: (filters: NearestCommerceFilters) => Commerce | null;
  findNearestByCategory: (categoryId: string) => Commerce | null;
  findNearestByPrice: (priceRange: string) => Commerce | null;
  findNearestByRating: (minRating: number) => Commerce | null;
  findTopRatedNearby: (limit?: number) => Commerce[];
  findCheapestNearby: (limit?: number) => Commerce[];
  findOpenNearby: (limit?: number) => Commerce[];
}

export const useNearestCommerce = (userLat?: number, userLng?: number): UseNearestCommerceReturn => {
  const [userLocation] = useState({ lat: userLat || 0.4162, lng: userLng || 9.4673 });

  const calculateDistance = useCallback((commerce: Commerce): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (commerce.coordinates.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (commerce.coordinates.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(commerce.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, [userLocation]);

  const findNearestCommerce = useCallback((filters: NearestCommerceFilters): Commerce | null => {
    let filteredCommerces = allCommerces;

    // Filtrer par catégorie
    if (filters.category && filters.category !== "all") {
      filteredCommerces = getCommercesByCategory(filters.category);
    }

    // Appliquer les autres filtres
    filteredCommerces = filteredCommerces.filter(commerce => {
      if (filters.priceRange && commerce.priceRange !== filters.priceRange) return false;
      if (filters.rating && commerce.rating < filters.rating) return false;
      if (filters.verified !== undefined && commerce.verified !== filters.verified) return false;
      if (filters.openNow !== undefined && commerce.openNow !== filters.openNow) return false;
      
      if (filters.maxDistance) {
        const distance = calculateDistance(commerce);
        if (distance > filters.maxDistance) return false;
      }
      
      return true;
    });

    // Trouver le plus proche
    if (filteredCommerces.length === 0) return null;

    return filteredCommerces.reduce((nearest, current) => {
      const currentDistance = calculateDistance(current);
      const nearestDistance = calculateDistance(nearest);
      return currentDistance < nearestDistance ? current : nearest;
    });
  }, [calculateDistance]);

  const findNearestByCategory = useCallback((categoryId: string): Commerce | null => {
    return findNearestCommerce({ category: categoryId });
  }, [findNearestCommerce]);

  const findNearestByPrice = useCallback((priceRange: string): Commerce | null => {
    return findNearestCommerce({ priceRange });
  }, [findNearestCommerce]);

  const findNearestByRating = useCallback((minRating: number): Commerce | null => {
    return findNearestCommerce({ rating: minRating });
  }, [findNearestCommerce]);

  const findTopRatedNearby = useCallback((limit: number = 5): Commerce[] => {
    const commercesWithDistance = allCommerces.map(commerce => {
      const dist = calculateDistance(commerce);
      return {
        ...commerce,
        distance: `${dist.toFixed(1)}km`
      };
    });

    return commercesWithDistance
      .filter(commerce => parseFloat(commerce.distance.replace('km', '')) <= 5) // Dans un rayon de 5km
      .sort((a, b) => b.rating - a.rating || parseFloat(a.distance.replace('km', '')) - parseFloat(b.distance.replace('km', '')))
      .slice(0, limit);
  }, [calculateDistance]);

  const findCheapestNearby = useCallback((limit: number = 5): Commerce[] => {
    const priceOrder = { "€": 1, "€€": 2, "€€€": 3 };
    
    const commercesWithDistance = allCommerces.map(commerce => {
      const dist = calculateDistance(commerce);
      return {
        ...commerce,
        distance: `${dist.toFixed(1)}km`,
        priceValue: priceOrder[commerce.priceRange as keyof typeof priceOrder] || 2
      };
    });

    return commercesWithDistance
      .filter(commerce => parseFloat(commerce.distance.replace('km', '')) <= 5)
      .sort((a, b) => a.priceValue - b.priceValue || parseFloat(a.distance.replace('km', '')) - parseFloat(b.distance.replace('km', '')))
      .slice(0, limit)
      .map(({ priceValue, ...commerce }) => commerce);
  }, [calculateDistance]);

  const findOpenNearby = useCallback((limit: number = 5): Commerce[] => {
    const commercesWithDistance = allCommerces.map(commerce => {
      const dist = calculateDistance(commerce);
      return {
        ...commerce,
        distance: `${dist.toFixed(1)}km`
      };
    });

    return commercesWithDistance
      .filter(commerce => commerce.openNow && parseFloat(commerce.distance.replace('km', '')) <= 3) // Ouvert et dans 3km
      .sort((a, b) => parseFloat(a.distance.replace('km', '')) - parseFloat(b.distance.replace('km', '')))
      .slice(0, limit);
  }, [calculateDistance]);

  return {
    findNearestCommerce,
    findNearestByCategory,
    findNearestByPrice,
    findNearestByRating,
    findTopRatedNearby,
    findCheapestNearby,
    findOpenNearby
  };
};