import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Publicités par zone géographique
const advertisementsByLocation = {
  "Libreville": [{
    id: 1,
    title: "Restaurant Le Jardin des Saveurs",
    subtitle: "Cuisine française et gabonaise - Livraison gratuite à Libreville",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop",
    backgroundColor: "from-emerald-500 to-teal-600",
    cta: "Commander maintenant",
    targetZone: "Libreville"
  }, {
    id: 2,
    title: "Pharmacie Moderna Libreville",
    subtitle: "Vos médicaments livrés en 30 minutes dans tout Libreville",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop",
    backgroundColor: "from-blue-500 to-indigo-600",
    cta: "Voir les produits",
    targetZone: "Libreville"
  }, {
    id: 3,
    title: "Supermarché Carrefour Libreville",
    subtitle: "Promotion spéciale : -20% sur tous les produits frais",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&h=400&fit=crop",
    backgroundColor: "from-orange-500 to-red-600",
    cta: "Profiter de l'offre",
    targetZone: "Libreville"
  }],
  "Nzeng-Ayong": [{
    id: 4,
    title: "Boulangerie Chez Mama Nzeng-Ayong",
    subtitle: "Pain frais tous les matins - Spécialités locales",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=400&fit=crop",
    backgroundColor: "from-amber-500 to-orange-600",
    cta: "Réserver votre pain",
    targetZone: "Nzeng-Ayong"
  }, {
    id: 5,
    title: "Garage Auto Nzeng-Ayong",
    subtitle: "Réparation et entretien automobile - Service rapide",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=400&fit=crop",
    backgroundColor: "from-slate-500 to-gray-600",
    cta: "Prendre rendez-vous",
    targetZone: "Nzeng-Ayong"
  }],
  "Owendo": [{
    id: 6,
    title: "Marché d'Owendo",
    subtitle: "Produits frais et locaux - Ouvert tous les jours",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=400&fit=crop",
    backgroundColor: "from-green-500 to-emerald-600",
    cta: "Découvrir les produits",
    targetZone: "Owendo"
  }, {
    id: 7,
    title: "École Technique d'Owendo",
    subtitle: "Formations professionnelles - Inscriptions ouvertes",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
    backgroundColor: "from-indigo-500 to-purple-600",
    cta: "S'inscrire maintenant",
    targetZone: "Owendo"
  }],
  "Port-Gentil": [{
    id: 8,
    title: "Hôtel Atlantique Port-Gentil",
    subtitle: "Vue sur l'océan - Réservation en ligne disponible",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop",
    backgroundColor: "from-cyan-500 to-blue-600",
    cta: "Réserver maintenant",
    targetZone: "Port-Gentil"
  }, {
    id: 9,
    title: "Clinique Maritime Port-Gentil",
    subtitle: "Soins de qualité - Urgences 24h/24",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=400&fit=crop",
    backgroundColor: "from-red-500 to-pink-600",
    cta: "Prendre rendez-vous",
    targetZone: "Port-Gentil"
  }],
  "Lambaréné": [{
    id: 10,
    title: "Hôpital Albert Schweitzer",
    subtitle: "Centre médical de référence - Consultations spécialisées",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=400&fit=crop",
    backgroundColor: "from-teal-500 to-green-600",
    cta: "Prendre rendez-vous",
    targetZone: "Lambaréné"
  }]
};
interface GeolocalizedAdCarouselProps {
  userLocation?: string;
  className?: string;
}
export const GeolocalizedAdCarousel = ({
  userLocation = "Libreville",
  className
}: GeolocalizedAdCarouselProps) => {
  // Obtenir les publicités pour la zone géographique
  const getAdsForLocation = () => {
    const localAds = advertisementsByLocation[userLocation as keyof typeof advertisementsByLocation] || [];
    const nationalAds = advertisementsByLocation["Libreville"] || []; // Fallback vers Libreville

    // Mélanger les publicités locales avec quelques nationales
    const allAds = [...localAds];
    if (localAds.length < 3) {
      allAds.push(...nationalAds.slice(0, 3 - localAds.length));
    }
    return allAds;
  };
  const slides = getAdsForLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<1 | -1>(1);

  // Auto-play functionality with random direction
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    // Set random direction on mount
    const randomDirection = Math.random() > 0.5 ? 1 : -1;
    setScrollDirection(randomDirection);
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        const nextIndex = scrollDirection === 1 ? (prev + 1) % slides.length : (prev - 1 + slides.length) % slides.length;
        return nextIndex;
      });
    }, 4500 + Math.random() * 3000); // Random interval between 4.5-7.5s

    return () => clearInterval(interval);
  }, [isAutoPlaying, scrollDirection, slides.length]);
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  if (slides.length === 0) return null;
  return <div className={`relative w-full h-64 rounded-xl overflow-hidden shadow-lg group z-10 ${className}`}>
      {/* Slides */}
      <div className="flex h-full transition-transform duration-700 ease-out touch-pan-x" style={{
      transform: `translateX(-${currentSlide * 100}%)`
    }}>
        {slides.map(slide => <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
            {/* Background avec gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundColor} opacity-90`} />
            
            {/* Image de fond */}
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-overlay" style={{
          backgroundImage: `url(${slide.image})`
        }} />
            
            {/* Contenu */}
            <div className="relative h-full flex flex-col justify-center items-center text-center p-6 text-white rounded-3xl">
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                Publicité • {slide.targetZone}
              </Badge>
              
              <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">
                {slide.title}
              </h2>
              
              <p className="text-lg mb-6 opacity-90 max-w-md drop-shadow">
                {slide.subtitle}
              </p>
              
              <Button variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105" onClick={() => console.log(`CTA clicked for slide ${slide.id} in ${userLocation}`)}>
                {slide.cta}
              </Button>
            </div>
          </div>)}
      </div>

      {/* Navigation Arrows - Hidden for touch-friendly experience */}
      {slides.length > 1 && <>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => <button key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'}`} onClick={() => goToSlide(index)} />)}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
            <div className="h-full bg-white transition-all duration-300 ease-linear" style={{
          width: isAutoPlaying ? '100%' : '0%',
          animation: isAutoPlaying ? 'progress 5s linear infinite' : 'none'
        }} />
          </div>
        </>}

      <style>
        {`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        `}
      </style>
    </div>;
};