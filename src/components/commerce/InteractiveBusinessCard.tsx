import { MapPin, MessageCircle, Phone, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface BusinessCardData {
  id: string;
  name: string;
  logo_url?: string;
  business_category?: string;
  category?: string;
  description?: string;
  address?: string;
  city?: string;
  distance?: string;
  rating?: number;
  verified?: boolean;
  whatsapp?: string;
  cover_image_url?: string;
}

interface InteractiveBusinessCardProps {
  business: BusinessCardData;
  onSelect?: (business: BusinessCardData) => void;
  onMessage?: (business: BusinessCardData) => void;
  onCall?: (business: BusinessCardData) => void;
  onCatalog?: (business: BusinessCardData) => void;
}

export const InteractiveBusinessCard = ({ 
  business, 
  onSelect, 
  onMessage,
  onCall,
  onCatalog
}: InteractiveBusinessCardProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const autoplay = useCallback(() => {
    return Autoplay({ 
      delay: 4000, 
      stopOnInteraction: false,
      stopOnMouseEnter: false
    });
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 20 },
    [autoplay()]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const handleMouseEnter = () => {
    if (emblaApi) {
      const autoplayPlugin = emblaApi.plugins()?.autoplay;
      if (autoplayPlugin) autoplayPlugin.stop();
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (emblaApi) {
      const autoplayPlugin = emblaApi.plugins()?.autoplay;
      if (autoplayPlugin) autoplayPlugin.play();
      setIsPaused(false);
    }
  };

  const handleCardClick = () => {
    if (!isPaused) {
      onSelect?.(business);
    }
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage?.(business);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCall?.(business);
  };

  const handleCatalog = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCatalog?.(business);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "w-5 h-5",
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
        )}
      />
    ));
  };

  const businessRating = business.rating || 4.5;
  const businessDistance = business.distance || "3.2 km";
  const businessCategory = business.business_category || business.category || "Divertissement";
  const mockSchedule = "maintenant jusqu'à 19h";

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg border-border/50"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {/* Slide 1: Informations */}
          <div className="flex-[0_0_100%] min-w-0">
            <CardContent className="p-6">
              <div className="flex gap-6 items-center">
                {/* Image circulaire */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full border-4 border-primary overflow-hidden bg-card">
                    {business.logo_url ? (
                      <img 
                        src={business.logo_url} 
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-4xl font-bold text-primary">
                          {business.name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu central */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {business.name}
                  </h2>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-semibold">{businessRating}</span>
                    <div className="flex gap-1">
                      {renderStars(businessRating)}
                    </div>
                  </div>

                  <Badge className="mb-3 bg-primary text-primary-foreground px-4 py-1 text-sm">
                    {businessCategory}
                  </Badge>

                  <p className="text-lg text-muted-foreground mb-3">
                    {business.description || "Explorez de nouveaux mondes"}
                  </p>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-medium">{businessDistance}</span>
                    <span className="text-sm">{mockSchedule}</span>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col gap-4">
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90"
                    onClick={handleMessage}
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="sr-only">Chat</span>
                  </Button>
                  
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90"
                    onClick={handleCall}
                  >
                    <Phone className="w-6 h-6" />
                    <span className="sr-only">Appeler</span>
                  </Button>
                  
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90"
                    onClick={handleCatalog}
                  >
                    <BookOpen className="w-6 h-6" />
                    <span className="sr-only">Catalogue</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>

          {/* Slide 2: Image publicitaire 1 */}
          <div className="flex-[0_0_100%] min-w-0">
            <div className="relative h-64 bg-gradient-to-br from-primary/20 to-primary/5">
              {business.cover_image_url ? (
                <img 
                  src={business.cover_image_url} 
                  alt={`Publicité ${business.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Offre spéciale
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      Découvrez nos promotions
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Slide 3: Image publicitaire 2 */}
          <div className="flex-[0_0_100%] min-w-0">
            <div className="relative h-64 bg-gradient-to-br from-secondary/20 to-secondary/5">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Nouveauté
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Venez découvrir nos nouveaux produits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs de slide */}
      <div className="flex justify-center gap-2 pb-4">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              emblaApi?.scrollTo(index);
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              selectedIndex === index ? "bg-primary w-6" : "bg-muted"
            )}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </Card>
  );
};
