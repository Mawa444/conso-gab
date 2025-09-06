import { useState } from "react";
import { Plus, Grid3X3, List, Folder, FolderPlus, Trash2, Edit, Move, Copy, Archive, Eye, EyeOff, MoreHorizontal, Search, Filter, SortAsc, CheckSquare, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CatalogCreationWizard } from "./CatalogCreationWizard";
import { useCatalogManagement } from "@/hooks/use-catalog-management";
import { useToast } from "@/hooks/use-toast";

interface CatalogManagementPageProps {
  businessId: string;
  businessName: string;
  businessCategory: string;
  onBack?: () => void;
}

interface CatalogFolder {
  id: string;
  name: string;
  catalogIds: string[];
  color: string;
  createdAt: Date;
}

export const CatalogManagementPage = ({ businessId, businessName, businessCategory, onBack }: CatalogManagementPageProps) => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCatalogs, setSelectedCatalogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'products'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'public' | 'draft'>('all');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<CatalogFolder[]>([]);

  const {
    catalogs,
    isLoading,
    deleteCatalog,
    toggleVisibility,
    isDeleting,
    isToggling
  } = useCatalogManagement(businessId);

  // Filter and sort catalogs
  const filteredCatalogs = catalogs
    .filter(catalog => {
      if (filterStatus === 'public' && !catalog.is_public) return false;
      if (filterStatus === 'draft' && catalog.is_public) return false;
      if (searchQuery && !catalog.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedFolder) {
        const folder = folders.find(f => f.id === selectedFolder);
        if (!folder?.catalogIds.includes(catalog.id)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'date': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'products': return 0; // TODO: Sort by product count
        default: return 0;
      }
    });

  const handleSelectAll = () => {
    if (selectedCatalogs.length === filteredCatalogs.length) {
      setSelectedCatalogs([]);
    } else {
      setSelectedCatalogs(filteredCatalogs.map(c => c.id));
    }
  };

  const handleCatalogSelect = (catalogId: string) => {
    setSelectedCatalogs(prev => 
      prev.includes(catalogId) 
        ? prev.filter(id => id !== catalogId)
        : [...prev, catalogId]
    );
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: CatalogFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      catalogIds: selectedCatalogs,
      color: '#3B82F6',
      createdAt: new Date()
    };

    setFolders(prev => [...prev, newFolder]);
    setSelectedCatalogs([]);
    setNewFolderName('');
    setShowFolderDialog(false);
    
    toast({
      title: "Dossier créé",
      description: `Le dossier "${newFolder.name}" a été créé avec ${selectedCatalogs.length} catalogue(s).`
    });
  };

  const handleBulkDelete = () => {
    selectedCatalogs.forEach(catalogId => {
      deleteCatalog(catalogId);
    });
    setSelectedCatalogs([]);
    setShowDeleteDialog(false);
    
    toast({
      title: "Catalogues supprimés",
      description: `${selectedCatalogs.length} catalogue(s) supprimé(s).`
    });
  };

  const handleBulkToggleVisibility = (makePublic: boolean) => {
    selectedCatalogs.forEach(catalogId => {
      const catalog = catalogs.find(c => c.id === catalogId);
      if (catalog && catalog.is_public !== makePublic) {
        toggleVisibility({ catalogId, isPublic: makePublic });
      }
    });
    setSelectedCatalogs([]);
  };

  const handleCreateComplete = () => {
    setShowCreateWizard(false);
    toast({
      title: "Catalogue créé",
      description: "Votre nouveau catalogue a été créé avec succès."
    });
  };

  if (showCreateWizard) {
    return (
      <CatalogCreationWizard
        onComplete={handleCreateComplete}
        onCancel={() => setShowCreateWizard(false)}
        businessId={businessId}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des catalogues</h1>
          <p className="text-muted-foreground">{businessName} • {catalogs.length} catalogue(s)</p>
        </div>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Retour
            </Button>
          )}
          <Button onClick={() => setShowCreateWizard(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau catalogue
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un catalogue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Filters */}
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="public">Publics</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date création</SelectItem>
                <SelectItem value="name">Nom A-Z</SelectItem>
                <SelectItem value="products">Nb produits</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCatalogs.length > 0 && (
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedCatalogs.length === filteredCatalogs.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedCatalogs.length} catalogue(s) sélectionné(s)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FolderPlus className="w-4 h-4" />
                    Créer dossier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau dossier</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="folderName">Nom du dossier</Label>
                      <Input
                        id="folderName"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Ex: Vêtements été 2024"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowFolderDialog(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateFolder}>
                        Créer dossier
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => handleBulkToggleVisibility(true)}
              >
                <Eye className="w-4 h-4" />
                Publier
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => handleBulkToggleVisibility(false)}
              >
                <EyeOff className="w-4 h-4" />
                Masquer
              </Button>

              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer {selectedCatalogs.length} catalogue(s) ? 
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Dossiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {folders.map(folder => (
              <Card 
                key={folder.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedFolder === folder.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: folder.color + '20' }}
                    >
                      <Folder className="w-5 h-5" style={{ color: folder.color }} />
                    </div>
                    <div>
                      <h4 className="font-medium">{folder.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {folder.catalogIds.length} catalogue(s)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator />
        </div>
      )}

      {/* Catalog Grid/List */}
      {filteredCatalogs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid3X3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun catalogue trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? "Aucun catalogue ne correspond à vos critères de recherche."
                : "Créez votre premier catalogue pour commencer."
              }
            </p>
            <Button onClick={() => setShowCreateWizard(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Créer un catalogue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredCatalogs.map(catalog => (
            <Card key={catalog.id} className="group hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedCatalogs.includes(catalog.id)}
                      onCheckedChange={() => handleCatalogSelect(catalog.id)}
                    />
                    <div>
                      <h3 className="font-semibold">{catalog.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {catalog.description || "Aucune description"}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Dupliquer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => toggleVisibility({ catalogId: catalog.id, isPublic: !catalog.is_public })}
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteCatalog(catalog.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Gallery Preview */}
                <div className="mb-4 h-32 bg-muted rounded-lg overflow-hidden">
                  {catalog.images && Array.isArray(catalog.images) && catalog.images.length > 0 ? (
                    <div className="flex gap-1 h-full">
                      {(catalog.images as any[]).slice(0, 4).map((image, index) => (
                        <div 
                          key={index} 
                          className="flex-1 bg-cover bg-center rounded"
                          style={{ backgroundImage: `url(${image.url || image})` }}
                        />
                      ))}
                      {(catalog.images as any[]).length > 4 && (
                        <div className="flex-1 bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                          +{(catalog.images as any[]).length - 4}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Grid3X3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">0 produits</span>
                    <Badge variant={catalog.is_public ? "default" : "secondary"}>
                      {catalog.is_public ? "Public" : "Brouillon"}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(catalog.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};