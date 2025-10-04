import { useState } from "react";
import { QRScanner } from "@/components/scanner/QRScanner";
import { AdCarousel } from "@/components/advertising/AdCarousel";
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar";
import { CommerceListBlock } from "@/components/blocks/CommerceListBlock";
import { CategoriesSection } from "@/components/blocks/CategoriesSection";
import { CommerceDetailsPopup } from "@/components/commerce/CommerceDetailsPopup";
import { ActionButtonsBlock } from "@/components/blocks/ActionButtonsBlock";
import { OperatorDashboardModal } from "@/components/business/OperatorDashboardModal";
import { useOptimizedBusinesses } from "@/hooks/use-optimized-businesses";
import { useUserLocation } from "@/hooks/use-user-location";
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

  // Utiliser le hook optimisé pour de meilleures performances
  const {
    businesses,
    loading,
    error,
    refreshBusinesses
  } = useOptimizedBusinesses();
  
  const { location: userLocationData, error: locationError, permissionDenied, retryLocation } = useUserLocation();
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
        {permissionDenied && (
          <Card className="bg-blue-50 border-blue-200 mx-4">
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={retryLocation}
                  className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                >
                  Activer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
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
          <CardContent className="p-4 bg-white rounded-xl py-[4px] px-[10px]">
            <div className="flex items-center justify-between">
              <div className="py-0">
                <h3 className="text-title-medium font-roboto mb-1 text-left font-bold">Catalogues publics</h3>
                <p className="font-roboto text-left text-gray-400 text-body-small">
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
            </div> : <div className="space-y-4">
              {businesses.map(commerce => <div key={commerce.id} className="p-4 shadow-sm border border-gray-100 rounded-3xl bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 rounded-none">
                        {commerce.verified && <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Vérifié
                          </span>}
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          Nouvelle
                        </span>
                        <span className="text-sm text-gray-500">{commerce.distance}</span>
                      </div>
                       <h3 className="text-title-medium font-roboto text-gray-900">{commerce.name}</h3>
                       <p className="text-body-medium font-roboto text-gray-600 mb-1">
                         {commerce.type} • {commerce.address}
                       </p>
                       {commerce.description && <p className="text-body-small font-roboto text-gray-500 mb-2 line-clamp-2">{commerce.description}</p>}
                      <div className="flex items-center gap-4 mt-3">
                        <button 
                          className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                          onClick={() => navigate(`/business/${commerce.id}`)}
                          aria-label="Voir le profil"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors" 
                          onClick={() => navigate(`/business/${commerce.id}`, { state: { openChat: true } })}
                          aria-label="Envoyer un message"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-body-large font-roboto">{commerce.rating}</span>
                      </div>
                      <button onClick={() => setSelectedCommerce(commerce)} className="bg-green-600 text-white px-4 py-2 font-medium hover:bg-green-700 rounded-lg">
                        Voir
                      </button>
                    </div>
                  </div>
                </div>)}
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