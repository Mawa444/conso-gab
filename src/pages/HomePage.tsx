import { useState } from "react";
import { QRScanner } from "@/components/scanner/QRScanner";
import { AdCarousel } from "@/components/advertising/AdCarousel";
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar";
import { CommerceListBlock } from "@/components/blocks/CommerceListBlock";
import { CategoriesSection } from "@/components/blocks/CategoriesSection";
import { CommerceDetailsPopup } from "@/components/commerce/CommerceDetailsPopup";
import { ActionButtonsBlock } from "@/components/blocks/ActionButtonsBlock";
import { OperatorDashboardModal } from "@/components/business/OperatorDashboardModal";
import { useBusinessList } from "@/hooks/use-business-list";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sponsoredCommerces = [
  {
    id: "sponsored_001",
    name: "Restaurant Chez Tonton",
    type: "Restaurant traditionnel",
    owner: "Paul Mba",
    address: "Quartier Glass, Libreville",
    rating: 4.9,
    verified: true,
    employees: ["Paul", "Marie", "Jean", "Sylvie"],
    distance: "800m",
    isFavorite: false,
    sponsored: true
  },
  {
    id: "sponsored_002",
    name: "Boutique Mode Gaboma",
    type: "Vêtements & Accessoires",
    owner: "Céline Ndong",
    address: "Avenue de l'Indépendance",
    rating: 4.7,
    verified: true,
    employees: ["Céline", "Grace", "Fatima"],
    distance: "1.2km",
    isFavorite: true,
    sponsored: true
  },
  {
    id: "sponsored_003",
    name: "Pharmacie du Centre",
    type: "Pharmacie",
    owner: "Dr. Michel Moussirou",
    address: "Centre-ville, Libreville",
    rating: 4.8,
    verified: true,
    employees: ["Dr. Michel", "Infirmière Anne", "Assistant Pierre"],
    distance: "500m",
    isFavorite: false,
    sponsored: true
  },
  {
    id: "sponsored_004",
    name: "Hotel Atlantique",
    type: "Hôtel 4 étoiles",
    owner: "Société Hôtelière Gabonaise",
    address: "Boulevard Triomphal, Libreville",
    rating: 4.6,
    verified: true,
    employees: ["Manager", "Réception", "Service", "Cuisine"],
    distance: "2.1km",
    isFavorite: false,
    sponsored: true
  },
  {
    id: "sponsored_005",
    name: "Garage Premium Auto",
    type: "Réparation automobile",
    owner: "Jean-Claude Obame",
    address: "Route de l'Aéroport, Libreville",
    rating: 4.8,
    verified: true,
    employees: ["Jean-Claude", "Mécanicien 1", "Mécanicien 2"],
    distance: "3.5km",
    isFavorite: true,
    sponsored: true
  },
  {
    id: "sponsored_006",
    name: "Supermarché Score",
    type: "Grande distribution",
    owner: "Groupe Score Gabon",
    address: "Centre Commercial Mbolo, Libreville",
    rating: 4.4,
    verified: true,
    employees: ["Direction", "Caissiers", "Rayons", "Sécurité"],
    distance: "1.8km",
    isFavorite: false,
    sponsored: true
  },
  {
    id: "sponsored_007",
    name: "Salon Beauté d'Afrique",
    type: "Salon de coiffure & beauté",
    owner: "Madame Akendengue",
    address: "Quartier Nombakélé, Libreville",
    rating: 4.7,
    verified: true,
    employees: ["Patronne", "Coiffeuse 1", "Coiffeuse 2", "Esthéticienne"],
    distance: "900m",
    isFavorite: true,
    sponsored: true
  },
  {
    id: "sponsored_008",
    name: "École Internationale du Gabon",
    type: "Établissement scolaire privé",
    owner: "Fondation Éducative Gabonaise",
    address: "Quartier Batterie IV, Libreville",
    rating: 4.9,
    verified: true,
    employees: ["Direction", "Professeurs", "Administration", "Personnel"],
    distance: "4.2km",
    isFavorite: false,
    sponsored: true
  },
  {
    id: "sponsored_009",
    name: "Clinique Sainte-Marie",
    type: "Établissement de santé privé",
    owner: "Dr. Francine Ntoutoume",
    address: "Avenue du Colonel Parant, Libreville",
    rating: 4.8,
    verified: true,
    employees: ["Médecins", "Infirmières", "Administration", "Laboratoire"],
    distance: "2.7km",
    isFavorite: false,
    sponsored: true
  },
  {
    id: "sponsored_010",
    name: "Boulangerie Artisanale du Gabon",
    type: "Boulangerie-pâtisserie",
    owner: "François Mintsa",
    address: "Avenue de la Marine, Libreville",
    rating: 4.6,
    verified: true,
    employees: ["Boulanger", "Pâtissier", "Vendeuses"],
    distance: "1.5km",
    isFavorite: true,
    sponsored: true
  }
];

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onMessage?: (commerce: any) => void;
  userLocation?: string;
}

export const HomePage = ({ onNavigate, onMessage, userLocation = "Libreville" }: HomePageProps) => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCommerce, setScannedCommerce] = useState<any>(null);
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [showOperatorDashboard, setShowOperatorDashboard] = useState(false);
  
  // Utiliser le hook pour récupérer les vraies données des entreprises
  const { businesses, loading, error, refreshBusinesses } = useBusinessList();

  const handleScanResult = (result: string) => {
    try {
      const commerce = JSON.parse(result);
      setScannedCommerce(commerce);
      setShowScanner(false);
    } catch (error) {
      console.error("Erreur lors du parsing du QR code:", error);
    }
  };

  const quickCategories = [
    { name: "Restaurants", icon: "🍽️", color: "bg-gradient-to-r from-orange-500 to-red-600", id: "restauration" },
    { name: "Commerce", icon: "🛍️", color: "bg-gradient-to-r from-blue-500 to-indigo-600", id: "commerce" },
    { name: "Hôtels", icon: "🏨", color: "bg-gradient-to-r from-purple-500 to-pink-600", id: "hotellerie" },
    { name: "Transport", icon: "🚗", color: "bg-green-500", id: "automobile" },
    { name: "Banques & Finances", icon: "🏦", color: "bg-gradient-to-r from-yellow-500 to-orange-600", id: "banque" },
    { name: "Santé", icon: "💊", color: "bg-gradient-to-r from-red-400 to-pink-500", id: "sante" },
    { name: "Beauté & Bien-être", icon: "💅", color: "bg-gradient-to-r from-pink-400 to-rose-600", id: "beaute" },
    { name: "Éducation & Formation", icon: "📚", color: "bg-gradient-to-r from-indigo-400 to-blue-600", id: "education" },
    { name: "Artisanat & Création", icon: "🎨", color: "bg-gradient-to-r from-yellow-400 to-orange-500", id: "artisanat" },
    { name: "Agriculture & Agroalimentaire", icon: "🌾", color: "bg-gradient-to-r from-green-400 to-lime-600", id: "agriculture" },
    { name: "Immobilier", icon: "🏠", color: "bg-gradient-to-r from-gray-400 to-gray-700", id: "immobilier" },
    { name: "Technologie & Services", icon: "💻", color: "bg-gradient-to-r from-cyan-400 to-blue-500", id: "technologie" },
    { name: "Événementiel", icon: "🎉", color: "bg-gradient-to-r from-pink-500 to-purple-700", id: "evenementiel" },
    { name: "Mode & Accessoires", icon: "👗", color: "bg-gradient-to-r from-fuchsia-400 to-pink-600", id: "mode" },
    { name: "Sport & Loisirs", icon: "⚽", color: "bg-gradient-to-r from-emerald-400 to-teal-600", id: "sport" },
  ];

  const handleCategoryClick = (category: any) => {
    navigate(`/category/${category.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenu principal */}
      <div className="space-y-6 p-4">
        {/* Barre de recherche unifiée */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <UnifiedSearchBar
            onSelect={(result) => {
              if (result.type === 'business') {
                navigate(`/business/${result.businessId}`);
              } else if (result.type === 'product') {
                navigate(`/product/${result.id}`);
              }
            }}
            placeholder="Que recherchez-vous ?"
            variant="minimal"
            size="lg"
            currentLocation={userLocation}
            showFilters={false}
            showResults={false}
          />
        </div>

        {/* Catégories rapides comme dans l'image */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {quickCategories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category)}
              className={`flex-shrink-0 px-6 py-4 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-sm ${category.color}`}
            >
              <span className="text-lg">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Section Catalogues publics */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Catalogues publics</h3>
                <p className="text-sm text-muted-foreground">
                  Découvrez tous les catalogues des commerces
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/catalogs')}
                className="gap-2"
              >
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
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Entreprises actives
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {businesses.length}
              </span>
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshBusinesses}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Chargement des entreprises...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshBusinesses}
                className="mt-2"
              >
                Réessayer
              </Button>
            </div>
          ) : businesses.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-gray-500 mb-2">Aucune entreprise active pour le moment</p>
              <p className="text-sm text-gray-400">Les nouvelles entreprises apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {businesses.map((commerce) => (
                <div key={commerce.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {commerce.verified && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Vérifié
                          </span>
                        )}
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          Nouvelle
                        </span>
                        <span className="text-sm text-gray-500">{commerce.distance}</span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{commerce.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {commerce.type} • {commerce.address}
                      </p>
                      {commerce.description && (
                        <p className="text-sm text-gray-500 mb-2">{commerce.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V18m-7-8a2 2 0 01-2-2V4a2 2 0 012-2h2.343M7 12h4m-4-8V4a2 2 0 012-2h1.657M7 8v4" />
                          </svg>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-green-600"
                          onClick={() => onMessage?.(commerce)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-yellow-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-gray-900">{commerce.rating}</span>
                      </div>
                      <button
                        onClick={() => setSelectedCommerce(commerce)}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700"
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section des commerces sponsorisés (optionnelle) */}
        {sponsoredCommerces.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Partenaires recommandés
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  {sponsoredCommerces.length}
                </span>
              </h2>
            </div>
            
            <div className="space-y-4">
              {sponsoredCommerces.slice(0, 3).map((commerce) => (
                <div key={commerce.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative">
                  {/* Badge Sponsorisé */}
                  <div className="absolute top-2 right-2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      PARTENAIRE
                    </span>
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        {commerce.verified && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Vérifié
                          </span>
                        )}
                        <span className="text-sm text-gray-500">{commerce.distance}</span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{commerce.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{commerce.type} • Par {commerce.owner} • {commerce.address}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V18m-7-8a2 2 0 01-2-2V4a2 2 0 012-2h2.343M7 12h4m-4-8V4a2 2 0 012-2h1.657M7 8v4" />
                          </svg>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-green-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-yellow-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-gray-900">{commerce.rating}</span>
                      </div>
                      <button
                        onClick={() => setSelectedCommerce(commerce)}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700"
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScan={handleScanResult}
        />
      )}

      {/* Commerce Details Popup */}
      <CommerceDetailsPopup
        open={!!selectedCommerce}
        onClose={() => setSelectedCommerce(null)}
        commerce={selectedCommerce}
      />

      {/* Operator Dashboard Modal */}
      <OperatorDashboardModal
        open={showOperatorDashboard}
        onOpenChange={setShowOperatorDashboard}
      />
    </div>
  );
};