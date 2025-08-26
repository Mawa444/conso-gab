import { useState } from "react";
import { ArrowLeft, Star, MapPin, Phone, Clock, Share, Heart, ThumbsUp, ThumbsDown, MessageCircle, Navigation, ExternalLink, Users, Award, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalCatalog } from "@/components/commerce/ProfessionalCatalog";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BusinessDetail {
  id: string;
  name: string;
  type: string;
  owner: string;
  address: string;
  rating: number;
  verified: boolean;
  employees: string[];
  image?: string;
  distance?: string;
  reviewCount: number;
  phone: string;
  whatsapp?: string;
  website?: string;
  email?: string;
  description: string;
  openingHours: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
  };
  certifications: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Données d'exemple - en réalité elles viendraient de l'API
const mockBusiness: BusinessDetail = {  
  id: "business_001",
  name: "Restaurant Chez Tonton",
  type: "Restaurant Gabonais",
  owner: "Paul Mba",
  address: "Quartier Nombakélé, Libreville",
  rating: 4.8,
  verified: true,
  employees: ["Marie Nzé", "Jean Obiang", "Sophie Mbourou", "Alain Ekomi"],
  reviewCount: 127,
  phone: "+241 01 23 45 67",
  whatsapp: "+241 01 23 45 67",
  website: "https://restaurantcheztonton.ga",
  email: "contact@cheztonton.ga",
  description: "Restaurant familial proposant une cuisine gabonaise authentique depuis 15 ans. Spécialisé dans les plats traditionnels préparés avec des ingrédients locaux de qualité. Ambiance chaleureuse et service personnalisé pour vous faire découvrir les saveurs du Gabon.",
  openingHours: "Lundi à Samedi : 8h00 - 22h00 • Dimanche : 10h00 - 20h00",
  socialMedia: {
    facebook: "https://facebook.com/cheztonton",
    instagram: "@cheztonton_libreville",
    telegram: "@CheZtontonRestaurant"
  },
  certifications: ["Certification Hygiène", "Label Qualité Gaboma", "Commerce Vérifié"],
  coordinates: {
    lat: 0.4162,
    lng: 9.4673
  }
};

const reviews = [
  { id: 1, user: "Marie K.", rating: 5, comment: "Excellent service, très professionnel ! Les plats sont délicieux et l'accueil est parfait.", date: "Il y a 2 jours", verified: true },
  { id: 2, user: "Jean P.", rating: 4, comment: "Bonne qualité, je recommande. L'ambiance est agréable et les prix corrects.", date: "Il y a 1 semaine", verified: false },
  { id: 3, user: "Sarah M.", rating: 5, comment: "Toujours satisfaite de mes visites ici. Le poulet au nyembwe est exceptionnel !", date: "Il y a 2 semaines", verified: true },
  { id: 4, user: "Alain T.", rating: 4, comment: "Service rapide et personnel accueillant. Parfait pour un déjeuner d'affaires.", date: "Il y a 3 semaines", verified: false }
];

const images = [
  "/placeholder.svg?height=300&width=400",
  "/placeholder.svg?height=300&width=400&text=Intérieur",
  "/placeholder.svg?height=300&width=400&text=Équipe",
  "/placeholder.svg?height=300&width=400&text=Spécialités"
];

export const BusinessDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const business = mockBusiness; // En réalité, on fetcherait par ID

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
        title: business.name,
        text: `Découvrez ${business.name} sur ConsoGab`,
        url: window.location.href
      });
    }
  };

  const handleGetDirections = () => {
    const { lat, lng } = business.coordinates;
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${business.phone}`, '_self');
  };

  const handleWhatsApp = () => {
    if (business.whatsapp) {
      window.open(`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec image */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Galerie photos */}
        <div className="relative w-full h-full overflow-hidden">
          <img 
            src={images[currentImageIndex]} 
            alt={business.name}
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

      <div className="px-4 pb-24">
        {/* Info principale */}
        <div className="bg-card rounded-t-2xl -mt-6 relative z-10 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">{business.name[0]}</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">{business.name}</h1>
                <p className="text-muted-foreground">{business.type}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2"
            >
              <Heart className={cn("w-5 h-5", isFavorite ? "fill-red-500 text-red-500" : "")} />
            </Button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" />
                <span className="font-semibold">{business.rating}</span>
                <span className="text-sm text-muted-foreground">({business.reviewCount} avis)</span>
              </div>
              {business.verified && (
                <Badge variant="outline" className="text-xs border-[hsl(var(--gaboma-green))] text-[hsl(var(--gaboma-green))]">
                  <Award className="w-3 h-3 mr-1" />
                  Vérifié
                </Badge>
              )}
            </div>
            <Badge className="bg-gradient-to-r from-primary to-accent text-white">
              Top 3 de la semaine
            </Badge>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
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
                onClick={handleShare}
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              className="bg-[hsl(var(--gaboma-green))] text-white hover:bg-[hsl(var(--gaboma-green))]/90 px-6"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contacter
            </Button>
          </div>

          {/* Actions de contact */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              onClick={handleGetDirections}
              className="flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Itinéraire
            </Button>
            <Button
              onClick={handleCall}
              className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
            >
              <Phone className="w-4 h-4 mr-2" />
              Appeler
            </Button>
          </div>
        </div>

        {/* Tabs de contenu */}
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info" className="text-xs">Infos</TabsTrigger>
              <TabsTrigger value="catalog" className="text-xs">Menu</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs">Avis</TabsTrigger>
              <TabsTrigger value="team" className="text-xs">Équipe</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              {/* Informations détaillées */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{business.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{business.openingHours}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{business.phone}</span>
                  </div>

                  {business.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ExternalLink className="w-4 h-4" />
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        Site web
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">À propos</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {business.description}
                  </p>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {business.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Réseaux sociaux */}
              {(business.socialMedia.facebook || business.socialMedia.instagram || business.socialMedia.telegram) && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Suivez-nous</h3>
                    <div className="space-y-2">
                      {business.socialMedia.facebook && (
                        <a href={business.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                          📘 Facebook
                        </a>
                      )}
                      {business.socialMedia.instagram && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          📷 {business.socialMedia.instagram}
                        </div>
                      )}
                      {business.socialMedia.telegram && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          📱 {business.socialMedia.telegram}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="catalog" className="mt-6">
              <ProfessionalCatalog
                commerceId={business.id}
                commerceName={business.name}
                type="mixed"
                onMessage={() => console.log("Message au commerce")}
              />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 mt-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {review.user[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{review.user}</p>
                            {review.verified && (
                              <Badge variant="outline" className="text-xs border-[hsl(var(--gaboma-green))] text-[hsl(var(--gaboma-green))]">
                                Vérifié
                              </Badge>
                            )}
                          </div>
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
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="team" className="space-y-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Équipe ({business.employees.length} personnes)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {business.employees.map((employee, index) => (
                      <div key={index} className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white font-semibold mb-2 mx-auto">
                          {employee[0]}
                        </div>
                        <p className="text-sm font-medium">{employee}</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]" />
                          <span className="text-xs">4.{7 + index}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};