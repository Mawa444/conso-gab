import { useNavigate } from "react-router-dom";
import { BusinessCreationWizard } from "@/components/business/BusinessCreationWizard";
import { useProfileMode } from "@/hooks/use-profile-mode";

export const BusinessCreationPage = () => {
  const navigate = useNavigate();
  const { switchMode } = useProfileMode();

  const handleCreated = (businessId: string) => {
    // Switch vers le business puis redirection vers son profil
    switchMode('business', businessId, () => {
      navigate(`/business/${businessId}/profile`);
    });
  };

  const handleCancel = () => {
    navigate("/entreprises");
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
};

export default BusinessCreationPage;