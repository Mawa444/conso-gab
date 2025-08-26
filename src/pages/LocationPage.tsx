import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin, Smartphone, Info, Users } from "lucide-react";

interface LocationPageProps {
  onNext: (locationData: { useGPS: boolean; manualLocation?: string }) => void;
  onBack: () => void;
}

export const LocationPage = ({ onNext, onBack }: LocationPageProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [gpsPermission, setGpsPermission] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const handleGPSRequest = async () => {
    setGpsPermission('requesting');
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });
      
      setGpsPermission('granted');
      onNext({ useGPS: true });
    } catch (error) {
      setGpsPermission('denied');
    }
  };

  const handleManualContinue = () => {
    if (manualLocation.trim()) {
      onNext({ useGPS: false, manualLocation: manualLocation.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 px-6 py-8 flex flex-col justify-center relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-10 right-10 text-4xl opacity-20 animate-pulse">🇬🇦</div>
      <div className="absolute bottom-20 left-10 text-3xl opacity-15 animate-bounce">📍</div>

      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
            <MapPin className="h-10 w-10 text-white" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Découvrez votre communauté locale
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Savez-vous que je peux vous mettre en relation directe avec les opérateurs économiques de votre région ?
            </p>
            <p className="text-primary font-medium">
              Activez la localisation pour découvrir les services les plus proches de vous.
            </p>
          </div>
        </div>

        {/* Options de localisation */}
        <div className="space-y-4 animate-fade-in delay-300">
          {/* Option GPS */}
          <Card 
            className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer group hover:shadow-lg"
            onClick={handleGPSRequest}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  📍 Activer ma position GPS
                </h3>
                <p className="text-sm text-muted-foreground">
                  Localisation précise et automatique
                </p>
              </div>
            </div>
            
            {gpsPermission === 'requesting' && (
              <div className="mt-4 flex items-center space-x-2 text-primary">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Demande d'autorisation...</span>
              </div>
            )}
            
            {gpsPermission === 'denied' && (
              <div className="mt-4 text-sm text-muted-foreground">
                ⚠️ Autorisation refusée. Essayez l'option manuelle ci-dessous.
              </div>
            )}
          </Card>

          {/* Option manuelle */}
          <Card className="p-6 bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Je préfère entrer manuellement mon quartier
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Saisissez votre localisation
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="location">Votre quartier ou ville</Label>
                <Input
                  id="location"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="Ex: Libreville, Akanda, Port-Gentil..."
                  className="text-base"
                />
                
                <Button
                  onClick={handleManualContinue}
                  disabled={!manualLocation.trim()}
                  className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-white font-semibold disabled:opacity-50"
                >
                  Continuer avec cette localisation
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Bouton info */}
        <div className="flex justify-center animate-fade-in delay-500">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="border-primary/30 text-primary hover:bg-primary/5"
          >
            <Info className="h-4 w-4 mr-2" />
            Pourquoi ma localisation ?
          </Button>
        </div>

        {/* Popup info */}
        {showInfo && (
          <Card className="p-4 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20 animate-scale-in">
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-accent mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Renseigner votre quartier permet à ConsoGab de mieux vous connecter à votre communauté locale 
                et de vous proposer les services les plus pertinents près de chez vous.
              </p>
            </div>
          </Card>
        )}

        {/* Bouton retour */}
        <div className="pt-2 animate-fade-in delay-700">
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
};