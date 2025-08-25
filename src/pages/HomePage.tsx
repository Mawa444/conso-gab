import { useState } from "react";
import { QRScanner } from "@/components/scanner/QRScanner";
import { AdCarousel } from "@/components/advertising/AdCarousel";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { StatsBlock } from "@/components/blocks/StatsBlock";
import { ActionButtonsBlock } from "@/components/blocks/ActionButtonsBlock";
import { CommerceListBlock } from "@/components/blocks/CommerceListBlock";
import { CategoriesSection } from "@/components/blocks/CategoriesSection";

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
}

export const HomePage = ({ onNavigate, onMessage }: HomePageProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCommerce, setScannedCommerce] = useState<any>(null);

  const handleScanResult = (result: string) => {
    try {
      const commerce = JSON.parse(result);
      setScannedCommerce(commerce);
      setShowScanner(false);
    } catch (error) {
      console.error("Erreur lors du parsing du QR code:", error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section avec recherche intégrée - Pleine largeur */}
      <HeroBlock 
        onSearch={(item) => {
          console.log("Recherche sélectionnée:", item);
          // Traitement de la sélection
        }}
      />

      {/* Contenu principal avec espacements */}
      <div className="space-y-8 p-4">
        {/* Statistiques rapides */}
        <StatsBlock />

        {/* Carrousel publicitaire entre catégories */}
        <div className="relative">
          <AdCarousel />
        </div>

        {/* Actions principales */}
        <ActionButtonsBlock
          onScanClick={() => setShowScanner(true)}
          onNearbyClick={() => onNavigate("map")}
          onRankingsClick={() => onNavigate("rankings")}
          onTopBusinessesClick={() => console.log("Top businesses")}
        />

        {/* Commerces sponsorisés */}
        <CommerceListBlock
          title="Commerces sponsorisés"
          commerces={sponsoredCommerces}
          onSelect={(commerce) => console.log("Commerce sélectionné:", commerce)}
          onFavorite={(commerce) => console.log("Favoris:", commerce)}
          onMessage={onMessage}
          showFilters={false}
          viewMode="grid"
        />

        {/* Carrousel publicitaire après les commerces */}
        <div className="relative">
          <AdCarousel />
        </div>

        {/* Toutes les catégories */}
        <CategoriesSection />
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onScan={handleScanResult}
        />
      )}
    </div>
  );
};