import { Catalog } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { useDeleteCatalog } from '../hooks/useCatalog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CatalogForm } from './CatalogForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface CatalogCardProps {
  catalog: Catalog;
  businessId: string;
}

export const CatalogCard = ({ catalog, businessId }: CatalogCardProps) => {
  const deleteCatalog = useDeleteCatalog();
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteCatalog.mutateAsync(catalog.id);
    } catch {
      // handled by hook
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-video w-full bg-gray-100 relative">
          {catalog.cover_url ? (
            <img 
              src={catalog.cover_url} 
              alt={catalog.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}
          {catalog.is_public ? (
            <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">Public</Badge>
          ) : (
            <Badge variant="secondary" className="absolute top-2 right-2">Brouillon</Badge>
          )}
        </div>
        
        <CardHeader className="p-4">
          <CardTitle className="truncate">{catalog.name}</CardTitle>
          <CardDescription className="line-clamp-2 min-h-[40px]">
            {catalog.description || 'Aucune description'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 text-sm text-gray-500">
          {catalog.category && <span className="block">Catégorie: {catalog.category}</span>}
          {/* Add stats or other info here */}
        </CardContent>

        <CardFooter className="p-4 bg-gray-50 flex justify-between">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <Eye className="h-4 w-4 mr-2" />
            Voir
          </Button>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowEdit(true)}>
              <Edit className="h-4 w-4 text-blue-600" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer ce catalogue ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le catalogue sera archivé et ne sera plus visible par vos clients.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <CatalogForm 
            businessId={businessId} 
            initialData={catalog} 
            onSuccess={() => setShowEdit(false)}
            onCancel={() => setShowEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
