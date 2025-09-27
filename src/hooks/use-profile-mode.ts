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

  // Initialisation des données à la connexion
  useEffect(() => {
    if (!user) {
      // Pas d'utilisateur connecté, réinitialiser en mode consommateur
      setCurrentMode('consumer');
      setCurrentBusinessId(null);
      setBusinessProfiles([]);
      setLoading(false);
      return;
    }

    const initializeUserProfile = async () => {
      try {
        setLoading(true);
        
        // 1. Charger les profils business disponibles
        await loadBusinessProfiles();
        
        // 2. Charger ou initialiser le mode actuel
        await loadCurrentMode();
        
      } catch (error) {
        console.error('Erreur initialisation profil:', error);
        toast.error("Erreur lors du chargement du profil");
        
        // En cas d'erreur, revenir en mode consommateur
        setCurrentMode('consumer');
        setCurrentBusinessId(null);
      } finally {
        setLoading(false);
      }
    };

    initializeUserProfile();

    // Abonnement aux changements de mode en temps réel
    const channel = supabase
      .channel('profile-mode-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_current_mode',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Changement de mode détecté:', payload);
        const data = payload.new || payload.old;
        if (data && typeof data === 'object') {
          const newMode = (data as any).current_mode as ProfileMode;
          const newBusinessId = (data as any).current_business_id || null;
          
          setCurrentMode(newMode);
          setCurrentBusinessId(newBusinessId);
          
          console.log(`Mode mis à jour: ${newMode}, Business: ${newBusinessId}`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadBusinessProfiles = async () => {
    if (!user) return;

    try {
      console.log('Chargement des profils business...');
      
      // Utiliser la fonction RPC sécurisée
      const { data, error } = await supabase.rpc('get_my_business_profiles');

      if (error) {
        console.error('Erreur chargement profils business:', error);
        setBusinessProfiles([]);
        return;
      }

      console.log('Profils business chargés:', data);
      setBusinessProfiles(data || []);
      
    } catch (error) {
      console.error('Erreur loadBusinessProfiles:', error);
      setBusinessProfiles([]);
    }
  };

  const loadCurrentMode = async () => {
    if (!user) return;

    try {
      console.log('Chargement du mode actuel...');
      
      // Charger le mode depuis user_current_mode
      const { data, error } = await supabase
        .from('user_current_mode')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement mode:', error);
        return;
      }

      if (data) {
        console.log('Mode existant trouvé:', data);
        setCurrentMode(data.current_mode as ProfileMode);
        setCurrentBusinessId(data.current_business_id || null);
      } else {
        console.log('Aucun mode défini, initialisation en mode consommateur');
        // Initialiser en mode consommateur si aucun mode n'est défini
        setCurrentMode('consumer');
        setCurrentBusinessId(null);
        
        // Créer l'entrée en base
        await supabase
          .from('user_current_mode')
          .insert({
            user_id: user.id,
            current_mode: 'consumer',
            current_business_id: null
          });
      }
      
    } catch (error) {
      console.error('Erreur loadCurrentMode:', error);
      // En cas d'erreur, mode consommateur par défaut
      setCurrentMode('consumer');
      setCurrentBusinessId(null);
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

    try {
      console.log(`🔄 Tentative de basculement vers: ${mode}`, businessId ? `(${businessId})` : '');

      // Validation du profil business si nécessaire
      if (mode === 'business' && businessId) {
        const business = businessProfiles.find(bp => bp.id === businessId);
        if (!business) {
          toast.error("Profil business non accessible");
          console.error('Profil business non trouvé:', businessId);
          return;
        }
        console.log('✅ Profil business validé:', business.business_name);
      }

      // Utiliser la fonction RPC sécurisée pour basculer
      const { data, error } = await supabase.rpc('switch_user_profile', {
        profile_id: businessId || null
      });

      if (error) {
        console.error('❌ Erreur RPC switch_user_profile:', error);
        throw new Error(error.message || 'Impossible de basculer de profil');
      }

      console.log('✅ Basculement réussi:', data);

      // Mise à jour immédiate du state local pour la réactivité
      setCurrentMode(mode);
      setCurrentBusinessId(businessId || null);

      // Notification de succès
      const businessName = businessId ? businessProfiles.find(bp => bp.id === businessId)?.business_name : '';
      const message = mode === 'business' 
        ? `Vous êtes maintenant en mode ${businessName}` 
        : `Vous êtes maintenant en mode consommateur`;
      
      toast.success(message);

      // Redirection avec délai pour permettre la synchronisation
      if (navigate) {
        setTimeout(() => {
          if (mode === 'business' && businessId) {
            console.log(`🔄 Redirection vers /business/${businessId}`);
            navigate(`/business/${businessId}`);
          } else if (mode === 'consumer') {
            console.log('🔄 Redirection vers /consumer/home');
            navigate('/consumer/home');
          }
        }, 200);
      }

    } catch (error: any) {
      console.error('❌ Erreur changement mode:', error);
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
    refreshBusinessProfiles: loadBusinessProfiles
  };
};