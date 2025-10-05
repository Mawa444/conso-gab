import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import gabomaLogo from "@/assets/gaboma-logo.png";

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen = ({ onStart }: SplashScreenProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Dégradé patriotique Gabon: Vert → Jaune → Bleu */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#009739] via-[#FFD100] to-[#0066B3]" />
      
      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="relative z-10 text-center">
        {/* Logo centré */}
        <div className="mb-12">
          <img 
            src={gabomaLogo} 
            alt="Gaboma Logo" 
            className="w-40 h-40 object-contain mx-auto mb-6"
            onError={(e) => {
              // Fallback si l'image n'est pas trouvée
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-40 h-40 bg-white rounded-full flex items-center justify-center mx-auto mb-6';
              fallback.innerHTML = '<span class="text-4xl font-bold text-[#009739]">G</span>';
              e.currentTarget.parentElement!.appendChild(fallback);
            }}
          />
        </div>

        {/* Slogan patriotique */}
        <div className="mb-12 space-y-2">
          <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
            Achetons, vendons et consommons<br />
            <span className="text-3xl">100% Gaboma</span>
          </h1>
          <p className="text-lg text-white/90 font-medium">
            Boostons notre économie 🇬🇦
          </p>
        </div>

        {/* Bouton Commencer */}
        <Button
          onClick={onStart}
          size="lg"
          className="bg-white text-black hover:bg-white/90 font-semibold py-4 px-8 rounded-xl shadow-2xl text-lg min-w-[200px]"
        >
          Commencer
        </Button>
      </div>

      {/* Animations de fond subtiles */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
};