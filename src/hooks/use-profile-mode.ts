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
  role: string;
  is_owner: boolean;
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

  // Initialisation et synchronisation des données
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const initializeData = async () => {
      setLoading(true);
      try {
        // 1. Charger les profils business d'abord
        await fetchBusinessProfiles();
        
        // 2. Charger ou initialiser le mode utilisateur
        await fetchOrInitializeUserMode();
        
      } catch (error) {
        console.error('Erreur initialisation mode profil:', error);
        toast.error("Erreur lors du chargement des profils");
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    // 3. Abonnement temps réel pour synchroniser entre onglets
    const channel = supabase
      .channel('user-mode-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_current_mode', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        const data = payload.new || payload.old;
        if (data && typeof data === 'object') {
          setCurrentMode((data as any).current_mode as ProfileMode);
          setCurrentBusinessId((data as any).current_business_id || null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchOrInitializeUserMode = async () => {
    if (!user) return;

    try {
      // Essayer de récupérer le mode existant
      const { data, error } = await supabase
        .from('user_current_mode')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur récupération mode:', error);
        return;
      }

      if (data) {
        // Mode existant trouvé
        setCurrentMode(data.current_mode as ProfileMode);
        setCurrentBusinessId(data.current_business_id || null);
      } else {
        // Pas de mode défini, initialiser en mode consommateur
        await supabase
          .from('user_current_mode')
          .insert({
            user_id: user.id,
            current_mode: 'consumer',
            current_business_id: null
          });
        
        setCurrentMode('consumer');
        setCurrentBusinessId(null);
      }
    } catch (error) {
      console.error('Erreur initialisation mode:', error);
    }
  };

  const fetchBusinessProfiles = async () => {
    if (!user) return;

    try {
      // Récupérer TOUS les business profiles où l'utilisateur est propriétaire ou collaborateur
      const { data: businessData, error } = await supabase
        .from('business_profiles')
        .select(`
          id, 
          business_name, 
          logo_url, 
          is_primary,
          user_id,
          business_collaborators!inner(role, status)
        `)
        .eq('business_collaborators.user_id', user.id)
        .eq('business_collaborators.status', 'accepted')
        .eq('is_active', true);

      if (error) {
        console.error('Erreur récupération business profiles:', error);
        return;
      }

      if (businessData) {
        const businesses = businessData.map(business => ({
          id: business.id,
          business_name: business.business_name,
          logo_url: business.logo_url,
          is_primary: business.is_primary || false,
          role: (business.business_collaborators as any)[0]?.role || 'viewer',
          is_owner: business.user_id === user.id
        }));
        
        setBusinessProfiles(businesses);
      } else {
        setBusinessProfiles([]);
      }
    } catch (error) {
      console.error('Erreur récupération business profiles:', error);
      setBusinessProfiles([]);
    }
  };

  const switchMode = async (mode: ProfileMode, businessId?: string, navigate?: (path: string) => void) => {
    if (!user) {
      toast.error("Vous devez être connecté pour changer de mode");
      return;
    }

    // Validation pour le mode business
    if (mode === 'business' && businessId) {
      const business = businessProfiles.find(bp => bp.id === businessId);
      if (!business) {
        toast.error("Profil business non trouvé");
        return;
      }
    }

    try {
      console.log(`Basculement vers mode ${mode}`, businessId ? `(business: ${businessId})` : '');
      
      // Mise à jour en base de données
      const { error } = await supabase
        .from('user_current_mode')
        .upsert({
          user_id: user.id,
          current_mode: mode,
          current_business_id: businessId || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erreur DB lors du basculement:', error);
        throw new Error('Impossible de changer de mode');
      }

      // Mise à jour immédiate du state local
      setCurrentMode(mode);
      setCurrentBusinessId(businessId || null);

      // Notification de succès
      const businessName = businessId ? businessProfiles.find(bp => bp.id === businessId)?.business_name : '';
      toast.success(mode === 'business' 
        ? `Basculement vers ${businessName}` 
        : `Basculement vers le mode consommateur`);

      // Redirection si nécessaire
      if (navigate) {
        setTimeout(() => {
          if (mode === 'business' && businessId) {
            navigate(`/business/${businessId}`);
          } else if (mode === 'consumer') {
            navigate('/consumer/home');
          }
        }, 500);
      }

    } catch (error: any) {
      console.error('Erreur changement mode:', error);
      toast.error(error.message || "Impossible de changer de mode");
    }
  };

  const getCurrentBusiness = () => {
    if (currentMode !== 'business' || !currentBusinessId) return null;
    return businessProfiles.find(bp => bp.id === currentBusinessId) || null;
  };

  const isOwnerOfBusiness = (businessId: string) => {
    const business = businessProfiles.find(bp => bp.id === businessId);
    return business?.is_owner === true;
  };

  const canAccessBusinessPro = (businessId: string) => {
    return isOwnerOfBusiness(businessId);
  };

  return {
    currentMode,
    currentBusinessId,
    businessProfiles,
    loading,
    switchMode,
    getCurrentBusiness,
    isOwnerOfBusiness,
    canAccessBusinessPro,
    refreshBusinessProfiles: fetchBusinessProfiles
  };
};