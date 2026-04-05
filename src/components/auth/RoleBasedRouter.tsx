import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { supabase } from '@/integrations/supabase/client';
import { createDomainLogger } from '@/lib/logger';

const logger = createDomainLogger('RoleBasedRouter');

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
          logger.error('Error fetching profile', { error });
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
        logger.error('Unexpected error', { error });
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
        logger.debug("User not authenticated, redirecting to /auth");
        navigate('/auth', { replace: true });
        return;
      }
    }
  }, [authLoading, user, navigate, location.pathname]);

  // Redirection intelligente après connexion
  const [hasRedirectedRef] = useState({ current: false });
  
  useEffect(() => {
    if (!globalLoading && user && userProfile.role) {
      const currentPath = location.pathname;
      
      // Rediriger SEULEMENT depuis la racine exacte ou auth (pas lors d'actualisations)
      // Et seulement si on n'a pas déjà redirigé pour cette session
      if ((currentPath === '/' || currentPath.startsWith('/auth')) && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        redirectToLastUsedProfile();
      }
    }
  }, [globalLoading, user, userProfile.role, location.pathname]);

  const redirectToLastUsedProfile = async () => {
    if (!user) return;

    try {
      // 1. Vérifier si l'utilisateur a des business
      const { data: collaborators } = await supabase
        .from('business_collaborators')
        .select('business_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .limit(1);

      // Si pas de business, aller en mode consommateur
      if (!collaborators || collaborators.length === 0) {
        logger.debug('No business found, redirecting to /consumer/home');
        navigate('/consumer/home', { replace: true });
        return;
      }

      // 2. Récupérer le dernier mode utilisé
      const { data: userMode } = await supabase
        .from('user_current_mode')
        .select('current_mode, current_business_id')
        .eq('user_id', user.id)
        .single();

      if (userMode && userMode.current_mode === 'business' && userMode.current_business_id) {
        logger.debug('Redirecting to last business', { businessId: userMode.current_business_id });
        navigate(`/business/${userMode.current_business_id}`, { replace: true });
      } else {
        logger.debug('Redirecting to /consumer/home by default');
        navigate('/consumer/home', { replace: true });
      }

    } catch (error) {
      logger.error('Error during redirection', { error });
      // Fallback vers consommateur en cas d'erreur
      navigate('/consumer/home', { replace: true });
    }
  };

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