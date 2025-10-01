import { useNavigate } from 'react-router-dom';
import { BusinessCreationWizard } from '@/components/business/BusinessCreationWizard';
import { useProfileMode } from '@/hooks/use-profile-mode';

export default function BusinessCreationPage() {
  const navigate = useNavigate();
  const { switchMode } = useProfileMode();

  const handleCreated = (businessId: string) => {
    switchMode('business', businessId).then(() => {
      navigate(`/business/${businessId}/profile`);
    });
  };

  const handleCancel = () => {
    navigate('/entreprises');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      <div className="container mx-auto p-6">
        <BusinessCreationWizard
          onCancel={handleCancel}
          onCreated={handleCreated}
        />
      </div>
    </div>
  );
}