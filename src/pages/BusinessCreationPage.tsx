import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { NewBusinessCreationWizard } from '@/components/business/creation/NewBusinessCreationWizard';

export const BusinessCreationPage = () => {
  const navigate = useNavigate();

  const handleCreated = (businessId: string) => {
    navigate(`/business/${businessId}/profile`);
  };

  const handleCancel = () => {
    navigate('/entreprises');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      <Header 
        title="Créer une entreprise" 
        showBack 
        onBack={handleCancel}
        showNotifications={false}
      />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <NewBusinessCreationWizard
          onCancel={handleCancel}
          onCreated={handleCreated}
        />
      </div>
    </div>
  );
};

export default BusinessCreationPage;
