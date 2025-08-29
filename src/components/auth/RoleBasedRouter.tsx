import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ModeGuard } from './ModeGuard';

interface UserProfile {
  role: 'consumer' | 'merchant' | null;
  pseudo?: string | null;
}

interface RoleBasedRouterProps {
  children: React.ReactNode;
}

export const RoleBasedRouter = ({ children }: RoleBasedRouterProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>({ role: null, pseudo: null });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role, pseudo')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erreur récupération profil:', error);
          return;
        }

        setUserProfile({ role: (data?.role as 'consumer' | 'merchant') || null, pseudo: data?.pseudo ?? null });
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user && !loading) {
      fetchUserProfile();
    }
  }, [user, loading]);

  // Redirection vers auth si pas connecté - IMMÉDIATE
  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      
      // Redirection IMMÉDIATE vers /auth si l'utilisateur n'est pas connecté
      if (!currentPath.startsWith('/auth') && !currentPath.startsWith('/splash')) {
        console.log("Utilisateur non connecté, redirection vers /auth");
        navigate('/auth', { replace: true });
        return;
      }
    }
  }, [loading, user, navigate]);

  // Redirection automatique selon le rôle après connexion
  useEffect(() => {
    if (!loading && !profileLoading && user && userProfile.role) {
      const currentPath = window.location.pathname;
      
      // Rediriger depuis la racine ou auth vers l'espace approprié
      if (currentPath === '/' || currentPath.startsWith('/auth')) {
        // Interface unifiée pour tous les rôles (la navigation spécifique business est gérée par switchMode)
        navigate('/consumer/home', { replace: true });
      }
    }
  }, [loading, profileLoading, user, userProfile.role, navigate]);

  // Plus de restrictions basées sur les rôles - tous les utilisateurs connectés ont accès à tout

  return <ModeGuard>{children}</ModeGuard>;
}