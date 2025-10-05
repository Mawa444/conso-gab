import { QRScanner } from "@/components/scanner/QRScanner";
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar";
import { CommerceDetailsPopup } from "@/components/commerce/CommerceDetailsPopup";
import { OperatorDashboardModal } from "@/components/business/OperatorDashboardModal";
import { EnhancedBusinessCard } from "@/components/commerce/EnhancedBusinessCard";
import { useOptimizedBusinesses } from "@/hooks/use-optimized-businesses";
import { useUserLocation } from "@/hooks/use-user-location";
import { useHomePageState } from "@/hooks/use-home-page-state";
import { NavigationService } from "@/services/navigation.service";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageWithSkeleton } from "@/components/layout/PageWithSkeleton";
import { HomePageSkeleton, CommerceCardSkeleton } from "@/components/ui/skeleton-screens";
import { getAllBusinessCategories } from "@/data/businessCategories";
import AdInjector from "@/components/shared/AdInjector";

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onMessage?: (commerce: any) => void;
  userLocation?: string;
}

export const HomePage = ({
  onNavigate,
  onMessage,
  userLocation = "Libreville"
}: HomePageProps) => {
  const navigate = useNavigate();
  const { ui, data, actions } = useHomePageState();

  // Utiliser le hook optimisé pour de meilleures performances
  const {
    businesses,
    loading,
    error,
    refreshBusinesses
  } = useOptimizedBusinesses();

  const {
    location: userLocationData,
    error: locationError,
    permissionDenied,
    retryLocation
  } = useUserLocation();

  const handleScanResult = (result: string) => {
    try {
      const commerce = JSON.parse(result);
      actions.setScannedCommerce(commerce);
    } catch (error) {
      // Error handling without console
    }
  };

  // Utiliser les vraies catégories du système
  const categories = getAllBusinessCategories();
  const handleCategoryClick = (category: any) => {
    NavigationService.navigateToCategory(navigate, category.id);
  };
  return <PageWithSkeleton isLoading={loading} skeleton={<HomePageSkeleton />}>
      <div className="min-h-screen bg-background">
        {/* Contenu principal */}
        <div className="space-y-6 p-4 bg-background px-0 py-0">
        
        {/* Alerte de géolocalisation - moins intrusive */}
        {permissionDenied && <Card className="bg-blue-50 border-blue-200 mx-4">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-blue-800 text-xs">
                    Activez la localisation pour des résultats personnalisés
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={retryLocation} className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                  Activer
                </Button>
              </div>
            </CardContent>
          </Card>}
        
        {/* Barre de recherche unifiée */}
        <div className="p-4 shadow-sm border-border rounded-3xl bg-inherit py-0 px-0">
          <UnifiedSearchBar onSelect={result => {
            if (result.type === 'business') {
              navigate(`/business/${result.businessId}`);
            } else if (result.type === 'product') {
              navigate(`/product/${result.id}`);
            }
          }} placeholder="Que recherchez-vous ?" variant="minimal" size="lg" currentLocation={userLocation} showFilters={false} showResults={false} />
        </div>

        {/* Catégories rapides */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide rounded-3xl bg-inherit my-[20px] py-0">
          {categories.slice(0, 6).map(category => <button key={category.id} onClick={() => handleCategoryClick(category)} className={`flex-shrink-0 px-6 py-4 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-sm bg-gradient-to-br ${category.color}`}>
              <span className="text-lg">{category.icon}</span>
              <span className="whitespace-nowrap">{category.nom}</span>
            </button>)}
        </div>

        {/* Section Catalogues publics */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4 py-[4px] px-[10px] bg-[ffd014] bg-[#ffd014]/[0.96] rounded-bubble-sm">
            <div className="flex items-center justify-between">
              <div className="py-0">
                <h3 className="text-title-medium font-roboto mb-1 text-left font-bold">Catalogues publics</h3>
                <p className="font-roboto text-left text-body-small text-black">
                  Découvrez tous les catalogues des commerces
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => NavigationService.navigateToCatalogs(navigate)} className="gap-2">
                <Grid3X3 className="w-4 h-4" />
                Voir tout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Publicité Partenaire - Remplacé par AdInjector */}
        {/* Section En tendance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-medium font-roboto flex items-center gap-2 font-bold text-black">
              Entreprises actives
              <span className="bg-green-100 text-green-800 text-label-medium font-roboto px-2 py-1 rounded-full">
                {businesses.length}
              </span>
            </h2>
            <Button variant="ghost" size="sm" onClick={refreshBusinesses} disabled={loading} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          {loading ? <div className="space-y-4">
              {Array.from({
              length: 3
            }).map((_, index) => <CommerceCardSkeleton key={index} />)}
            </div> : error ? <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={refreshBusinesses} className="mt-2">
                Réessayer
              </Button>
            </div> : businesses.length === 0 ? <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-gray-500 mb-2">Aucune entreprise active pour le moment</p>
              <p className="text-sm text-gray-400">Les nouvelles entreprises apparaîtront ici</p>
            </div> : <div className="space-y-4">
              <AdInjector
                items={businesses.map(business => (
                  <EnhancedBusinessCard
                    key={business.id}
                    business={{
                      id: business.id,
                      name: business.business_name || business.name,
                      logo_url: business.logo_url,
                      business_category:
                        business.business_category || business.type,
                      description: business.description,
                      distance: business.distance_meters,
                      rating: 4.5, // TODO: Implement real ratings
                      verified: business.is_verified,
                      city: business.city || business.address,
                      whatsapp: business.whatsapp,
                    }}
                  />
                ))}
                userLocation={userLocation}
              />
            </div>}
        </div>

        </div>
      </div>

      {/* Scanner Modal */}
      {ui.showScanner && <QRScanner onClose={actions.closeScanner} onScan={handleScanResult} />}

      {/* Commerce Details Popup */}
      <CommerceDetailsPopup open={!!data.selectedCommerce} onClose={actions.clearSelectedCommerce} commerce={data.selectedCommerce} />

      {/* Operator Dashboard Modal */}
      <OperatorDashboardModal open={ui.showOperatorDashboard} onOpenChange={actions.toggleOperatorDashboard} />
    </PageWithSkeleton>;
};