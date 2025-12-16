import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface BusinessDetail {
  id: string;
  name: string;
  type: string;
  owner?: string;
  address: string;
  rating: number;
  verified: boolean;
  employees?: string[];
  reviewCount: number;
  phone: string;
  whatsapp?: string;
  website?: string;
  email?: string;
  description: string;
  openingHours: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
  };
  certifications: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  city?: string;
  district?: string;
}

export const defaultBusiness: BusinessDetail = {
  id: "",
  name: "",
  type: "",
  address: "",
  rating: 4.5,
  verified: false,
  reviewCount: 0,
  phone: "",
  description: "",
  openingHours: "Lundi à Vendredi : 8h00 - 18h00",
  socialMedia: {},
  certifications: [],
  coordinates: {
    lat: 0.4162,
    lng: 9.4673
  }
};

interface UseBusinessDetailResult {
  business: BusinessDetail | null;
  isLoading: boolean;
  businessData: {
    isSleeping: boolean;
    isScheduledForDeletion: boolean;
    deletionDate: string | null;
  };
  images: {
    logoUrl: string | null;
    coverUrl: string | null;
    carouselImages: string[];
    logoUploadDate: string | null;
    coverUploadDate: string | null;
  };
  refresh: () => Promise<void>;
  updateBusinessData: (data: Partial<{ isSleeping: boolean }>) => void;
  updateCarouselImages: (images: string[]) => void;
}

export const useBusinessDetail = (businessId?: string): UseBusinessDetailResult => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  
  // Business Metadata State
  const [businessData, setBusinessData] = useState({
    isSleeping: false,
    isScheduledForDeletion: false,
    deletionDate: null as string | null
  });

  // Images State
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [logoUploadDate, setLogoUploadDate] = useState<string | null>(null);
  const [coverUploadDate, setCoverUploadDate] = useState<string | null>(null);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);

  const fetchBusinessData = async () => {
    if (!user || !businessId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('business_profiles')
        .select(`
          id, business_name, business_category, address, 
          phone, whatsapp, website, email, description, 
          is_sleeping, deactivation_scheduled_at, is_deactivated, 
          logo_url, cover_image_url, logo_updated_at, cover_updated_at, 
          carousel_images, city, district
        `)
        .eq('id', businessId)
        .single();

      if (error) {
        console.error('Error loading business profile:', error);
        toast.error("Impossible de charger le profil business");
        setBusiness(null);
        return;
      }

      if (data) {
        // Map database response to BusinessDetail interface
        const mappedBusiness: BusinessDetail = {
          ...defaultBusiness,
          id: data.id,
          name: data.business_name || 'Commerce sans nom',
          type: data.business_category || 'Activité non spécifiée',
          address: data.address || 'Adresse non renseignée',
          city: data.city,
          district: data.district,
          phone: data.phone || '',
          whatsapp: data.whatsapp || undefined,
          website: data.website || undefined,
          email: data.email || undefined,
          description: data.description || 'Aucune description disponible'
        };

        setBusiness(mappedBusiness);

        setBusinessData({
          isSleeping: data.is_sleeping || false,
          isScheduledForDeletion: !!data.deactivation_scheduled_at,
          deletionDate: data.deactivation_scheduled_at
        });

        setLogoUrl(data.logo_url || null);
        setCoverUrl(data.cover_image_url || null);
        setLogoUploadDate(data.logo_updated_at || null);
        setCoverUploadDate(data.cover_updated_at || null);
        
        const cImages = Array.isArray(data.carousel_images)
          ? (data.carousel_images as string[])
          : [];
        setCarouselImages(cImages);
      }
    } catch (error) {
      console.error('Unexpected error loading business data:', error);
      toast.error("Une erreur inconnue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, [businessId, user]);

  const updateBusinessData = (newData: Partial<{ isSleeping: boolean }>) => {
    setBusinessData(prev => ({ ...prev, ...newData }));
  };

  const updateCarouselImages = (newImages: string[]) => {
    setCarouselImages(newImages);
  };

  return {
    business,
    isLoading,
    businessData,
    images: {
      logoUrl,
      coverUrl,
      carouselImages,
      logoUploadDate,
      coverUploadDate
    },
    refresh: fetchBusinessData,
    updateBusinessData,
    updateCarouselImages // Expose this
  };
};
