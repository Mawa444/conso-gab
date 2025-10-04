import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBusinessCreation } from "@/hooks/use-business-creation";
import { BusinessCreationWizard } from "@/components/business/BusinessCreationWizard";

interface CreateBusinessButtonProps {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  fullWidth?: boolean;
  showIcon?: boolean;
}

export const CreateBusinessButton = ({ 
  variant = "default", 
  size = "default", 
  className = "", 
  children,
  fullWidth = false,
  showIcon = true
}: CreateBusinessButtonProps) => {
  const { 
    showCreateForm, 
    openBusinessCreation, 
    handleBusinessCreated, 
    handleBusinessCreationCancelled 
  } = useBusinessCreation();

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
        onClick={openBusinessCreation}
      >
        {showIcon && <Plus className="w-4 h-4 mr-2" />}
        {children || "Créer mon entreprise"}
      </Button>

      {/* Modal de création */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[var(--z-modal-backdrop)] animate-fade-in" style={{ zIndex: 'var(--z-modal-backdrop)' }}>
          <div className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <BusinessCreationWizard 
              onCancel={handleBusinessCreationCancelled}
              onCreated={handleBusinessCreated}
            />
          </div>
        </div>
      )}
    </>
  );
};