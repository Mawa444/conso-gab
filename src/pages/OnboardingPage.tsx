import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, ShoppingCart, Award, MessageCircle } from "lucide-react";

interface OnboardingPageProps {
  onComplete: () => void;
}

const onboardingSlides = [
  {
    id: 1,
    icon: ShoppingCart,
    title: "Découverte",
    description: "Trouvez et soutenez les commerces 100% Gaboma 🇬🇦",
    color: "text-primary"
  },
  {
    id: 2,
    icon: Award,
    title: "Gamification", 
    description: "Notez, laissez des avis, gagnez des points & badges",
    color: "text-secondary-foreground"
  },
  {
    id: 3,
    icon: MessageCircle,
    title: "Messagerie & réservation",
    description: "Envoyez des messages rapides : réservation, devis, rendez-vous",
    color: "text-accent"
  }
];

export const OnboardingPage = ({ onComplete }: OnboardingPageProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = onboardingSlides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 px-6 py-12 flex flex-col">
      {/* Header avec skip */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold">Découvrons Gaboma</h1>
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          Passer
        </Button>
      </div>

      {/* Indicateur de progression */}
      <div className="flex justify-center mb-12">
        <div className="flex space-x-2">
          {onboardingSlides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : index < currentSlide 
                    ? 'w-2 bg-primary/50' 
                    : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-sm p-8 text-center bg-background/80 backdrop-blur-sm shadow-xl">
          <div className="space-y-6">
            {/* Icône */}
            <div className={`w-24 h-24 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center ${slide.color}`}>
              <IconComponent className="h-12 w-12" />
            </div>

            {/* Contenu */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{slide.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {slide.description}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="space-y-4 mt-8">
        <Button
          onClick={handleNext}
          className="w-full py-3 text-lg font-semibold"
          size="lg"
        >
          {currentSlide < onboardingSlides.length - 1 ? (
            <>
              Suivant
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          ) : (
            "C'est parti !"
          )}
        </Button>
      </div>
    </div>
  );
};