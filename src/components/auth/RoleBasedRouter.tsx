import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  role: 'consumer' | 'merchant' | null;
}

interface RoleBasedRouterProps {
  children: React.ReactNode;
}

export const RoleBasedRouter = ({ children }: RoleBasedRouterProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>({ role: null });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erreur récupération profil:', error);
          return;
        }

        setUserProfile({ role: data?.role as 'consumer' | 'merchant' || null });
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

  // Redirection automatique basée sur le rôle (selon le schéma conceptuel)
  useEffect(() => {
    if (!loading && !profileLoading && user && userProfile.role) {
      const currentPath = window.location.pathname;
      
      // Redirection stricte selon le rôle vers les tableaux de bord principaux
      if (userProfile.role === 'consumer' && !currentPath.startsWith('/consumer')) {
        navigate('/consumer/home', { replace: true });
      } else if (userProfile.role === 'merchant' && !currentPath.startsWith('/merchant')) {
        navigate('/merchant/dashboard', { replace: true });
      }
    } else if (!loading && !user) {
      const currentPath = window.location.pathname;
      
      // Les utilisateurs anonymes vont vers l'interface consommateur
      if (currentPath === '/' || currentPath.includes('/auth')) {
        // Laisser passer les pages d'accueil et d'auth
        return;
      } else if (!currentPath.startsWith('/consumer')) {
        // Rediriger les utilisateurs anonymes vers l'interface consommateur
        navigate('/consumer/home', { replace: true });
      }
    }
  }, [user, userProfile.role, loading, profileLoading, navigate]);

  // Middleware de sécurité des routes (selon le schéma conceptuel)
  useEffect(() => {
    if (!loading && !profileLoading && user && userProfile.role) {
      const currentPath = window.location.pathname;
      
      // Vérification stricte des accès selon le rôle
      if (currentPath.startsWith('/merchant') && userProfile.role !== 'merchant') {
        navigate('/consumer/home', { replace: true });
      } else if (currentPath.startsWith('/consumer') && userProfile.role === 'merchant') {
        navigate('/merchant/dashboard', { replace: true });
      }
    }
  }, [user, userProfile.role, loading, profileLoading, navigate, window.location.pathname]);

  // Afficher loader pendant la vérification
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary via-secondary to-accent">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};