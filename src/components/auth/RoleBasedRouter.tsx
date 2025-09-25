import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ModeGuard } from './ModeGuard';
import { useProfileMode } from '@/hooks/use-profile-mode';

interface UserProfile {
  role: 'consumer' | 'merchant' | null;
  pseudo?: string | null;
}

interface RoleBasedRouterProps {
  children: React.ReactNode;
}

export const RoleBasedRouter = ({ children }: RoleBasedRouterProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<UserProfile>({ role: null, pseudo: null });
  const [profileLoading, setProfileLoading] = useState(true);
  const { currentMode, currentBusinessId, loading: modeLoading } = useProfileMode();

  // Charger le profil utilisateur
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role, pseudo')
          .eq('user_id', user.id)
          .single();

        // Gérer le cas où le profil n'existe pas encore (code PGRST116 = "no rows returned")
        if (error && error.code !== 'PGRST116') {
          console.error('Erreur lors de la récupération du profil:', error);
        }

        setUserProfile({
          role: (data?.role as 'consumer' | 'merchant') || null,
          pseudo: data?.pseudo ?? null,
        });
      } catch (error) {
        console.error('Erreur inattendue:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // État global de chargement
  const globalLoading = authLoading || profileLoading || modeLoading;

  // 1. Redirection vers /auth si non connecté (sauf sur /auth ou /splash)
  useEffect(() => {
    console.log('🔍 RoleBasedRouter - Debug:', { 
      globalLoading, 
      user: !!user, 
      pathname: location.pathname 
    });
    
    if (!globalLoading && !user) {
      const isAuthRoute = location.pathname.startsWith('/auth');
      const isSplashRoute = location.pathname === '/splash';

      if (!isAuthRoute && !isSplashRoute) {
        console.log('⚠️ Utilisateur non connecté, redirection vers /auth');
        navigate('/auth', { replace: true });
      }
    }
  }, [globalLoading, user, navigate, location.pathname]);

  // 2. Redirection après connexion vers l'espace approprié
  useEffect(() => {
    if (!globalLoading && user) {
      const isAuthRoute = location.pathname.startsWith('/auth');
      const isRoot = location.pathname === '/';
      const isSplash = location.pathname === '/splash';

      // Rediriger uniquement depuis /, /auth, ou /splash
      if (isRoot || isAuthRoute || isSplash) {
        let targetPath = '/consumer/home';

        // Rediriger vers l'espace business si mode actif ET ID valide
        if (currentMode === 'business' && currentBusinessId) {
          targetPath = `/business/${currentBusinessId}`;
        }

        // Éviter la redirection si déjà sur la bonne page
        if (location.pathname !== targetPath) {
          console.log(`Redirection vers ${targetPath}`);
          navigate(targetPath, { replace: true });
        }
      }
    }
  }, [globalLoading, user, currentMode, currentBusinessId, navigate, location.pathname]);

  // Afficher un loader ou rien pendant le chargement
  if (globalLoading) {
    return null; // ou <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  // Rendre les enfants une fois tout chargé (sans restriction de rôle)
  return <ModeGuard>{children}</ModeGuard>;
};