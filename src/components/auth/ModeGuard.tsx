import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfileMode } from "@/hooks/use-profile-mode";

interface ModeGuardProps {
  children: React.ReactNode;
}

export const ModeGuard = ({ children }: ModeGuardProps) => {
  const { currentMode, currentBusinessId, loading } = useProfileMode();
  const location = useLocation();
  const navigate = useNavigate();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    let target: string | null = null;

    if (currentMode === 'business' && currentBusinessId) {
      // En mode Business: rediriger les routes consommateur vers le profil business
      if (path.startsWith('/consumer') || path === '/home') {
        target = `/business/${currentBusinessId}`;
      }
      
      // Vérifier que l'utilisateur accède à SON business
      const businessIdMatch = path.match(/^\/business\/([^/]+)/);
      if (businessIdMatch && businessIdMatch[1] !== currentBusinessId) {
        // Permettre l'accès en lecture aux autres business (page publique)
        // Ne bloquer que les settings
        if (path.includes('/settings')) {
          target = `/business/${currentBusinessId}`;
        }
      }
    } else {
      // Mode Consommateur: bloquer uniquement les settings business
      const businessSettingsMatch = path.match(/^\/business\/([^/]+)\/settings/);
      if (businessSettingsMatch) {
        target = '/consumer/home';
      }
    }

    // Éviter les boucles
    if (target && target !== path && lastRedirectRef.current !== target) {
      lastRedirectRef.current = target;
      navigate(target, { replace: true });
    }
  }, [currentMode, currentBusinessId, loading, location.pathname, navigate]);

  return <>{children}</>;
};
