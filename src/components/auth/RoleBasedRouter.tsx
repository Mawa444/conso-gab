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

  // Redirection automatique basée sur le rôle
  useEffect(() => {
    if (!loading && !profileLoading && user && userProfile.role) {
      const currentPath = window.location.pathname;
      
      // Redirection vers l'interface appropriée
      if (userProfile.role === 'consumer' && !currentPath.includes('/consumer')) {
        navigate('/consumer', { replace: true });
      } else if (userProfile.role === 'merchant' && !currentPath.includes('/merchant')) {
        navigate('/merchant', { replace: true });
      }
    } else if (!loading && !user) {
      // Redirection vers auth si pas connecté
      const publicPaths = ['/auth', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        navigate('/auth', { replace: true });
      }
    }
  }, [user, userProfile.role, loading, profileLoading, navigate]);

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