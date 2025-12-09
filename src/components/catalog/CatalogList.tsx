/**
 * Liste des catalogues avec actions CRUD
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Package, 
  Store, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useCatalogs, Catalog } from '@/hooks/use-catalogs';
import { Skeleton } from '@/components/ui/skeleton';

interface CatalogListProps {
  businessId: string;
  onCreateNew?: () => void;
  onEdit?: (catalog: Catalog) => void;
}

export const CatalogList = ({ businessId, onCreateNew, onEdit }: CatalogListProps) => {
  const navigate = useNavigate();
  const { catalogs, isLoading, deleteCatalog, toggleVisibility, isDeleting } = useCatalogs(businessId);
  const [catalogToDelete, setCatalogToDelete] = useState<Catalog | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleVisibility = async (catalog: Catalog) => {
    setTogglingId(catalog.id);
    try {
      await toggleVisibility(catalog.id, !catalog.is_public);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!catalogToDelete) return;
    try {
      await deleteCatalog(catalogToDelete.id);
      setCatalogToDelete(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (catalogs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Aucun catalogue</h3>
          <p className="text-muted-foreground mb-6">
            Créez votre premier catalogue pour organiser vos produits ou services
          </p>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un catalogue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{catalogs.length} catalogue{catalogs.length > 1 ? 's' : ''}</h3>
          <p className="text-sm text-muted-foreground">
            {catalogs.filter(c => c.is_public).length} public{catalogs.filter(c => c.is_public).length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={onCreateNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau
        </Button>
      </div>

      {/* Catalog list */}
      <div className="space-y-3">
        {catalogs.map((catalog) => (
          <Card key={catalog.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  catalog.catalog_type === 'services' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {catalog.catalog_type === 'services' ? (
                    <Store className="w-6 h-6" />
                  ) : (
                    <Package className="w-6 h-6" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{catalog.name}</h4>
                    <Badge variant={catalog.is_public ? 'default' : 'secondary'} className="text-xs">
                      {catalog.is_public ? 'Public' : 'Brouillon'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {catalog.category || 'Non catégorisé'}
                    {catalog.min_price && ` • À partir de ${catalog.min_price} ${catalog.price_currency}`}
                  </p>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(catalog)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleToggleVisibility(catalog)}
                      disabled={togglingId === catalog.id}
                    >
                      {togglingId === catalog.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : catalog.is_public ? (
                        <EyeOff className="w-4 h-4 mr-2" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      {catalog.is_public ? 'Masquer' : 'Publier'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/catalog/${catalog.id}`)}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir le catalogue
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setCatalogToDelete(catalog)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Description if exists */}
              {catalog.description && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {catalog.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!catalogToDelete} onOpenChange={() => setCatalogToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce catalogue ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{catalogToDelete?.name}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
