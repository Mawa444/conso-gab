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

  // Redirection automatique vers la page d'accueil commune pour nouveaux utilisateurs
  useEffect(() => {
    if (!loading && !profileLoading) {
      const currentPath = window.location.pathname;
      
      // Redirection uniquement depuis la racine ou auth vers la page d'accueil commune
      if (currentPath === '/' || currentPath.includes('/auth')) {
        navigate('/consumer/home', { replace: true });
      }
    }
  }, [loading, profileLoading, navigate]);

  // Protection unique du dashboard marchand - tout le reste est libre d'accès
  useEffect(() => {
    if (!loading && !profileLoading && user && userProfile.role) {
      const currentPath = window.location.pathname;
      
      // Seul le dashboard marchand nécessite d'être un marchand
      if (currentPath.startsWith('/merchant/dashboard') && userProfile.role !== 'merchant') {
        navigate('/consumer/home', { replace: true });
      }
      // Toutes les autres pages (profils d'entreprises, catalogues, etc.) sont accessibles à tous
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