import { useProfileMode } from "@/hooks/use-profile-mode";
import { BusinessProfileEditor } from "@/components/business/BusinessProfileEditor";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export const BusinessProfileEditPage = () => {
  const { currentBusinessId, currentMode } = useProfileMode();
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger si pas en mode business ou pas de business ID
    if (currentMode !== 'business' || !currentBusinessId) {
      navigate('/entreprises');
    }
  }, [currentMode, currentBusinessId, navigate]);

  if (!currentBusinessId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/5">
      <div className="container mx-auto p-6">
        <BusinessProfileEditor businessId={currentBusinessId} />
      </div>
    </div>
  );
};

export default BusinessProfileEditPage;