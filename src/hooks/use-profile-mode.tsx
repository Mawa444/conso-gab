import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ProfileMode = 'consumer' | 'business';

export interface BusinessProfile {
  id: string;
  business_name: string;
  logo_url?: string;
  is_primary: boolean;
  role: 'owner';
  is_owner: true;
}

interface ProfileModeContextValue {
  currentMode: ProfileMode;
  currentBusinessId: string | null;
  businessProfiles: BusinessProfile[];
  loading: boolean;
  switchMode: (mode: ProfileMode, businessId?: string) => Promise<void>;
  getCurrentBusiness: () => BusinessProfile | null;
  isOwnerOfBusiness: (businessId: string) => boolean;
  refreshBusinessProfiles: () => Promise<void>;
  canAccessBusinessPro: (businessId: string) => boolean;
}

const ProfileModeContext = createContext<ProfileModeContextValue | undefined>(undefined);

export const useProfileMode = (): ProfileModeContextValue => {
  const context = useContext(ProfileModeContext);
  if (!context) {
    throw new Error('useProfileMode must be used within ProfileModeProvider');
  }
  return context;
};

export const ProfileModeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [currentMode, setCurrentMode] = useState<ProfileMode>('consumer');
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBusinessProfiles = useCallback(async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('business_profiles')
      .select('id, business_name, logo_url, is_primary')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) return [];

    return data.map(row => ({
      id: row.id,
      business_name: row.business_name,
      logo_url: row.logo_url ?? undefined,
      is_primary: Boolean(row.is_primary),
      role: 'owner' as const,
      is_owner: true as const,
    }));
  }, [user]);

  const loadCurrentMode = useCallback(async () => {
    if (!user) return { mode: 'consumer' as ProfileMode, businessId: null };

    const { data, error } = await supabase
      .from('user_current_mode')
      .select('current_mode, current_business_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      return {
        mode: (data.current_mode as ProfileMode) || 'consumer',
        businessId: data.current_business_id || null,
      };
    }

    // Initialize if not exists
    await supabase.from('user_current_mode').insert({
      user_id: user.id,
      current_mode: 'consumer',
      current_business_id: null,
    });

    return { mode: 'consumer', businessId: null };
  }, [user]);

  const initialize = useCallback(async () => {
    if (!user) {
      setCurrentMode('consumer');
      setCurrentBusinessId(null);
      setBusinessProfiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [profiles, modeData] = await Promise.all([
        loadBusinessProfiles(),
        loadCurrentMode(),
      ]);

      setBusinessProfiles(profiles);
      setCurrentMode(modeData.mode as ProfileMode);
      setCurrentBusinessId(modeData.businessId);
    } catch (err) {
      console.error('Profile mode init failed', err);
      toast.error('Erreur de chargement du profil');
      setCurrentMode('consumer');
      setCurrentBusinessId(null);
      setBusinessProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [user, loadBusinessProfiles, loadCurrentMode]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const switchMode = useCallback(
    async (mode: ProfileMode, businessId?: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');

      if (mode === 'business') {
        if (!businessId) throw new Error('businessId required for business mode');
        const business = businessProfiles.find(b => b.id === businessId);
        if (!business) throw new Error('Business not accessible');
      }

      const { error } = await supabase.rpc('switch_user_profile', {
        profile_id: businessId || null,
      });

      if (error) throw error;

      // Update local state immediately for responsiveness
      setCurrentMode(mode);
      setCurrentBusinessId(businessId || null);

      // Success feedback
      const name = businessId
        ? businessProfiles.find(b => b.id === businessId)?.business_name
        : '';
      toast.success(
        mode === 'business'
          ? `Mode entreprise activé${name ? ` : ${name}` : ''}`
          : 'Mode consommateur activé'
      );
    },
    [user, businessProfiles]
  );

  const getCurrentBusiness = useCallback(() => {
    if (currentMode !== 'business' || !currentBusinessId) return null;
    return businessProfiles.find(b => b.id === currentBusinessId) || null;
  }, [currentMode, currentBusinessId, businessProfiles]);

  const isOwnerOfBusiness = useCallback(
    (businessId: string) => {
      return businessProfiles.some(b => b.id === businessId && b.is_owner);
    },
    [businessProfiles]
  );

  const refreshBusinessProfiles = useCallback(async () => {
    if (!user) return;
    const profiles = await loadBusinessProfiles();
    setBusinessProfiles(profiles);
  }, [user, loadBusinessProfiles]);

  const canAccessBusinessPro = useCallback(
    (businessId: string) => {
      // L'utilisateur peut accéder au Pro si:
      // 1. Il est en mode business
      // 2. Le businessId est le business actuel
      // 3. Il est propriétaire de ce business
      return (
        currentMode === 'business' && 
        currentBusinessId === businessId && 
        isOwnerOfBusiness(businessId)
      );
    },
    [currentMode, currentBusinessId, isOwnerOfBusiness]
  );

  return (
    <ProfileModeContext.Provider
      value={{
        currentMode,
        currentBusinessId,
        businessProfiles,
        loading,
        switchMode,
        getCurrentBusiness,
        isOwnerOfBusiness,
        refreshBusinessProfiles,
        canAccessBusinessPro,
      }}
    >
      {children}
    </ProfileModeContext.Provider>
  );
};
