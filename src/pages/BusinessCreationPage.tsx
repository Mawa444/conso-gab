import { useNavigate } from "react-router-dom";
import { BusinessCreationWizard } from "@/components/business/BusinessCreationWizard";
import { useProfileMode } from "@/hooks/use-profile-mode";

export const BusinessCreationPage = () => {
  const navigate = useNavigate();
  const { switchMode } = useProfileMode();

  const handleCreated = (businessId: string) => {
    // Redirection automatique vers le profil business nouvellement créé
    setTimeout(() => {
      switchMode('business', businessId, navigate);
    }, 1000);
  };

  const handleCancel = () => {
    navigate("/");
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