/**
 * CatalogManager - Simplifié et connecté au nouveau hook useCatalogs
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, MoreHorizontal, Edit3, Trash2, Eye, EyeOff, 
  Package, BarChart3, Search
} from "lucide-react";
import { CatalogForm } from "./CatalogForm";
import { useToast } from "@/hooks/use-toast";
import { useCatalogs, Catalog } from "@/hooks/use-catalogs";

interface CatalogManagerProps {
  businessId: string;
  businessCategory: string;
}

export const CatalogManager = ({ businessId, businessCategory }: CatalogManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "public" | "draft">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const { toast } = useToast();

  const {
    catalogs,
    isLoading,
    deleteCatalog,
    toggleVisibility,
    isDeleting
  } = useCatalogs(businessId);

  const filteredCatalogs = catalogs.filter(catalog => {
    const matchesSearch = catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (catalog.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || 
                         (activeFilter === "public" && catalog.is_public) ||
                         (activeFilter === "draft" && !catalog.is_public);
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteCatalog = async (catalogId: string) => {
    try {
      await deleteCatalog(catalogId);
    } catch (error) {
      console.error('Error deleting catalog:', error);
    }
  };

  const handleToggleVisibility = async (catalogId: string, currentIsPublic: boolean) => {
    try {
      await toggleVisibility(catalogId, !currentIsPublic);
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const publicCatalogs = catalogs.filter(c => c.is_public).length;

  // Mode création/édition
  if (showCreateForm || editingCatalog) {
    return (
      <CatalogForm
        businessId={businessId}
        catalog={editingCatalog || undefined}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingCatalog(null);
        }}
        onSuccess={() => {
          setShowCreateForm(false);
          setEditingCatalog(null);
        }}
      />
    );
  }

  if (isLoading) {
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
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
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
                <p className="text-sm font-medium text-muted-foreground">Publics</p>
                <p className="text-2xl font-bold">{publicCatalogs}</p>
              </div>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brouillons</p>
                <p className="text-2xl font-bold">{catalogs.length - publicCatalogs}</p>
              </div>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions et filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mes catalogues</CardTitle>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Barre de recherche et filtres */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher..."
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
                {searchQuery ? "Aucun résultat" : "Aucun catalogue"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery 
                  ? "Modifiez votre recherche" 
                  : "Créez votre premier catalogue"
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogs.map((catalog) => (
                <Card key={catalog.id} className="hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div className="absolute top-2 right-2">
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
                          <DropdownMenuItem onClick={() => setEditingCatalog(catalog)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleVisibility(catalog.id, catalog.is_public || false)}
                          >
                            {catalog.is_public ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Masquer
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
                                  Supprimer "{catalog.name}" ? Cette action est irréversible.
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

                    <div className="text-xs text-muted-foreground">
                      Créé le {new Date(catalog.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
