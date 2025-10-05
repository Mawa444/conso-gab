import { ReactNode } from 'react';
import { useProfileMode } from '@/hooks/use-profile-mode';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateBusinessButton } from '@/components/business/CreateBusinessButton';

interface BusinessPermissionsGuardProps {
  children: ReactNode;
  requiredBusinessId?: string;
  action: 'read' | 'write' | 'admin';
  fallback?: ReactNode;
}

export const BusinessPermissionsGuard = ({ 
  children, 
  requiredBusinessId, 
  action,
  fallback 
}: BusinessPermissionsGuardProps) => {
  const { currentMode, currentBusinessId, businessProfiles } = useProfileMode();

  // Vérifier si l'utilisateur a des profils business
  const hasBusinessProfiles = businessProfiles.length > 0;

  // Si pas de profil business du tout
  if (!hasBusinessProfiles) {
    if (action === 'read') {
      // Autoriser la lecture même sans profil business (pour s'abonner, publier avis, etc.)
      return <>{children}</>;
    }
    
    return fallback || (
      <Alert className="border-orange-200 bg-orange-50">
        <Lock className="h-4 w-4" />
        <AlertDescription className="text-orange-800">
          Vous devez créer un profil business pour accéder à cette fonctionnalité.
          <div className="mt-2">
            <CreateBusinessButton size="sm" variant="outline">
              Créer mon entreprise
            </CreateBusinessButton>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Si un business spécifique est requis
  if (requiredBusinessId) {
    const userBusiness = businessProfiles.find(bp => bp.id === requiredBusinessId);
    
    if (!userBusiness) {
      return fallback || (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            Vous n'avez pas les permissions pour modifier ce profil business.
          </AlertDescription>
        </Alert>
      );
    }
  }

  // Si action d'écriture mais pas en mode business
  if (action === 'write' && currentMode !== 'business') {
    return fallback || (
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-blue-800">
          Vous devez passer en mode professionnel pour modifier votre entreprise.
        </AlertDescription>
      </Alert>
    );
  }

  // Si mode business mais pas le bon business
  if (action === 'write' && currentMode === 'business' && requiredBusinessId && currentBusinessId !== requiredBusinessId) {
    const targetBusiness = businessProfiles.find(bp => bp.id === requiredBusinessId);
    
    return fallback || (
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-blue-800">
          Vous devez sélectionner l'entreprise "{targetBusiness?.business_name}" pour la modifier.
        </AlertDescription>
      </Alert>
    );
  }

  // Autoriser l'accès
  return <>{children}</>;
};