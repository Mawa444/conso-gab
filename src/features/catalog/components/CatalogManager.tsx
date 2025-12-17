import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, MoreHorizontal, Edit3, Trash2, Eye, EyeOff, 
  Package, BarChart3, Search, Filter, Star, MapPin
} from "lucide-react";
import { CatalogCreateForm } from "./CatalogCreateForm";
import { useToast } from "@/hooks/use-toast";
import { useCatalogManagement } from "@/hooks/use-catalog-management";
import { useProductManagement } from "@/hooks/use-product-management";

interface CatalogManagerProps {
  businessId: string;
  businessCategory: string;
}

export const CatalogManager = ({ businessId, businessCategory }: CatalogManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "public" | "draft">("all");
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const { toast } = useToast();

  // Real data hooks
  const {
    catalogs,
    isLoading,
    createCatalog,
    deleteCatalog,
    toggleVisibility,
    isCreating,
    isDeleting,
    isToggling
  } = useCatalogManagement(businessId);
  
  const { products: allProducts, isLoading: isLoadingProducts } = useProductManagement(businessId);

  const filteredCatalogs = catalogs.filter(catalog => {
    const matchesSearch = catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (catalog.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || 
                         (activeFilter === "public" && catalog.is_public) ||
                         (activeFilter === "draft" && !catalog.is_public);
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteCatalog = (catalogId: string) => {
    deleteCatalog(catalogId);
  };

  const handleToggleVisibility = (catalogId: string, currentIsPublic: boolean) => {
    toggleVisibility({ catalogId, isPublic: !currentIsPublic });
  };

  // Calculate stats from real data
  const totalProducts = allProducts.length;
  const totalViews = 0; // TODO: Implement view tracking
  const publicCatalogs = catalogs.filter(c => c.is_public).length;

  if (isLoading || isLoadingProducts) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total catalogues</p>
                <p className="text-2xl font-bold">{catalogs.length}</p>
              </div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produits total</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vues totales</p>
                <p className="text-2xl font-bold">{totalViews}</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Catalogues publics</p>
                <p className="text-2xl font-bold">{publicCatalogs}</p>
              </div>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions et filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mes catalogues</CardTitle>
            <Dialog open={showCreateWizard} onOpenChange={setShowCreateWizard}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau catalogue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau catalogue</DialogTitle>
                </DialogHeader>
                <CatalogCreateForm
                  businessId={businessId}
                  onCancel={() => setShowCreateWizard(false)}
                  onCreated={() => setShowCreateWizard(false)}
                  isModal={false}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Barre de recherche et filtres */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher dans mes catalogues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="public">Publics</TabsTrigger>
                <TabsTrigger value="draft">Brouillons</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Liste des catalogues */}
          {filteredCatalogs.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">
                {searchQuery ? "Aucun catalogue trouvé" : "Aucun catalogue"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery 
                  ? "Essayez de modifier votre recherche" 
                  : "Créez votre premier catalogue pour commencer à organiser vos produits"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateWizard(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier catalogue
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogs.map((catalog) => {
                const catalogProducts = allProducts.filter(p => p.catalog_id === catalog.id);
                const productCount = catalogProducts.length;
                
                return (
                  <Card key={catalog.id} className="hover:shadow-md transition-shadow">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground" />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant={catalog.is_public ? "default" : "secondary"}>
                          {catalog.is_public ? "Public" : "Brouillon"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold truncate">{catalog.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleVisibility(catalog.id, catalog.is_public)}
                              disabled={isToggling}
                            >
                              {catalog.is_public ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Passer en brouillon
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Publier
                                </>
                              )}
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer le catalogue</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer le catalogue "{catalog.name}" ? 
                                    Cette action supprimera également tous les produits associés et ne peut pas être annulée.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteCatalog(catalog.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isDeleting}
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {catalog.description || "Aucune description"}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{productCount} produits</span>
                        <span>Créé le {new Date(catalog.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1">
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter produit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
