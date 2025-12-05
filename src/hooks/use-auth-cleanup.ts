import { supabase } from "@/integrations/supabase/client";

export const useAuthCleanup = () => {
  const cleanupAuthState = () => {
    try {
      // Nettoyer localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // Nettoyer sessionStorage si disponible
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }

      // Nettoyer les cookies spécifiques à Supabase si présents
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const [name] = cookie.split('=');
          if (name.trim().includes('sb-') || name.trim().includes('supabase')) {
            document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
      }
    } catch (error) {
      console.warn('Erreur lors du nettoyage des données d\'authentification:', error);
    }
  };

  const secureSignOut = async () => {
    try {
      // Logger l'activité de déconnexion
      try {
        await (supabase as any).rpc('log_user_activity', {
          action_type_param: 'LOGOUT',
          action_description_param: 'Déconnexion sécurisée du compte',
          metadata_param: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            secure_logout: true
          }
        });
      } catch (logError) {
        // Continuer même si le logging échoue
        console.warn('Erreur lors du logging de déconnexion:', logError);
      }

      // Nettoyer l'état d'authentification
      cleanupAuthState();

      // Tentative de déconnexion globale
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        // Continuer même si la déconnexion Supabase échoue
        console.warn('Erreur lors de la déconnexion Supabase:', signOutError);
      }

      // Forcer une actualisation complète de la page pour un état propre
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erreur lors de la déconnexion sécurisée:', error);
      // En cas d'erreur, forcer quand même la redirection
      window.location.href = '/auth';
    }
  };

  return {
    cleanupAuthState,
    secureSignOut
  };
};