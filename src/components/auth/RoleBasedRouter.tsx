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

  // Redirection automatique vers la page d'accueil commune
  useEffect(() => {
    if (!loading && !profileLoading) {
      const currentPath = window.location.pathname;
      
      // Tous les utilisateurs (connectés ou anonymes) vont sur la page d'accueil commune
      if (currentPath === '/' || currentPath.includes('/auth')) {
        // Laisser passer les pages d'accueil et d'auth
        return;
      } else if (!currentPath.startsWith('/consumer') && !currentPath.startsWith('/merchant')) {
        // Rediriger vers la page d'accueil commune
        navigate('/consumer/home', { replace: true });
      }
    }
  }, [user, userProfile.role, loading, profileLoading, navigate]);

  // Middleware de sécurité des routes - protection des routes marchands uniquement
  useEffect(() => {
    if (!loading && !profileLoading && user && userProfile.role) {
      const currentPath = window.location.pathname;
      
      // Seules les routes marchands sont protégées - les utilisateurs non-marchands sont redirigés
      if (currentPath.startsWith('/merchant') && userProfile.role !== 'merchant') {
        navigate('/consumer/home', { replace: true });
      }
      // Les marchands peuvent accéder à toutes les pages (commune + leur dashboard)
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