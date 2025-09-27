import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ProfileMode = 'consumer' | 'business';

interface BusinessProfile {
  id: string;
  business_name: string;
  logo_url?: string;
  is_primary: boolean;
}

export const useProfileMode = () => {
  const { user } = useAuth();
  const [currentMode, setCurrentMode] = useState<ProfileMode>('consumer');
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données utilisateur au démarrage
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Charger le mode actuel
      const { data: modeData } = await supabase
        .from('user_current_mode')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (modeData) {
        setCurrentMode(modeData.current_mode as ProfileMode);
        setCurrentBusinessId(modeData.current_business_id);
      }

      // Charger les profils business de l'utilisateur
      const { data: businessList } = await supabase
        .from('business_profiles')
        .select('id, business_name, logo_url, is_primary')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (businessList) {
        setBusinessProfiles(businessList);
      }
    } catch (error) {
      console.error('Erreur chargement données utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = async (mode: ProfileMode, businessId?: string, navigate?: (path: string) => void) => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    try {
      // Mise à jour du mode dans la base de données
      const { error } = await supabase
        .from('user_current_mode')
        .upsert({
          user_id: user.id,
          current_mode: mode,
          current_business_id: businessId || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Mise à jour locale
      setCurrentMode(mode);
      setCurrentBusinessId(businessId || null);

      // Navigation automatique
      if (navigate) {
        if (mode === 'business' && businessId) {
          navigate(`/business/${businessId}`);
        } else {
          navigate('/consumer/home');
        }
      }

      const businessName = businessId ? businessProfiles.find(b => b.id === businessId)?.business_name : '';
      toast.success(
        mode === 'business' 
          ? `Basculement vers ${businessName || 'votre entreprise'}` 
          : 'Basculement vers le mode consommateur'
      );

    } catch (error: any) {
      console.error('Erreur basculement mode:', error);
      toast.error("Erreur lors du basculement de mode");
    }
  };

  const refreshBusinessProfiles = async () => {
    if (!user) return;
    
    try {
      const { data: businessList } = await supabase
        .from('business_profiles')
        .select('id, business_name, logo_url, is_primary')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (businessList) {
        setBusinessProfiles(businessList);
      }
    } catch (error) {
      console.error('Erreur refresh business profiles:', error);
    }
  };

  const getCurrentBusiness = () => {
    if (currentMode !== 'business' || !currentBusinessId) return null;
    return businessProfiles.find(bp => bp.id === currentBusinessId) || null;
  };

  return {
    currentMode,
    currentBusinessId,
    businessProfiles,
    loading,
    switchMode,
    getCurrentBusiness,
    refreshBusinessProfiles
  };
};