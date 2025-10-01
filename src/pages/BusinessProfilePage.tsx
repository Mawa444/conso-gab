import { useParams, useNavigate, useEffect } from 'react-router-dom';
import { useProfileMode } from '@/hooks/use-profile-mode';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageWithSkeleton } from '@/components/layout/PageWithSkeleton';
import { ProfilePageSkeleton } from '@/components/ui/skeleton-screens';
import { BusinessProfileContent } from '@/components/business/BusinessProfileContent';

export default function BusinessProfilePage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentMode,
    currentBusinessId,
    switchMode,
    loading: modeLoading,
    isOwnerOfBusiness,
  } = useProfileMode();

  useEffect(() => {
    if (!user || !businessId) {
      navigate('/entreprises', { replace: true });
      return;
    }

    if (!isOwnerOfBusiness(businessId)) {
      navigate('/entreprises', { replace: true });
      return;
    }

    if (currentMode !== 'business' || currentBusinessId !== businessId) {
      switchMode('business', businessId).catch(() => {
        navigate('/entreprises', { replace: true });
      });
    }
  }, [businessId, user, currentMode, currentBusinessId, isOwnerOfBusiness]);

  if (!businessId || modeLoading) {
    return (
      <PageWithSkeleton
        isLoading={true}
        skeleton={<ProfilePageSkeleton />}
      />
    );
  }

  return <BusinessProfileContent businessId={businessId} />;
}