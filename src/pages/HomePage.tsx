import { useState } from "react";
import { QRScanner } from "@/components/scanner/QRScanner";
import { AdCarousel } from "@/components/advertising/AdCarousel";
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar";
import { CommerceListBlock } from "@/components/blocks/CommerceListBlock";
import { CategoriesSection } from "@/components/blocks/CategoriesSection";
import { CommerceDetailsPopup } from "@/components/commerce/CommerceDetailsPopup";
import { ActionButtonsBlock } from "@/components/blocks/ActionButtonsBlock";
import { OperatorDashboardModal } from "@/components/business/OperatorDashboardModal";
import { InteractiveBusinessCard } from "@/components/commerce/InteractiveBusinessCard";
import { useGeoRecommendations } from "@/hooks/use-geo-recommendations";
import { useGeoLocationContext } from "@/contexts/GeoLocationContext";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, Grid3X3, Building2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateBusinessButton } from "@/components/business/CreateBusinessButton";
import { Card, CardContent } from "@/components/ui/card";
import { PageWithSkeleton } from "@/components/layout/PageWithSkeleton";
import { HomePageSkeleton, CommerceCardSkeleton } from "@/components/ui/skeleton-screens";
import { getAllBusinessCategories } from "@/data/businessCategories";
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
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCommerce, setScannedCommerce] = useState<any>(null);
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [showOperatorDashboard, setShowOperatorDashboard] = useState(false);

  // Utiliser le nouveau système de géolocalisation intelligent
  const {
    businesses: geoBusinesses,
    loading,
    error,
    refresh: refreshBusinesses,
    currentPosition
  } = useGeoRecommendations({
    initialRadius: 2, // 2km par défaut
    maxRadius: 50, // jusqu'à 50km
    minResults: 5, // minimum 5 résultats
    autoRefresh: true
  });
  
  const {
    permissionDenied,
    requestPosition
  } = useGeoLocationContext();

  // Transformer pour compatibilité avec le composant
  const businesses = geoBusinesses.map(rec => ({
    id: rec.item.id,
    name: rec.item.business_name,
    logo_url: rec.item.logo_url,
    type: rec.item.business_category,
    description: rec.item.description,
    address: rec.item.address ? `${rec.item.address}${rec.item.city ? ', ' + rec.item.city : ''}` : rec.item.city || '',
    distance: rec.distanceFormatted,
    distance_meters: rec.distance * 1000,
    rating: 4.5,
    verified: rec.item.is_verified,
    whatsapp: rec.item.phone,
    cover_image_url: rec.item.cover_image_url || null,
    carousel_images: rec.item.carousel_images || []
  }));
  const handleScanResult = (result: string) => {
    try {
      const commerce = JSON.parse(result);
      setScannedCommerce(commerce);
      setShowScanner(false);
    } catch (error) {
      // Error handling without console
    }
  };

  // Utiliser les vraies catégories du système
  const categories = getAllBusinessCategories();
  const handleCategoryClick = (category: any) => {
    navigate(`/category/${category.id}`);
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
                <Button variant="ghost" size="sm" onClick={requestPosition} className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-100">
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

        {/* Actions rapides pour les entreprises */}
        

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
              <Button variant="outline" size="sm" onClick={() => navigate('/catalogs')} className="gap-2">
                <Grid3X3 className="w-4 h-4" />
                Voir tout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Publicité Partenaire */}
        <div className="space-y-4">
          <AdCarousel userLocation={userLocation} />
        </div>

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
            </div> : <div className="space-y-6">
              {businesses.map(business => <InteractiveBusinessCard 
                key={business.id} 
                business={{
                  id: business.id,
                  name: business.name,
                  logo_url: business.logo_url,
                  business_category: business.type,
                  description: business.description,
                  distance: business.distance,
                  rating: business.rating,
                  verified: business.verified,
                  address: business.address,
                  whatsapp: business.whatsapp,
                  cover_image_url: business.cover_image_url,
                  carousel_images: business.carousel_images
                }}
                onMessage={(biz) => onMessage?.(biz)}
                onCall={(biz) => {
                  if (biz.whatsapp) {
                    window.open(`https://wa.me/${biz.whatsapp.replace(/\D/g, '')}`, '_blank');
                  }
                }}
                onCatalog={(biz) => navigate(`/business/${biz.id}`)}
              />)}
            </div>}
        </div>

        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && <QRScanner onClose={() => setShowScanner(false)} onScan={handleScanResult} />}

      {/* Commerce Details Popup */}
      <CommerceDetailsPopup open={!!selectedCommerce} onClose={() => setSelectedCommerce(null)} commerce={selectedCommerce} />

      {/* Operator Dashboard Modal */}
      <OperatorDashboardModal open={showOperatorDashboard} onOpenChange={setShowOperatorDashboard} />
    </PageWithSkeleton>;
};