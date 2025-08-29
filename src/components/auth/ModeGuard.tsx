import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProfileMode } from "@/hooks/use-profile-mode";

interface ModeGuardProps {
  children: React.ReactNode;
}

export const ModeGuard = ({ children }: ModeGuardProps) => {
  const { currentMode, currentBusinessId, loading } = useProfileMode();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;

    // Verrou de mode: pas d'accès simultané aux deux espaces
    if (currentMode === 'business') {
      // Si l'utilisateur essaie d'accéder à une route consommateur, on le renvoie vers son profil business
      if (path.startsWith('/consumer')) {
        if (currentBusinessId) {
          navigate(`/business/${currentBusinessId}`, { replace: true });
        }
      }
    } else {
      // Mode consommateur: on évite l'accès à l'espace opérateur
      if (path.startsWith('/business/')) {
        navigate('/consumer/home', { replace: true });
      }
    }
  }, [currentMode, currentBusinessId, loading, location.pathname, navigate]);

  return <>{children}</>;
};
