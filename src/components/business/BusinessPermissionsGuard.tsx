// src/components/business/BusinessPermissionsGuard.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileMode } from '@/hooks/use-profile-mode';
import { useAuth } from '@/components/auth/AuthProvider';

export function BusinessPermissionsGuard({ children }: { children: React.ReactNode }) {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOwnerOfBusiness, loading: modeLoading } = useProfileMode();

  useEffect(() => {
    if (!user || !businessId) {
      navigate('/entreprises', { replace: true });
      return;
    }

    if (modeLoading) return;

    if (!isOwnerOfBusiness(businessId)) {
      navigate('/entreprises', { replace: true });
      return;
    }
  }, [user, businessId, modeLoading, isOwnerOfBusiness]);

  if (modeLoading || !businessId) {
    return null; // ou un skeleton minimal si nécessaire
  }

  return <>{children}</>;
}