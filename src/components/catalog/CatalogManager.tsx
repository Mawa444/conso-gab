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
import { CatalogCreationWizard } from "./CatalogCreationWizard";
import { useToast } from "@/hooks/use-toast";

interface Catalog {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  category: string;
  subcategory: string;
  keywords: string[];
  visibility: "draft" | "public";
  availabilityZone: string;
  productCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface CatalogManagerProps {
  businessId: string;
  businessCategory: string;
}

// Données d'exemple
const SAMPLE_CATALOGS: Catalog[] = [
  {
    id: "1",
    name: "Collection Mode Enfants",
    description: "Vêtements colorés et confortables pour enfants de 2 à 10 ans",
    coverImage: "/api/placeholder/300/200",
    category: "Mode",
    subcategory: "Vêtements enfants",
    keywords: ["enfant", "coloré", "confortable", "mode"],
    visibility: "public",
    availabilityZone: "city",
    productCount: 24,
    views: 156,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20"
  },
  {
    id: "2",
    name: "Chaussures Sport",
    description: "Chaussures de sport pour toute la famille",
    coverImage: "/api/placeholder/300/200",
    category: "Mode",
    subcategory: "Chaussures",
    keywords: ["sport", "chaussures", "famille", "confort"],
    visibility: "draft",
    availabilityZone: "neighborhood",
    productCount: 12,
    views: 67,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18"
  }
];

export const CatalogManager = ({ businessId, businessCategory }: CatalogManagerProps) => {
  const [catalogs, setCatalogs] = useState<Catalog[]>(SAMPLE_CATALOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "public" | "draft">("all");
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const { toast } = useToast();

  const filteredCatalogs = catalogs.filter(catalog => {
    const matchesSearch = catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         catalog.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || catalog.visibility === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateCatalog = (catalogData: any) => {
    const newCatalog: Catalog = {
      id: Date.now().toString(),
      ...catalogData,
      productCount: 0,
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setCatalogs(prev => [newCatalog, ...prev]);
    setShowCreateWizard(false);
  };

  const handleDeleteCatalog = (catalogId: string) => {
    setCatalogs(prev => prev.filter(c => c.id !== catalogId));
    toast({
      title: "Catalogue supprimé",
      description: "Le catalogue a été supprimé avec succès.",
    });
  };

  const toggleVisibility = (catalogId: string) => {
    setCatalogs(prev => prev.map(catalog => 
      catalog.id === catalogId 
        ? { ...catalog, visibility: catalog.visibility === "public" ? "draft" : "public" as const }
        : catalog
    ));
  };

  const totalProducts = catalogs.reduce((sum, catalog) => sum + catalog.productCount, 0);
  const totalViews = catalogs.reduce((sum, catalog) => sum + catalog.views, 0);
  const publicCatalogs = catalogs.filter(c => c.visibility === "public").length;

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
                <CatalogCreationWizard
                  onComplete={handleCreateCatalog}
                  onCancel={() => setShowCreateWizard(false)}
                  businessCategory={businessCategory}
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
              {filteredCatalogs.map((catalog) => (
                <Card key={catalog.id} className="hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={catalog.coverImage}
                      alt={catalog.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant={catalog.visibility === "public" ? "default" : "secondary"}>
                        {catalog.visibility === "public" ? "Public" : "Brouillon"}
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
                          <DropdownMenuItem onClick={() => toggleVisibility(catalog.id)}>
                            {catalog.visibility === "public" ? (
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
                      {catalog.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {catalog.keywords.slice(0, 3).map(keyword => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {catalog.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{catalog.keywords.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{catalog.productCount} produits</span>
                      <span>{catalog.views} vues</span>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};