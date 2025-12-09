import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Package, Plus, MoreHorizontal, Edit3, Trash2, Eye, EyeOff, 
  Search, Star, BarChart3, Loader2 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { supabase } from "@/integrations/supabase/client";
import { CatalogFormModal } from "./CatalogFormModal";
import { useCatalogMutations } from "@/hooks/use-catalog-mutations";
import { useProductManagement } from "@/hooks/use-product-management";

interface CatalogManagerProps {
  businessId: string;
}

export const CatalogManager = ({ businessId }: CatalogManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "public" | "draft">("all");
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<any | null>(null);
  const [deletingCatalogId, setDeletingCatalogId] = useState<string | null>(null);

  // Mutations
  const { deleteCatalog, toggleVisibility } = useCatalogMutations(businessId);

  // Fetch Catalogs
  const { data: catalogs = [], isLoading } = useQuery({
    queryKey: ['catalogs', businessId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('catalogs')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch Stats (Products count per catalog)
  const { products: allProducts } = useProductManagement(businessId);

  const filteredCatalogs = catalogs.filter((catalog: any) => {
    const matchesSearch = catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (catalog.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || 
                         (activeFilter === "public" && catalog.is_public) ||
                         (activeFilter === "draft" && !catalog.is_public);
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (deletingCatalogId) {
      await deleteCatalog(deletingCatalogId);
      setDeletingCatalogId(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Catalogues</p>
              <p className="text-2xl font-bold">{catalogs.length}</p>
            </div>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">En ligne</p>
              <p className="text-2xl font-bold">{catalogs.filter((c: any) => c.is_public).length}</p>
            </div>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Produits</p>
              <p className="text-2xl font-bold">{allProducts.length}</p>
            </div>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mes Catalogues</CardTitle>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Catalogue
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="public">Publics</TabsTrigger>
                <TabsTrigger value="draft">Brouillons</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* List */}
          {filteredCatalogs.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">Aucun catalogue trouvé</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Commencez par créer votre premier catalogue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogs.map((catalog: any) => (
                <Card key={catalog.id} className="group hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                     {catalog.cover_url || (catalog.images && catalog.images[0]) ? (
                        <img 
                          src={catalog.cover_url || catalog.images[0]} 
                          alt={catalog.name} 
                          className="w-full h-full object-cover"
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                          <Package className="w-16 h-16 text-muted-foreground/50" />
                        </div>
                     )}
                     <div className="absolute top-2 right-2">
                        <Badge variant={catalog.is_public ? "default" : "secondary"}>
                          {catalog.is_public ? "Public" : "Brouillon"}
                        </Badge>
                     </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold truncate flex-1">{catalog.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCatalog(catalog)}>
                            <Edit3 className="w-4 h-4 mr-2" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleVisibility({ id: catalog.id, isPublic: !catalog.is_public })}>
                            {catalog.is_public ? <EyeOff className="w-4 h-4 mr-2"/> : <Eye className="w-4 h-4 mr-2"/>}
                            {catalog.is_public ? "Passer en brouillon" : "Publier"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingCatalogId(catalog.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                      {catalog.description || "Pas de description"}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                      <span>{allProducts.filter(p => p.catalog_id === catalog.id).length} produits</span>
                      <span>{catalog.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CatalogFormModal
        businessId={businessId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {editingCatalog && (
        <CatalogFormModal
          businessId={businessId}
          isOpen={!!editingCatalog}
          onClose={() => setEditingCatalog(null)}
          initialData={editingCatalog}
        />
      )}

      <AlertDialog open={!!deletingCatalogId} onOpenChange={() => setDeletingCatalogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le catalogue sera archivé et ne sera plus visible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};