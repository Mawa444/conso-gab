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

  // Redirection intelligente après connexion - uniquement depuis racine ou auth
  const [hasRedirected, setHasRedirected] = useState(false);
  
  useEffect(() => {
    if (!globalLoading && user && userProfile.role && !hasRedirected) {
      const currentPath = location.pathname;
      
      // Rediriger SEULEMENT depuis la racine exacte ou auth (pas lors d'actualisations)
      if (currentPath === '/' || currentPath.startsWith('/auth')) {
        setHasRedirected(true);
        redirectToLastUsedProfile();
      }
    }
  }, [globalLoading, user, userProfile.role, hasRedirected]);

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
        console.log('Pas de business, redirection vers /consumer/home');
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
        console.log(`Redirection vers le dernier business: /business/${userMode.current_business_id}`);
        navigate(`/business/${userMode.current_business_id}`, { replace: true });
      } else {
        console.log('Redirection par défaut vers /consumer/home');
        navigate('/consumer/home', { replace: true });
      }

    } catch (error) {
      console.error('Erreur lors de la redirection:', error);
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