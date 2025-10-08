import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRoles, AppRole } from '@/hooks/use-user-roles';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: AppRole[];
  requireAll?: boolean; // Si true, nécessite TOUS les rôles, sinon UN des rôles suffit
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Composant de protection basé sur les rôles
 * Empêche l'accès non autorisé aux fonctionnalités admin/modérateur
 */
export const RoleGuard = ({
  children,
  requiredRoles,
  requireAll = false,
  fallback,
  redirectTo = '/consumer/home'
}: RoleGuardProps) => {
  const { roles, loading, hasAnyRole, hasAllRoles } = useUserRoles();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAccess = requireAll
    ? hasAllRoles(requiredRoles)
    : hasAnyRole(requiredRoles);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * Hook pour vérifier les rôles dans les composants
 */
export const useRoleCheck = (
  requiredRoles: AppRole[],
  requireAll: boolean = false
): boolean => {
  const { hasAnyRole, hasAllRoles } = useUserRoles();
  return requireAll ? hasAllRoles(requiredRoles) : hasAnyRole(requiredRoles);
};
