import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const advertisementSlides = [
  {
    id: 1,
    title: "Découvrez nos nouveaux partenaires",
    subtitle: "Plus de 50 nouveaux commerces rejoignent ConsoGab",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
    backgroundColor: "from-emerald-500 to-teal-600",
    cta: "Voir les nouveautés",
    targetZone: "Libreville"
  },
  {
    id: 2,
    title: "Promotion Spéciale",
    subtitle: "10% de réduction chez nos partenaires beauté",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
    backgroundColor: "from-rose-500 to-pink-600",
    cta: "Profiter de l'offre",
    targetZone: "Libreville"
  },
  {
    id: 3,
    title: "Nouvelle Zone de Livraison",
    subtitle: "ConsoGab s'étend maintenant à Port-Gentil",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    backgroundColor: "from-blue-500 to-indigo-600",
    cta: "En savoir plus",
    targetZone: "Port-Gentil"
  },
  {
    id: 4,
    title: "Programme de Fidélité",
    subtitle: "Gagnez des points à chaque achat et débloquez des récompenses",
    image: "https://images.unsplash.com/photo-1607734834519-d8576ae60ea7?w=800&h=400&fit=crop",
    backgroundColor: "from-amber-500 to-orange-600",
    cta: "Rejoindre maintenant",
    targetZone: "National"
  },
  {
    id: 5,
    title: "Restaurant Chez Maman Rosine",
    subtitle: "Spécialités gabonaises authentiques à Owendo",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop",
    backgroundColor: "from-orange-500 to-red-600",
    cta: "Commander maintenant",
    targetZone: "Owendo"
  },
  {
    id: 6,
    title: "Pharmacie Lambaréné Centre",
    subtitle: "Vos médicaments livrés en 30 minutes",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop",
    backgroundColor: "from-green-500 to-teal-600",
    cta: "Voir les produits",
    targetZone: "Lambaréné"
  }
];

interface AdCarouselProps {
  userLocation?: string;
}

export const AdCarousel = ({ userLocation = "Libreville" }: AdCarouselProps) => {
  // Filtrer les publicités selon la zone géographique
  const filteredSlides = advertisementSlides.filter(slide => 
    slide.targetZone === "National" || slide.targetZone === userLocation
  );
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<1 | -1>(1);

  // Auto-play functionality with random direction
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    // Set random direction on mount
    const randomDirection = Math.random() > 0.5 ? 1 : -1;
    setScrollDirection(randomDirection);
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextIndex = scrollDirection === 1 
          ? (prev + 1) % filteredSlides.length
          : (prev - 1 + filteredSlides.length) % filteredSlides.length;
        return nextIndex;
      });
    }, 4000 + Math.random() * 2000); // Random interval between 4-6s

    return () => clearInterval(interval);
  }, [isAutoPlaying, scrollDirection, filteredSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredSlides.length) % filteredSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg group z-10">
      {/* Slides */}
      <div 
        className="flex h-full transition-transform duration-700 ease-out touch-pan-x"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {filteredSlides.map((slide) => (
          <div 
            key={slide.id}
            className="w-full h-full flex-shrink-0 relative"
          >
            {/* Background avec gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundColor} opacity-90`} />
            
            {/* Image de fond */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-overlay"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Contenu */}
            <div className="relative h-full flex flex-col justify-center items-center text-center p-6 text-white">
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                Publicité Partenaire
              </Badge>
              
              <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">
                {slide.title}
              </h2>
              
              <p className="text-lg mb-6 opacity-90 max-w-md drop-shadow">
                {slide.subtitle}
              </p>
              
              <Button 
                variant="secondary" 
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105"
                onClick={() => console.log(`CTA clicked for slide ${slide.id}`)}
              >
                {slide.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Hidden for touch-friendly experience */}

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {filteredSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
        <div 
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{ 
            width: isAutoPlaying ? '100%' : '0%',
            animation: isAutoPlaying ? 'progress 5s linear infinite' : 'none'
          }}
        />
      </div>

      <style>
        {`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        `}
      </style>
    </div>
  );
};