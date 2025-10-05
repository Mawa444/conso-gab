import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { advertisements } from "@/data/advertisements";

interface AdCarouselProps {
  userLocation?: string;
}
export const AdCarousel = ({
  userLocation = "Libreville"
}: AdCarouselProps) => {
  // Filtrer les publicités selon la zone géographique
  const filteredSlides = advertisementSlides.filter(slide => slide.targetZone === "National" || slide.targetZone === userLocation);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<1 | -1>(1);

  // Disable auto-play for better performance - user can navigate manually
  useEffect(() => {
    // Removed auto-play to improve performance
    return;
  }, []);
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % filteredSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + filteredSlides.length) % filteredSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  return <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg group z-10">
      {/* Slides - Remove transitions for instant display */}
      <div className="flex h-full touch-pan-x" style={{
      transform: `translateX(-${currentSlide * 100}%)`
    }}>
        {filteredSlides.map(slide => <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
            {/* Background avec gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundColor} opacity-90`} />
            
            {/* Image de fond */}
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-overlay" style={{
          backgroundImage: `url(${slide.image})`
        }} />
            
            {/* Contenu */}
            <div className="relative h-full flex flex-col justify-center items-center text-center p-6 text-white rounded-3xl">
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                Publicité Partenaire
              </Badge>
              
              <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">
                {slide.title}
              </h2>
              
              <p className="text-lg mb-6 opacity-90 max-w-md drop-shadow">
                {slide.subtitle}
              </p>
              
              <Button variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                {slide.cta}
              </Button>
            </div>
          </div>)}
      </div>

      {/* Navigation Arrows - Hidden for touch-friendly experience */}

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {filteredSlides.map((_, index) => <button key={index} className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`} onClick={() => goToSlide(index)} />)}
      </div>

      {/* Removed all animations and @keyframes for performance */}
    </div>;
};