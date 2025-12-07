import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBusinessCreation } from "@/hooks/use-business-creation";

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
  const { goToCreationPage } = useBusinessCreation();

  return (
    <Button 
      variant={variant}
      size={size}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={goToCreationPage}
    >
      {showIcon && <Plus className="w-4 h-4 mr-2" />}
      {children || "Créer mon entreprise"}
    </Button>
  );
};
