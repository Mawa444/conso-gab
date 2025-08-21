import { useState } from "react";
import { QrCode, MapPin, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommerceCard } from "@/components/commerce/CommerceCard";
import { QRScanner } from "@/components/scanner/QRScanner";
import { AdCarousel } from "@/components/advertising/AdCarousel";
import gabomaLogo from "@/assets/gaboma-logo.png";

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
    <div className="min-h-screen animate-fade-in bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Section publicité et actions principales */}
      <div className="relative bg-gradient-to-br from-primary via-accent to-primary/90 text-white rounded-b-3xl overflow-hidden shadow-lg">
        <div className="p-4 space-y-6">
          {/* En-tête avec nom et actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={gabomaLogo} 
                alt="ConsoGab" 
                className="w-12 h-12 rounded-lg shadow-lg"
              />
              <div>
                <h1 className="text-white font-bold text-xl">ConsoGab</h1>
                <p className="text-white/90 text-sm">Consommer local, c'est patriote!</p>
              </div>
            </div>
          </div>

          {/* Carousel publicitaire */}
          <AdCarousel />
        </div>
      </div>

      {/* Actions principales */}
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setShowScanner(true)}
            variant="gaboma"
            size="lg"
            className="h-24 flex flex-col items-center justify-center gap-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <QrCode className="w-8 h-8" />
            Scanner un commerce
          </Button>
          
          <Button
            onClick={() => onNavigate("map")}
            variant="outline"
            size="lg"
            className="h-24 flex flex-col items-center justify-center gap-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2"
          >
            <MapPin className="w-8 h-8" />
            Autour de moi
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="px-4 -mt-2">
        <div className="bg-card rounded-xl shadow-lg border border-border/50 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">2,847</div>
              <div className="text-xs text-muted-foreground">Commerces</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">156k</div>
              <div className="text-xs text-muted-foreground">Clients actifs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">98%</div>
              <div className="text-xs text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Commerce scanné */}
      {scannedCommerce && (
        <div className="p-4">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">Commerce scanné</h3>
            </div>
            <CommerceCard 
              commerce={scannedCommerce} 
              variant="featured"
              onSelect={() => {/* Ouvrir le détail */}}
              onMessage={onMessage}
            />
          </div>
        </div>
      )}

      {/* Section Découvrir */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Découvrir près de vous
          </h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate("map")}
          >
            Voir tout
          </Button>
        </div>

        <div className="space-y-4">
          {featuredCommerces.map((commerce) => (
            <CommerceCard 
              key={commerce.id}
              commerce={commerce}
              variant="compact"
              onSelect={() => {/* Ouvrir le détail */}}
              onMessage={onMessage}
              onFavorite={(id) => {
                // Toggle favorite logic
                console.log("Toggle favorite for:", id);
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-16 flex-col gap-2"
            onClick={() => onNavigate("rankings")}
          >
            <TrendingUp className="w-5 h-5 text-accent" />
            <span className="text-sm">Top commerces</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex-col gap-2"
            onClick={() => onNavigate("profile")}
          >
            <Award className="w-5 h-5 text-secondary" />
            <span className="text-sm">Mes badges</span>
          </Button>
        </div>
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