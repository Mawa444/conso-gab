import { useState } from "react";
import { X, Star, Heart, Share2, Phone, MessageCircle, MapPin, Clock, Users, Award, ChevronLeft, ChevronRight, Flag, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfessionalCatalog } from "./ProfessionalCatalog";

interface Commerce {
  id: string;
  name: string;
  type: string;
  owner: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating: number;
  reviewCount?: number;
  verified: boolean;
  employees: string[];
  description?: string;
  hours?: string;
  distance?: string;
  images?: string[];
  coverImage?: string;
  logo?: string;
  badges?: string[];
  socialStats?: {
    followers: number;
    visits: number;
    products: number;
  };
  reviews?: Array<{
    id: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }>;
}

interface EnhancedCommerceDetailsPopupProps {
  open: boolean;
  onClose: () => void;
  commerce: Commerce;
  onMessage?: (commerce: Commerce) => void;
}

export const EnhancedCommerceDetailsPopup = ({ 
  open, 
  onClose, 
  commerce, 
  onMessage 
}: EnhancedCommerceDetailsPopupProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  if (!open) return null;

  // Données d'exemple enrichies
  const enrichedCommerce = {
    ...commerce,
    images: commerce.images || [
      "/api/placeholder/400/300",
      "/api/placeholder/400/300",
      "/api/placeholder/400/300"
    ],
    coverImage: commerce.coverImage || "/api/placeholder/800/400",
    logo: commerce.logo || "/api/placeholder/100/100",
    description: commerce.description || "Découvrez notre entreprise locale avec des produits et services de qualité. Nous nous engageons à offrir la meilleure expérience client possible avec un service personnalisé et des prix compétitifs.",
    hours: commerce.hours || "Lundi - Vendredi: 8h00 - 18h00\nSamedi: 9h00 - 17h00\nDimanche: Fermé",
    phone: commerce.phone || "+241 01 23 45 67",
    email: commerce.email || "contact@commerce.ga",
    badges: commerce.badges || ["Entreprise Vérifiée", "Service 5⭐", "Populaire à Libreville"],
    socialStats: commerce.socialStats || {
      followers: 1250,
      visits: 3400,
      products: 45
    },
    reviews: commerce.reviews || [
      {
        id: "1",
        userName: "Marie Nzamba",
        rating: 5,
        comment: "Excellent service ! Personnel très accueillant et produits de qualité. Je recommande vivement cette entreprise.",
        date: "2024-01-15",
        verified: true
      },
      {
        id: "2",
        userName: "Jean-Paul Obiang",
        rating: 4,
        comment: "Très satisfait de mon expérience. Bonne qualité prix et service rapide.",
        date: "2024-01-10",
        verified: true
      },
      {
        id: "3",
        userName: "Grace Mouendou",
        rating: 5,
        comment: "Une entreprise sérieuse avec des employés compétents. Toujours un plaisir de faire affaire avec eux.",
        date: "2024-01-08",
        verified: false
      }
    ]
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === enrichedCommerce.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? enrichedCommerce.images.length - 1 : prev - 1
    );
  };

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
        title: enrichedCommerce.name,
        text: `Découvrez ${enrichedCommerce.name} - ${enrichedCommerce.type}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleCall = () => {
    window.open(`tel:${enrichedCommerce.phone}`, '_self');
  };

  const handleDirections = () => {
    const address = encodeURIComponent(enrichedCommerce.address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 bg-background z-[1200] overflow-y-auto">
        {/* Header avec image de couverture */}
        <div className="relative h-64 bg-muted/30">
          <img 
            src={enrichedCommerce.coverImage}
            alt={enrichedCommerce.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Boutons d'action header */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white">
              <X className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare} className="bg-white/20 hover:bg-white/30 text-white">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsFavorite(!isFavorite)} className="bg-white/20 hover:bg-white/30 text-white">
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Informations principales sur l'image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white/20 bg-white/10 backdrop-blur-sm">
                <img 
                  src={enrichedCommerce.logo}
                  alt={`Logo ${enrichedCommerce.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{enrichedCommerce.name}</h1>
                  {enrichedCommerce.verified && (
                    <Badge className="bg-green-500 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                </div>
                <p className="text-white/90 mb-2">{enrichedCommerce.type}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{enrichedCommerce.rating}</span>
                    <span className="text-white/70">({enrichedCommerce.reviewCount || enrichedCommerce.reviews.length} avis)</span>
                  </div>
                  {enrichedCommerce.distance && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{enrichedCommerce.distance}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-4 space-y-6">
          {/* Équipe et présentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Équipe et Présentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Propriétaire: {enrichedCommerce.owner}</h4>
                <p className="text-muted-foreground text-sm">
                  {enrichedCommerce.description}
                </p>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Équipe ({enrichedCommerce.employees.length} membres)</h5>
                <div className="flex gap-2 flex-wrap">
                  {enrichedCommerce.employees.map((employee, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {employee.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{employee}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations pratiques */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">{enrichedCommerce.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">{enrichedCommerce.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Horaires</p>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {enrichedCommerce.hours}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques sociales */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{enrichedCommerce.socialStats.visits.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Visites</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{enrichedCommerce.socialStats.followers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Abonnés</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{enrichedCommerce.socialStats.products}</p>
                  <p className="text-sm text-muted-foreground">Produits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges et gamification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Badges et Récompenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {enrichedCommerce.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10">
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Catalogue professionnel */}
          <Card>
            <CardHeader>
              <CardTitle>Catalogue</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfessionalCatalog
                commerceId={enrichedCommerce.id}
                commerceName={enrichedCommerce.name}
                type="mixed"
                onMessage={() => setShowMessageModal(true)}
              />
            </CardContent>
          </Card>

          {/* Galerie d'images */}
          {enrichedCommerce.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Galerie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-muted/30 rounded-lg overflow-hidden">
                  <img 
                    src={enrichedCommerce.images[currentImageIndex]}
                    alt={`Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {enrichedCommerce.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {enrichedCommerce.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentImageIndex 
                                ? 'bg-white' 
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                  J'aime
                </Button>
                <Button
                  variant={isDisliked ? "destructive" : "outline"}
                  onClick={handleDislike}
                  className="flex items-center gap-2"
                >
                  👎 Pas pour moi
                </Button>
                <Button 
                  variant="outline" 
                  disabled
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contacter (Bientôt)
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Flag className="w-4 h-4" />
                  Signaler
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Avis clients */}
          <Card>
            <CardHeader>
              <CardTitle>Avis clients ({enrichedCommerce.reviews.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrichedCommerce.reviews.map((review) => (
                <div key={review.id} className="flex gap-3 p-4 bg-muted/30 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.userAvatar} />
                    <AvatarFallback>
                      {review.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{review.userName}</span>
                      {review.verified && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions flottantes */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDirections}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Itinéraire
            </Button>
            <Button
              className="flex-1"
              onClick={handleCall}
            >
              <Phone className="w-4 h-4 mr-2" />
              Appeler
            </Button>
          </div>
        </div>
      </div>

      {/* Messaging functionality will be re-implemented */}
    </>
  );
};