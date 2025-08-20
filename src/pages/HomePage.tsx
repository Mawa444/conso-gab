import { useState } from "react";
import { QrCode, MapPin, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommerceCard } from "@/components/commerce/CommerceCard";
import { QRScanner } from "@/components/scanner/QRScanner";
import gabomaLogo from "@/assets/gaboma-logo.png";
import heroImage from "@/assets/hero-marketplace.jpg";

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
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
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
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Marché gabonais" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Header content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={gabomaLogo} 
                alt="100% Gaboma" 
                className="w-12 h-12 rounded-lg shadow-lg"
              />
              <div>
                <h1 className="text-white font-bold text-xl">100% Gaboma</h1>
                <p className="text-white/90 text-sm">Consommer local, c'est patriote!</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("map")}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            >
              <MapPin className="w-4 h-4 mr-1" />
              Autour de moi
            </Button>
          </div>

          {/* CTA Principal */}
          <div className="text-center">
            <Button
              onClick={() => setShowScanner(true)}
              variant="hero"
              size="xl"
              className="w-full max-w-xs mx-auto animate-pulse-soft"
            >
              <QrCode className="w-6 h-6 mr-2" />
              Scanner un commerce
            </Button>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="px-4 -mt-8 relative z-10">
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

      {/* Commerce du mois */}
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