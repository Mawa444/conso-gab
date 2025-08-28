import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Store, 
  Package, 
  BarChart3, 
  MessageSquare, 
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { ProfessionalDashboard } from "@/components/professional/ProfessionalDashboard";
import { CatalogManager } from "@/components/catalog/CatalogManager";
import { EnhancedProductCreationWizard } from "@/components/products/EnhancedProductCreationWizard";
import { CatalogCreationWizard } from "@/components/catalog/CatalogCreationWizard";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type MerchantView = 'dashboard' | 'catalogs' | 'products' | 'analytics' | 'messages' | 'settings';

interface BusinessProfile {
  business_name: string;
  business_category: string;
  user_id: string;
}

const MerchantApp = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<MerchantView>('dashboard');
  const [showProductCreation, setShowProductCreation] = useState(false);
  const [showCatalogCreation, setShowCatalogCreation] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('business_profiles')
        .select('business_name, business_category, user_id')
        .eq('user_id', user.id)
        .single();
        
      if (!error && data) {
        setBusinessProfile(data);
      }
    };
    
    fetchBusinessProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  if (!businessProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  const renderQuickActions = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Button
        onClick={() => setShowCatalogCreation(true)}
        className="h-16 flex flex-col gap-2"
        variant="outline"
      >
        <Store className="h-6 w-6" />
        <span className="text-sm">Nouveau Catalogue</span>
      </Button>
      
      <Button
        onClick={() => setShowProductCreation(true)}
        className="h-16 flex flex-col gap-2"
        variant="outline"
      >
        <Package className="h-6 w-6" />
        <span className="text-sm">Nouveau Produit</span>
      </Button>
    </div>
  );

  const renderNavigation = () => (
    <div className="grid grid-cols-5 gap-2 mb-6 p-2 bg-muted/50 rounded-lg">
      {[
        { id: 'dashboard', icon: BarChart3, label: 'Tableau de Bord' },
        { id: 'catalogs', icon: Store, label: 'Catalogues' },
        { id: 'products', icon: Package, label: 'Produits' },
        { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
        { id: 'messages', icon: MessageSquare, label: 'Messages' },
      ].map((item) => (
        <Button
          key={item.id}
          variant={currentView === item.id ? "default" : "ghost"}
          size="sm"
          onClick={() => setCurrentView(item.id as MerchantView)}
          className="flex flex-col gap-1 h-16"
        >
          <item.icon className="h-4 w-4" />
          <span className="text-xs">{item.label}</span>
        </Button>
      ))}
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <ProfessionalDashboard 
            businessId={businessProfile.user_id}
            businessName={businessProfile.business_name}
            businessCategory={businessProfile.business_category}
            userType="owner"
          />
        );
      case 'catalogs':
        return (
          <CatalogManager 
            businessId={businessProfile.user_id}
            businessCategory={businessProfile.business_category}
          />
        );
      case 'products':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gestion des Produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Gérez vos produits depuis vos catalogues
                </p>
                <Button onClick={() => setCurrentView('catalogs')}>
                  Voir mes catalogues
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'analytics':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">150</div>
                  <div className="text-sm text-muted-foreground">Vues Totales</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">28</div>
                  <div className="text-sm text-muted-foreground">Favoris</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Messages</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">5</div>
                  <div className="text-sm text-muted-foreground">Contacts</div>
                </div>
              </div>
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Analytics détaillées bientôt disponibles
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'messages':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages & Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucun message pour le moment
                </p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <ProfessionalDashboard 
            businessId={businessProfile.user_id}
            businessName={businessProfile.business_name}
            businessCategory={businessProfile.business_category}
            userType="owner"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Espace Opérateur</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenue, {user?.user_metadata?.pseudo || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 pt-6">
        {/* Quick Actions */}
        {renderQuickActions()}
        
        {/* Navigation */}
        {renderNavigation()}
        
        {/* Main Content */}
        {renderCurrentView()}
      </div>

      {/* Modals */}
      <Dialog open={showProductCreation} onOpenChange={setShowProductCreation}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <EnhancedProductCreationWizard
            onComplete={() => {
              setShowProductCreation(false);
              setCurrentView('catalogs');
            }}
            onCancel={() => setShowProductCreation(false)}
            businessCategory={businessProfile.business_category}
            businessId={businessProfile.user_id}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showCatalogCreation} onOpenChange={setShowCatalogCreation}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <CatalogCreationWizard
            onComplete={() => {
              setShowCatalogCreation(false);
              setCurrentView('catalogs');
            }}
            onCancel={() => setShowCatalogCreation(false)}
            businessCategory={businessProfile.business_category}
          />
        </DialogContent>
      </Dialog>

      {showProfileSettings && (
        <ProfileSettings
          open={showProfileSettings}
          onClose={() => setShowProfileSettings(false)}
          userType="commerçant"
        />
      )}
    </div>
  );
};

export default MerchantApp;