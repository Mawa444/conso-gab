import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type ProfileMode = 'consumer' | 'business';

interface BusinessProfile {
  id: string;
  business_name: string;
  logo_url?: string;
  is_primary: boolean;
}

interface UserCurrentMode {
  current_mode: ProfileMode;
  current_business_id?: string;
}

export const useProfileMode = () => {
  const { user } = useAuth();
  const [currentMode, setCurrentMode] = useState<ProfileMode>('consumer');
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate depuis le cache local immédiatement pour synchroniser toutes les instances
    try {
      const cached = localStorage.getItem('gaboma.profile_mode');
      if (cached) {
        const parsed = JSON.parse(cached) as { current_mode?: ProfileMode; current_business_id?: string | null };
        if (parsed?.current_mode) setCurrentMode(parsed.current_mode);
        if (parsed?.current_business_id !== undefined) setCurrentBusinessId(parsed.current_business_id || null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchUserMode();
    fetchBusinessProfiles();

    // Abonnement temps réel au changement de mode
    const channel = supabase
      .channel('user-mode-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_current_mode', filter: `user_id=eq.${user.id}` }, (payload) => {
        const row: any = payload.new || payload.old;
        if (row) {
          const newMode = (row.current_mode ?? currentMode) as ProfileMode;
          const newBizId = row.current_business_id ?? null;
          setCurrentMode(newMode);
          setCurrentBusinessId(newBizId);

          // Mettre en cache
          try {
            localStorage.setItem('gaboma.profile_mode', JSON.stringify({
              current_mode: newMode,
              current_business_id: newBizId,
            }));
          } catch {}
        }
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {}
    };
  }, [user]);

  const fetchUserMode = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_current_mode')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur récupération mode:', error);
        return;
      }

      if (data) {
        setCurrentMode(data.current_mode as ProfileMode);
        setCurrentBusinessId(data.current_business_id);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessProfiles = async () => {
    if (!user) return;

    try {
      // Récupérer les business où l'utilisateur est collaborateur
      const { data: collaborators, error: collabError } = await supabase
        .from('business_collaborators')
        .select('business_id, role')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (collabError) {
        console.error('Erreur récupération business:', collabError);
        return;
      }

      if (collaborators && collaborators.length > 0) {
        // Récupérer les détails des business
        const businessIds = collaborators.map(c => c.business_id);
        const { data: businessData, error: businessError } = await supabase
          .from('business_profiles')
          .select('id, business_name, logo_url, is_primary')
          .in('id', businessIds);

        if (businessError) {
          console.error('Erreur récupération business details:', businessError);
          return;
        }

        if (businessData) {
          const businesses = businessData.map(business => {
            const collab = collaborators.find(c => c.business_id === business.id);
            return {
              id: business.id,
              business_name: business.business_name,
              logo_url: business.logo_url,
              is_primary: business.is_primary,
              role: collab?.role || 'viewer'
            };
          });
          
          setBusinessProfiles(businesses);
        }
      }
    } catch (error) {
      console.error('Erreur récupération business profiles:', error);
    }
  };

  const switchMode = async (mode: ProfileMode, businessId?: string, navigate?: (path: string) => void) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('switch_user_mode', {
        new_mode: mode,
        business_id_param: businessId || null
      });

      if (error) {
        throw error;
      }

      setCurrentMode(mode);
      setCurrentBusinessId(businessId || null);

      // Mettre en cache immédiatement pour synchroniser toutes les instances
      try {
        localStorage.setItem('gaboma.profile_mode', JSON.stringify({
          current_mode: mode,
          current_business_id: businessId || null,
        }));
      } catch {}
      

      // Redirection automatique selon le mode
      if (navigate) {
        if (mode === 'business' && businessId) {
          navigate(`/business/${businessId}`);
        } else if (mode === 'consumer') {
          navigate('/consumer/home');
        }
      }
      
      toast({
        title: "Mode changé avec succès",
        description: mode === 'business' 
          ? `Vous êtes maintenant en mode professionnel` 
          : `Vous êtes maintenant en mode consommateur`,
      });

    } catch (error: any) {
      console.error('Erreur changement mode:', error);
      toast({
        title: "Erreur de changement de mode",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
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
    refreshBusinessProfiles: fetchBusinessProfiles
  };
};