import { supabase } from '@/integrations/supabase/client';
import { GeoPosition } from '@/features/geolocation/types';

export interface GeoItem {
  id: string;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: any;
}

export interface GeoRecommendation<T extends GeoItem> {
  item: T;
  distance: number;
  distanceFormatted: string;
}

export interface GeoRecommendationsOptions {
  initialRadius?: number; // en km
  maxRadius?: number; // en km
  minResults?: number;
  limit?: number;
}

const DEFAULT_OPTIONS: Required<GeoRecommendationsOptions> = {
  initialRadius: 2, // 2km par défaut
  maxRadius: 50, // 50km maximum
  minResults: 5, // Minimum 5 résultats si possible
  limit: 50
};

/**
 * Service intelligent de géolocalisation
 * Gère les recommandations basées sur la position avec élargissement automatique du rayon
 */
export class GeoLocationService {
  /**
   * Récupère les entreprises les plus proches avec élargissement automatique du rayon
   */
  static async getNearestBusinesses(
    userPosition: GeoPosition,
    options: GeoRecommendationsOptions = {}
  ): Promise<GeoRecommendation<any>[]> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let currentRadius = opts.initialRadius * 1000; // Convertir en mètres
    const maxRadiusMeters = opts.maxRadius * 1000;
    let results: any[] = [];

    // Élargir progressivement le rayon jusqu'à avoir suffisamment de résultats
    while (results.length < opts.minResults && currentRadius <= maxRadiusMeters) {
      try {
        // La fonction RPC attend: lat, lng, radius_meters, limit_count
        const { data, error } = await (supabase as any).rpc('get_nearest_businesses', {
          lat: userPosition.latitude,
          lng: userPosition.longitude,
          radius_meters: Math.round(currentRadius),
          limit_count: opts.limit
        });

        if (error) {
          console.error('RPC Error:', error);
          // Fallback: requête directe sans géolocalisation
          const { data: fallbackData } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('is_active', true)
            .eq('is_sleeping', false)
            .order('created_at', { ascending: false })
            .limit(opts.limit);
          
          results = (fallbackData || []).map(b => ({
            ...b,
            distance_meters: 0
          }));
          break;
        }

        results = data || [];

        // Si on a assez de résultats, arrêter
        if (results.length >= opts.minResults) break;

        // Sinon, doubler le rayon
        currentRadius = Math.min(currentRadius * 2, maxRadiusMeters);
      } catch (error) {
        console.error('Erreur lors de la récupération des entreprises:', error);
        break;
      }
    }

    // Transformer en recommandations avec distance formatée
    return results.map(business => ({
      item: {
        id: business.id,
        business_name: business.business_name,
        business_category: business.business_category,
        description: business.description,
        address: business.address,
        city: business.city,
        phone: business.phone,
        email: business.email,
        logo_url: business.logo_url,
        cover_image_url: business.cover_image_url,
        carousel_images: business.carousel_images || [],
        latitude: business.latitude,
        longitude: business.longitude,
        is_verified: business.is_verified,
        is_active: business.is_active
      },
      distance: business.distance_meters / 1000, // Convertir en km
      distanceFormatted: this.formatDistance(business.distance_meters)
    }));
  }

  /**
   * Récupère les catalogues les plus proches
   */
  static async getNearestCatalogs(
    userPosition: GeoPosition,
    options: GeoRecommendationsOptions = {}
  ): Promise<GeoRecommendation<any>[]> {
    const businesses = await this.getNearestBusinesses(userPosition, options);
    
    // Récupérer les catalogues des entreprises proches
    const businessIds = businesses.map(b => b.item.id);
    
    if (businessIds.length === 0) return [];

    try {
      const { data: catalogs, error } = await supabase
        .from('catalogs')
        .select(`
          *,
          business:business_profiles!inner(
            id,
            business_name,
            latitude,
            longitude
          )
        `)
        .in('business_id', businessIds)
        .eq('is_active', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculer la distance pour chaque catalogue basé sur la position de l'entreprise
      return (catalogs || []).map(catalog => {
        const business = businesses.find(b => b.item.id === catalog.business_id);
        return {
          item: catalog,
          distance: business?.distance || 0,
          distanceFormatted: business?.distanceFormatted || 'Distance inconnue'
        };
      }).sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Erreur lors de la récupération des catalogues:', error);
      return [];
    }
  }

  /**
   * Filtre et trie des items par distance
   */
  static filterByDistance<T extends GeoItem>(
    items: T[],
    userPosition: GeoPosition,
    radiusKm: number
  ): GeoRecommendation<T>[] {
    return items
      .filter(item => item.latitude && item.longitude)
      .map(item => {
        const distance = this.calculateDistance(
          userPosition.latitude,
          userPosition.longitude,
          item.latitude!,
          item.longitude!
        );
        return {
          item,
          distance,
          distanceFormatted: this.formatDistance(distance * 1000)
        };
      })
      .filter(rec => rec.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Calcule la distance entre deux points (formule de Haversine)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Formate une distance pour l'affichage
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Convertit des degrés en radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Vérifie si une position est valide
   */
  static isValidPosition(lat?: number | null, lon?: number | null): boolean {
    return lat !== null && 
           lat !== undefined && 
           lon !== null && 
           lon !== undefined &&
           lat >= -90 && 
           lat <= 90 && 
           lon >= -180 && 
           lon <= 180;
  }
}
