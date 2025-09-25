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
  const [profileLoading, setProfileLoading] = useState(false);
  const { currentMode, currentBusinessId, loading: modeLoading } = useProfileMode();

  // Chargement global synchronisé
  const globalLoading = authLoading || profileLoading || modeLoading;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role, pseudo')
          .eq('user_id', user.id)
          .maybeSingle(); // Utilisation de maybeSingle au lieu de single

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur récupération profil:', error);
          return;
        }

        // Gestion du cas où le profil n'existe pas encore (nouveau user)
        if (!data) {
          setUserProfile({ role: 'consumer', pseudo: null }); // Rôle par défaut
        } else {
          setUserProfile({ role: (data.role as 'consumer' | 'merchant') || 'consumer', pseudo: data.pseudo ?? null });
        }
      } catch (error) {
        console.error('Erreur:', error);
        setUserProfile({ role: 'consumer', pseudo: null }); // Fallback sécurisé
      } finally {
        setProfileLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  // Redirection vers auth si pas connecté - IMMÉDIATE
  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = location.pathname;
      
      // Redirection IMMÉDIATE vers /auth si l'utilisateur n'est pas connecté
      if (!currentPath.startsWith('/auth') && !currentPath.startsWith('/splash')) {
        console.log("Utilisateur non connecté, redirection vers /auth");
        navigate('/auth', { replace: true });
        return;
      }
    }
  }, [authLoading, user, navigate, location.pathname]);

  // Redirection automatique selon le rôle après connexion (uniquement initiale)
  useEffect(() => {
    if (!globalLoading && user && userProfile.role) {
      const currentPath = location.pathname;
      
      // Rediriger UNIQUEMENT depuis la racine ou auth vers l'espace approprié
      if (currentPath === '/' || currentPath.startsWith('/auth')) {
        let targetPath: string;
        
        if (currentMode === 'business' && currentBusinessId) {
          targetPath = `/business/${currentBusinessId}`;
        } else {
          targetPath = '/consumer/home';
        }
        
        // Éviter les redirections inutiles
        if (currentPath !== targetPath) {
          console.log(`Redirection initiale vers ${targetPath}`);
          navigate(targetPath, { replace: true });
        }
      }
    }
  }, [globalLoading, user, userProfile.role, currentMode, currentBusinessId, navigate, location.pathname]);

  // Affichage du loading global pour éviter le flash de contenu
  if (globalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Plus de restrictions basées sur les rôles - tous les utilisateurs connectés ont accès à tout

  return <ModeGuard>{children}</ModeGuard>;
}