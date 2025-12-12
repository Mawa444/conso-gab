import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CatalogInteractionModalProps {
  open: boolean;
  onClose: () => void;
  catalog: any;
  businessName?: string;
}

export const CatalogInteractionModal = ({ open, onClose, catalog, businessName }: CatalogInteractionModalProps) => {
  if (!catalog) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{catalog.name}</DialogTitle>
          <DialogDescription>
            {businessName && <span className="font-medium text-primary block mb-2">{businessName}</span>}
            {catalog.category && <Badge variant="outline">{catalog.category}</Badge>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cover Image */}
          {(catalog.cover_url || catalog.cover_image_url) && (
            <div className="aspect-video w-full rounded-md overflow-hidden bg-gray-100">
              <img 
                src={catalog.cover_url || catalog.cover_image_url} 
                alt={catalog.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Details */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {catalog.description || 'Aucune description fournie.'}
            </p>
          </div>

          {catalog.price && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">Prix</span>
              <span className="font-bold text-lg">{catalog.price} FCFA</span>
            </div>
          )}

          {/* Action Buttons (Stub) */}
          <div className="flex gap-2 pt-4">
            <Button className="w-full" onClick={() => {
              // Placeholder for booking/contact logic
              alert('Fonctionnalité de contact bientôt disponible');
            }}>
                Contacter / Réserver
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
