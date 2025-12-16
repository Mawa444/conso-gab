import { useState } from 'react';
import { useCatalogs, useDeleteCatalog } from '../hooks/useCatalog';
import { EnhancedCatalogCard } from './EnhancedCatalogCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CatalogForm } from './CatalogForm';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, 
} from "@/components/ui/alert-dialog";
import { CatalogData } from '@/lib/supabase-helpers';

interface CatalogListProps {
  businessId: string;
  onCreateClick?: () => void;
}

export const CatalogList = ({ businessId, onCreateClick }: CatalogListProps) => {
  const { data: catalogs, isLoading, error } = useCatalogs(businessId);
  const deleteCatalog = useDeleteCatalog();
  
  const [editingCatalog, setEditingCatalog] = useState<CatalogData | null>(null);
  const [deletingCatalog, setDeletingCatalog] = useState<CatalogData | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>Impossible de charger les catalogues.</AlertDescription>
      </Alert>
    );
  }

  if (!catalogs || catalogs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Info className="h-10 w-10 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Aucun catalogue trouvé</h3>
        <p className="text-gray-500 mb-6">Commencez par créer votre premier catalogue pour présenter vos produits ou services.</p>
        <Button onClick={onCreateClick}>Créer un catalogue</Button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!deletingCatalog) return;
    try {
      await deleteCatalog.mutateAsync(deletingCatalog.id);
      setDeletingCatalog(null);
    } catch (error) {
      // Error handled by hook notifications usually
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalogs.filter(c => c.visibility !== 'archived').map((catalog) => (
          <EnhancedCatalogCard 
            key={catalog.id} 
            catalog={catalog as unknown as CatalogData} 
            businessName="" // Not strictly needed in dashboard
            isAdmin={true}
            onEdit={() => setEditingCatalog(catalog as unknown as CatalogData)}
            onDelete={() => setDeletingCatalog(catalog as unknown as CatalogData)}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCatalog} onOpenChange={(open) => !open && setEditingCatalog(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
          {editingCatalog && (
            <CatalogForm 
              businessId={businessId} 
              initialData={editingCatalog as any} 
              onSuccess={() => setEditingCatalog(null)}
              onCancel={() => setEditingCatalog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCatalog} onOpenChange={(open) => !open && setDeletingCatalog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deletingCatalog?.name}" ? 
              Cette action est irréversible et retirera le catalogue de votre vitrine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
