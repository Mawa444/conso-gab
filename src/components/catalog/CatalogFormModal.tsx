import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CatalogForm } from "./CatalogForm";

interface CatalogFormModalProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const CatalogFormModal = ({ 
  businessId, 
  isOpen, 
  onClose, 
  initialData 
}: CatalogFormModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Modifier le catalogue" : "Nouveau catalogue"}
          </DialogTitle>
        </DialogHeader>
        <CatalogForm 
          businessId={businessId} 
          initialData={initialData}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
