/**
 * Dashboard de gestion des catalogues - Simplifié
 */
import { useState } from "react";
import { Plus, Package, BarChart3, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CatalogForm } from "./CatalogForm";
import { CatalogList } from "./CatalogList";
import { useCatalogs, Catalog } from "@/hooks/use-catalogs";

interface CatalogDashboardProps {
  businessId: string;
  businessName: string;
  businessCategory: string;
  onBack?: () => void;
}

export const CatalogDashboard = ({ 
  businessId, 
  businessName, 
  businessCategory,
  onBack 
}: CatalogDashboardProps) => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const { catalogs } = useCatalogs(businessId);

  const handleCreateNew = () => {
    setEditingCatalog(null);
    setView('create');
  };

  const handleEdit = (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setView('edit');
  };

  const handleSuccess = () => {
    setView('list');
    setEditingCatalog(null);
  };

  const handleCancel = () => {
    setView('list');
    setEditingCatalog(null);
  };

  // Vue création/édition
  if (view === 'create' || view === 'edit') {
    return (
      <div className="space-y-6">
        <CatalogForm
          businessId={businessId}
          catalog={editingCatalog || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Vue liste (dashboard)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mes Catalogues</h2>
          <p className="text-muted-foreground">{businessName}</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        )}
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{catalogs.length}</p>
            <p className="text-xs text-muted-foreground">Catalogues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">
                {catalogs.filter(c => c.is_public).length}
              </span>
            </div>
            <p className="text-2xl font-bold">{catalogs.filter(c => c.is_public).length}</p>
            <p className="text-xs text-muted-foreground">Publics</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-sm">
                {catalogs.filter(c => !c.is_public).length}
              </span>
            </div>
            <p className="text-2xl font-bold">{catalogs.filter(c => !c.is_public).length}</p>
            <p className="text-xs text-muted-foreground">Brouillons</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCreateNew}>
          <CardContent className="p-4 text-center">
            <Plus className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium text-primary">Nouveau</p>
            <p className="text-xs text-muted-foreground">Créer un catalogue</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des catalogues */}
      <CatalogList
        businessId={businessId}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
      />
    </div>
  );
};
