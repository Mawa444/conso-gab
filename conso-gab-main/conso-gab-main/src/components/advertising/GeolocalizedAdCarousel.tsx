import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { advertisements } from "@/data/advertisements";

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
    const allGeolocalizedAds = advertisements.filter(ad => ad.type === 'geolocalized');
    const localAds = allGeolocalizedAds.filter(ad => ad.targetZone === userLocation);
    const nationalAds = allGeolocalizedAds.filter(ad => ad.targetZone === "Libreville"); // Fallback

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