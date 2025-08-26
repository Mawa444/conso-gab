import { useState } from "react";
import { Camera, X, Flashlight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  onClose: () => void;
  onScan: (result: string) => void;
}

export const QRScanner = ({ onClose, onScan }: QRScannerProps) => {
  const [isFlashOn, setIsFlashOn] = useState(false);

  // Simulation du scan - en production, vous utiliseriez une vraie librairie de scan QR
  const handleMockScan = () => {
    // Simule différents types de commerces
    const mockData = [
      {
        id: "commerce_001",
        name: "Boulangerie Chez Mama Nzé",
        type: "Boulangerie",
        owner: "Marie Nzé",
        address: "Quartier Nombakélé, Libreville",
        rating: 4.8,
        verified: true,
        employees: ["Jean-Claude", "Esperance", "David"]
      },
      {
        id: "commerce_002", 
        name: "Salon de Beauté Gaboma",
        type: "Salon de beauté",
        owner: "Grace Obiang",
        address: "Boulevard Triomphal, Libreville",
        rating: 4.6,
        verified: true,
        employees: ["Grace Obiang", "Sylvie", "Fatou"]
      }
    ];
    
    const randomCommerce = mockData[Math.floor(Math.random() * mockData.length)];
    onScan(JSON.stringify(randomCommerce));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[1200] flex items-center justify-center">
      <div className="relative w-full h-full max-w-md mx-auto">
        
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFlashOn(!isFlashOn)}
            className={cn(
              "bg-black/50 hover:bg-black/70",
              isFlashOn ? "text-yellow-400" : "text-white"
            )}
          >
            <Flashlight className="w-5 h-5" />
          </Button>
        </div>

        {/* Scanner Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-72 h-72">
            
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl" />
            
            {/* Scanner frame */}
            <div className="scanner-overlay absolute inset-4 rounded-xl">
              
              {/* Corner indicators */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg" />
              <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg" />
              
              {/* Scanning line animation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-bounce-soft" />
              
              {/* Camera icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-32 left-4 right-4 text-center">
          <h3 className="text-white text-lg font-semibold mb-2">
            Scanner un commerce 100% Gaboma
          </h3>
          <p className="text-white/80 text-sm mb-6">
            Positionnez le QR code dans le cadre pour découvrir le commerce
          </p>
          
          {/* Mock scan button for demo */}
          <Button
            onClick={handleMockScan}
            variant="gaboma"
            size="lg"
            className="w-full"
          >
            Simuler un scan (Demo)
          </Button>
        </div>
      </div>
    </div>
  );
};