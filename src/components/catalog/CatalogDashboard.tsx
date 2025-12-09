import { useState } from "react";
import { Plus, Package, Settings, BarChart3, ShoppingBag, Eye, EyeOff, Edit, Trash2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CatalogManager } from "./CatalogManager";
import { EnhancedProductCreationWizard } from "../products/EnhancedProductCreationWizard";
import { CatalogVisibilityManager } from "./CatalogVisibilityManager";
import { CatalogManagementPage } from "./CatalogManagementPage";
import { useCatalogManagement } from "@/hooks/use-catalog-management";
import { useProductManagement } from "@/hooks/use-product-management";
import { CatalogForm } from "./CatalogForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CatalogDashboardProps {
  businessId: string;
  businessName: string;
  businessCategory: string;
}

export const CatalogDashboard = ({ businessId, businessName, businessCategory }: CatalogDashboardProps) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'manage' | 'statistics' | 'createProduct' | 'visibility' | 'catalogs' | 'managementPage'>('dashboard');
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'catalogs' | 'products'>('catalogs');
  
  // Real data hooks
  const {
    catalogs,
    isLoading,
    createCatalog,
    deleteCatalog,
    toggleVisibility,
    isDeleting,
    isToggling
  } = useCatalogManagement(businessId);
  
  const { products: allProducts, isLoading: isLoadingProducts } = useProductManagement(businessId);

  // Stats calculation
  const totalProducts = allProducts.length;
  const publishedProducts = allProducts.filter(p => (p as any).is_active !== false && p.is_available !== false).length;
  
  // Approximate views and favorites (to be implemented with dedicated tables)
  const totalViews = 0;
  const totalFavorites = 0;

  const handleCreateCatalog = () => {
    setActiveView('create');
  };

  const handleManageCatalogs = () => {
    setActiveView('manage');
  };

  const handleViewStatistics = () => {
    setActiveView('statistics');
  };

  const handleAddProduct = () => {
    setActiveView('createProduct');
  };

  const handleWizardComplete = async (catalogData: any) => {
    try {
      // Create the catalog using the hook
      await new Promise((resolve, reject) => {
        createCatalog(catalogData);
        // Simulate async completion - in a real app this would be handled by the mutation callbacks
        setTimeout(resolve, 100);
      });
      

      setActiveView('managementPage');
    } catch (error) {
      console.error("Erreur lors de la création du catalogue:", error);
      setActiveView('dashboard');
    }
  };

  const handleWizardCancel = () => {
    setActiveView('dashboard');
  };

  const handleProductComplete = () => {
    setActiveView('dashboard');
  };

  const handleProductCancel = () => {
    setActiveView('dashboard');
  };

  if (activeView === 'create') {
    return (
      <div className="p-4 border rounded-lg bg-background">
        <h2 className="text-xl font-bold mb-4">Nouveau Catalogue</h2>
        <CatalogForm
          businessId={businessId}
          onCancel={handleWizardCancel}
          onSuccess={() => setActiveView('managementPage')}
        />
      </div>
    );
  }

  if (activeView === 'createProduct') {
    return (
      <EnhancedProductCreationWizard
        onComplete={handleProductComplete}
        onCancel={handleProductCancel}
        businessCategory={businessCategory}
        businessId={businessId}
      />
    );
  }

  if (activeView === 'manage') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Gérer mes catalogues</h2>
          <Button
            variant="outline"
            onClick={() => setActiveView('dashboard')}
          >
            Retour au tableau de bord
          </Button>
        </div>
        <CatalogManager
          businessId={businessId}
        />
      </div>
    );
  }

  if (activeView === 'statistics') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Statistiques de mes catalogues</h2>
          <Button
            variant="outline"
            onClick={() => setActiveView('dashboard')}
          >
            Retour au tableau de bord
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Statistiques à venir</h3>
              <p>Les statistiques détaillées de vos catalogues seront bientôt disponibles.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vue de gestion de la visibilité
  if (activeView === 'visibility') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Visibilité des catalogues</h2>
          <Button
            variant="outline"
            onClick={() => setActiveView('dashboard')}
          >
            Retour au tableau de bord
          </Button>
        </div>
        <CatalogVisibilityManager businessId={businessId} />
      </div>
    );
  }

  // Page de gestion avancée des catalogues
  if (activeView === 'managementPage') {
    return (
      <CatalogManagementPage
        businessId={businessId}
        businessName={businessName}
        businessCategory={businessCategory}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button 
            variant="outline" 
            onClick={() => setActiveView('managementPage')}
            className="gap-2"
          >
            <Package className="w-4 h-4" />
            Gestion avancée
          </Button>
        </div>
        <h2 className="text-2xl font-bold mb-2">Gestion des Catalogues</h2>
        <p className="text-muted-foreground">
          Créez et gérez vos catalogues de produits pour {businessName}
        </p>
        {catalogs.length > 0 && (
          <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
            <span>{catalogs.length} catalogues créés</span>
            <span>•</span>
            <span>{totalProducts} produits au total</span>
            <span>•</span>
            <span>{catalogs.filter(c => c.is_public).length} catalogues publics</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Créer un nouveau catalogue */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCreateCatalog}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Créer un nouveau catalogue</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez un catalogue organisé pour vos produits ou services
            </p>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Commencer la création
            </Button>
          </CardContent>
        </Card>

        {/* Ajouter un nouveau produit */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleAddProduct}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ajouter un nouveau produit</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez rapidement un produit à vos catalogues existants
            </p>
            <Button variant="outline" className="w-full">
              Ajouter un produit
            </Button>
          </CardContent>
        </Card>

        {/* Gérer mes catalogues */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('managementPage')}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gérer mes catalogues</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Modifiez, organisez et mettez à jour vos catalogues existants
            </p>
            <Button variant="outline" className="w-full">
              Accéder à la gestion
            </Button>
          </CardContent>
        </Card>

        {/* Visibilité des catalogues */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('visibility')}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Visibilité des catalogues</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gérez qui peut voir vos catalogues et produits
            </p>
            <Button variant="outline" className="w-full">
              Gérer la visibilité
            </Button>
          </CardContent>
        </Card>

        {/* Statistiques de mes catalogues */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewStatistics}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Statistiques de mes catalogues</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Analysez les performances de vos catalogues et produits
            </p>
            <Button variant="outline" className="w-full">
              Voir les statistiques
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Section informative */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Conseils pour optimiser vos catalogues
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Ajoutez des photos de haute qualité pour chaque produit</p>
            <p>• Renseignez tous les détails obligatoires pour maximiser votre visibilité</p>
            <p>• Organisez vos produits en catalogues thématiques</p>
            <p>• Mettez à jour régulièrement vos prix et disponibilités</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};