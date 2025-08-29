import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile>({ role: null, pseudo: null });
  const [profileLoading, setProfileLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string>('');
  const hasWelcomedRef = useRef(false);

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
        // Interface unifiée pour tous les rôles
        navigate('/consumer/home', { replace: true });
      }
    }
  }, [loading, profileLoading, user, userProfile.role, navigate]);

  // Afficher un message de bienvenue subtil après connexion
  useEffect(() => {
    if (!loading && user && !hasWelcomedRef.current) {
      const name = userProfile.pseudo || (user.email?.split('@')[0] ?? '');
      setWelcomeName(name);
      setShowWelcome(true);
      hasWelcomedRef.current = true;
      const t = setTimeout(() => setShowWelcome(false), 1500);
      return () => clearTimeout(t);
    }
  }, [loading, user, userProfile.pseudo]);

  // Plus de restrictions basées sur les rôles - tous les utilisateurs connectés ont accès à tout

  // Afficher un overlay de chargement sans bloquer le rendu de l'application
  const showLoading = loading || profileLoading;

  return (
    <>
      {children}
      {showWelcome && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center bg-gradient-to-b from-primary/30 via-secondary/20 to-accent/30 animate-fade-in">
          <div className="text-center text-white animate-enter">
            <p className="text-lg">Bienvenue</p>
            <h2 className="text-2xl font-semibold">{welcomeName}</h2>
          </div>
        </div>
      )}
      {showLoading && !showWelcome && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center bg-gradient-to-b from-primary/20 via-secondary/20 to-accent/20">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Chargement...</p>
          </div>
        </div>
      )}
    </>
  );
}