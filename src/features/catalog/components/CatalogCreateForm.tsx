import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CatalogCreationWizard } from './CatalogCreationWizard';

interface CatalogCreateFormProps {
  businessId: string;
  onCancel?: () => void;
  onCreated?: (catalogId?: string) => void;
  isModal?: boolean;
}

export const CatalogCreateForm = ({ businessId, onCancel, onCreated, isModal = false }: CatalogCreateFormProps) => {
  const [showWizard, setShowWizard] = useState(false);

  const handleOpenWizard = () => setShowWizard(true);
  const handleCloseWizard = () => setShowWizard(false);

  const handleWizardCompleted = (catalogId?: string) => {
    setShowWizard(false);
    onCreated?.(catalogId);
  };

  if (isModal) {
    return (
      <>
        <Button onClick={handleOpenWizard} className="w-full">
          Créer un nouveau catalogue
        </Button>
        
        <Dialog open={showWizard} onOpenChange={setShowWizard}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau catalogue</DialogTitle>
            </DialogHeader>
            <CatalogCreationWizard
              businessId={businessId}
              onCancel={handleCloseWizard}
              onCompleted={handleWizardCompleted}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <CatalogCreationWizard
      businessId={businessId}
      onCancel={onCancel}
      onCompleted={handleWizardCompleted}
    />
  );
};
