import { useState } from "react";
import { QRScanner } from "@/components/scanner/QRScanner";
import { AdCarousel } from "@/components/advertising/AdCarousel";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { StatsBlock } from "@/components/blocks/StatsBlock";
import { ActionButtonsBlock } from "@/components/blocks/ActionButtonsBlock";
import { CommerceListBlock } from "@/components/blocks/CommerceListBlock";

const featuredCommerces = [
  {
    id: "featured_001",
    name: "Restaurant Chez Tonton",
    type: "Restaurant traditionnel",
    owner: "Paul Mba",
    address: "Quartier Glass, Libreville",
    rating: 4.9,
    verified: true,
    employees: ["Paul", "Marie", "Jean", "Sylvie"],
    distance: "800m",
    isFavorite: false
  },
  {
    id: "featured_002",
    name: "Boutique Mode Gaboma",
    type: "Vêtements & Accessoires",
    owner: "Céline Ndong",
    address: "Avenue de l'Indépendance",
    rating: 4.7,
    verified: true,
    employees: ["Céline", "Grace", "Fatima"],
    distance: "1.2km",
    isFavorite: true
  },
  {
    id: "featured_003",
    name: "Pharmacie du Centre",
    type: "Pharmacie",
    owner: "Dr. Michel Moussirou",
    address: "Centre-ville, Libreville",
    rating: 4.8,
    verified: true,
    employees: ["Dr. Michel", "Infirmière Anne", "Assistant Pierre"],
    distance: "500m",
    isFavorite: false
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
    <div className="min-h-screen space-y-8 p-4 animate-fade-in">
      {/* Hero Section avec recherche intégrée */}
      <HeroBlock 
        onSearch={(item) => {
          console.log("Recherche sélectionnée:", item);
          // Traitement de la sélection
        }}
      />

      {/* Carrousel publicitaire - avec espacement harmonisé */}
      <div className="relative">
        <AdCarousel />
      </div>

      {/* Statistiques rapides - redesignées */}
      <StatsBlock />

      {/* Actions principales - harmonisées */}
      <ActionButtonsBlock
        onScanClick={() => setShowScanner(true)}
        onNearbyClick={() => onNavigate("map")}
        onRankingsClick={() => onNavigate("rankings")}
        onTopBusinessesClick={() => console.log("Top businesses")}
      />

      {/* Commerces recommandés - redesignés */}
      <CommerceListBlock
        title="Commerces recommandés"
        commerces={featuredCommerces}
        onSelect={(commerce) => console.log("Commerce sélectionné:", commerce)}
        onFavorite={(commerce) => console.log("Favoris:", commerce)}
        onMessage={onMessage}
        showFilters={true}
        viewMode="grid"
      />

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