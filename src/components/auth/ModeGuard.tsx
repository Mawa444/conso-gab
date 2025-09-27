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

    // Verrou de mode: pas d'accès simultané aux deux espaces
    if (currentMode === 'business') {
      // Si l'utilisateur essaie d'accéder à une route consommateur, on le renvoie vers son profil business
      if (path.startsWith('/consumer')) {
        target = '/business/profile?tab=catalog';
      }
    } else {
      // Mode consommateur: on évite l'accès à l'espace opérateur
      if (path.startsWith('/business/')) {
        target = '/consumer/home';
      }
    }

    // Éviter les boucles et redirections redondantes
    if (target && target !== path && lastRedirectRef.current !== target) {
      lastRedirectRef.current = target;
      navigate(target, { replace: true });
    }
  }, [currentMode, currentBusinessId, loading, location.pathname, navigate]);

  return <>{children}</>;
};
