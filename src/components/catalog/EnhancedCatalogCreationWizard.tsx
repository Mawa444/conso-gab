import { CatalogCreationWizard } from './CatalogCreationWizard';

interface EnhancedCatalogCreationWizardProps {
  onComplete: (catalogData: any) => void;
  onCancel: () => void;
  businessId: string;
}

export const EnhancedCatalogCreationWizard = ({ 
  onComplete, 
  onCancel, 
  businessId 
}: EnhancedCatalogCreationWizardProps) => {
  return (
    <CatalogCreationWizard
      onComplete={onComplete}
      onCancel={onCancel}
      businessId={businessId}
    />
  );
};