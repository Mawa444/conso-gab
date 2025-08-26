import { useState } from "react";
import { X, Star, MapPin, Phone, Clock, Share, Heart, ThumbsUp, ThumbsDown, MessageCircle, Flag, Shield, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CommerceDetailsPopupProps {
  open: boolean;
  onClose: () => void;
  commerce: any;
  onMessage?: () => void;
}

export const CommerceDetailsPopup = ({ 
  open, 
  onClose, 
  commerce,
  onMessage 
}: CommerceDetailsPopupProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(commerce?.isFavorite || false);

  if (!open || !commerce) return null;

  // Images de démonstration - en réalité viendraient de l'API
  const images = [
    "/placeholder.svg?height=300&width=400",
    "/placeholder.svg?height=300&width=400&text=Intérieur",
    "/placeholder.svg?height=300&width=400&text=Équipe",
    "/placeholder.svg?height=300&width=400&text=Produits"
  ];

  const reviews = [
    { id: 1, user: "Marie K.", rating: 5, comment: "Excellent service, très professionnel !", date: "Il y a 2 jours" },
    { id: 2, user: "Jean P.", rating: 4, comment: "Bonne qualité, je recommande", date: "Il y a 1 semaine" },
    { id: 3, user: "Sarah M.", rating: 5, comment: "Toujours satisfaite de mes achats ici", date: "Il y a 2 semaines" }
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: commerce.name,
        text: `Découvrez ${commerce.name} sur Gaboma`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">{commerce.name[0]}</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">{commerce.name}</h2>
              <p className="text-sm text-muted-foreground">{commerce.type}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full w-10 h-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-4 space-y-6">
            {/* Galerie photos */}
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
                <img 
                  src={images[currentImageIndex]} 
                  alt={commerce.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 justify-center">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          index === currentImageIndex ? "bg-white" : "bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations principales */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" />
                    <span className="font-semibold">{commerce.rating}</span>
                    <span className="text-sm text-muted-foreground">(127 avis)</span>
                  </div>
                  {commerce.verified && (
                    <Badge variant="outline" className="text-xs border-[hsl(var(--gaboma-green))] text-[hsl(var(--gaboma-green))]">
                      <Shield className="w-3 h-3 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                    Top 3 de la semaine
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{commerce.address}</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm">{commerce.distance}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Ouvert • Ferme à 18h00</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+241 01 23 45 67</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {commerce.name} est reconnu pour son excellence dans le domaine {commerce.type.toLowerCase()}. 
                Dirigé par {commerce.owner}, notre équipe s'engage à vous offrir la meilleure expérience possible 
                avec des services de qualité et un accueil chaleureux typiquement gabonais.
              </p>
            </div>

            {/* Équipe */}
            <div className="space-y-3">
              <h3 className="font-semibold">Équipe ({commerce.employees?.length || 0})</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {commerce.employees?.map((employee: string, index: number) => (
                  <div key={index} className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white font-semibold mb-2">
                      {employee[0]}
                    </div>
                    <p className="text-xs text-muted-foreground">{employee}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("p-2 h-10 w-10", isLiked && "bg-[hsl(var(--gaboma-blue))] text-white")}
                  onClick={handleLike}
                >
                  <ThumbsUp className={cn("w-4 h-4", isLiked ? "fill-current" : "")} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("p-2 h-10 w-10", isDisliked && "bg-[hsl(var(--gaboma-yellow))] text-black")}
                  onClick={handleDislike}
                >
                  <ThumbsDown className={cn("w-4 h-4", isDisliked ? "fill-current" : "")} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-10 w-10"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={cn("w-4 h-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-10 w-10"
                  onClick={handleShare}
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                onClick={onMessage}
                className="bg-[hsl(var(--gaboma-green))] text-white hover:bg-[hsl(var(--gaboma-green))]/90 px-6"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contacter
              </Button>
            </div>

            <Separator />

            {/* Avis clients */}
            <div className="space-y-4">
              <h3 className="font-semibold">Avis clients</h3>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{review.user}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-3 h-3",
                                i < review.rating 
                                  ? "fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" 
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions finales */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(commerce.address)}`, '_blank')}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Itinéraire
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
            >
              <Phone className="w-4 h-4 mr-2" />
              Appeler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};