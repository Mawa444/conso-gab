import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';

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

  // Chargement global synchronisé
  const globalLoading = authLoading || profileLoading;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role, pseudo')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur récupération profil:', error);
          setUserProfile({ role: 'consumer', pseudo: null });
          return;
        }

        // Gestion du cas où le profil n'existe pas encore (nouveau user)
        if (!data) {
          setUserProfile({ role: 'consumer', pseudo: null });
        } else {
          setUserProfile({ 
            role: (data.role as 'consumer' | 'merchant') || 'consumer', 
            pseudo: data.pseudo ?? null 
          });
        }
      } catch (error) {
        console.error('Erreur:', error);
        setUserProfile({ role: 'consumer', pseudo: null });
      } finally {
        setProfileLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  // Redirection vers auth si pas connecté
  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = location.pathname;
      
      if (!currentPath.startsWith('/auth')) {
        console.log("Utilisateur non connecté, redirection vers /auth");
        navigate('/auth', { replace: true });
        return;
      }
    }
  }, [authLoading, user, navigate, location.pathname]);

  // Redirection initiale après connexion
  useEffect(() => {
    if (!globalLoading && user && userProfile.role) {
      const currentPath = location.pathname;
      
      // Rediriger uniquement depuis la racine ou auth
      if (currentPath === '/' || currentPath.startsWith('/auth')) {
        const targetPath = '/consumer/home';
        console.log(`Redirection initiale vers ${targetPath}`);
        navigate(targetPath, { replace: true });
      }
    }
  }, [globalLoading, user, userProfile.role, navigate, location.pathname]);

  // Affichage du loading
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

  return <>{children}</>;
};