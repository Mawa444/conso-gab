import { useState } from "react";
import { ArrowLeft, Clock, MapPin, Share, Heart, Tag, Gift, Users, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PromotionDetail {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  discount: string;
  type: "percentage" | "fixed" | "bogo" | "special";
  originalPrice?: number;
  promotionalPrice?: number;
  image: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  conditions: string[];
  maxUses?: number;
  currentUses: number;
  tags: string[];
  business: {
    id: string;
    name: string;
    owner: string;
    address: string;
    rating: number;
    verified: boolean;
  };
  benefits: string[];
  restrictions: string[];
  howToUse: string[];
}

const mockPromotion: PromotionDetail = {
  id: "promo_001",
  title: "Promo Spéciale - Robe Traditionnelle",
  description: "15% de réduction sur toutes les robes traditionnelles gabonaises",
  detailedDescription: "Profitez de notre promotion exceptionnelle sur notre collection de robes traditionnelles confectionnées par nos artisans locaux. Chaque robe est unique et reflète l'authenticité de la culture gabonaise. Cette offre limitée vous permet d'acquérir des pièces d'exception à prix réduit.",
  discount: "15%",
  type: "percentage",
  originalPrice: 45000,
  promotionalPrice: 38250,
  image: "/placeholder.svg?height=300&width=400&text=Promo+Robe+Traditionnelle",
  startDate: "2024-01-15",
  endDate: "2024-02-15",
  isActive: true,
  conditions: [
    "Valable jusqu'au 15 février 2024",
    "Non cumulable avec d'autres offres",
    "Minimum d'achat : 30 000 FCFA",
    "Réservé aux 50 premiers clients"
  ],
  maxUses: 50,
  currentUses: 23,
  tags: ["Vêtements", "Traditionnel", "Artisanal", "Femme"],
  business: {
    id: "business_002",
    name: "Atelier Mama Rosine",
    owner: "Rosine Mbadinga",
    address: "Marché Mont-Bouët, Libreville",
    rating: 4.9,
    verified: true
  },
  benefits: [
    "Économisez jusqu'à 6 750 FCFA",
    "Produits artisanaux authentiques",
    "Finitions soignées garanties",
    "Possibilité de personnalisation gratuite"
  ],
  restrictions: [
    "Une utilisation par client",
    "Présentation obligatoire en magasin",
    "Non remboursable",
    "Valable uniquement en magasin"
  ],
  howToUse: [
    "Scannez le QR code en magasin",
    "Présentez cette promotion au vendeur",
    "Choisissez votre robe traditionnelle",
    "Profitez automatiquement de la réduction"
  ]
};

export const PromotionDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllConditions, setShowAllConditions] = useState(false);

  const promotion = mockPromotion; // En réalité, on fetcherait par ID

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  const getDaysRemaining = () => {
    const endDate = new Date(promotion.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getUsageProgress = () => {
    if (!promotion.maxUses) return 0;
    return (promotion.currentUses / promotion.maxUses) * 100;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: promotion.title,
        text: `${promotion.description} - ConsoGab`,
        url: window.location.href
      });
    } else {
      // Fallback pour WhatsApp
      const text = encodeURIComponent(`🔥 ${promotion.title}\n${promotion.description}\n\nDécouvrez cette promo sur ConsoGab: ${window.location.href}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleClaimPromo = () => {
    // Logique pour "profiter" de la promo
    console.log("Promo ajoutée aux favoris/wishlist");
    // Navigation vers le commerce ou ajout à une wishlist
    navigate(`/business/${promotion.business.id}`);
  };

  const handleVisitBusiness = () => {
    navigate(`/business/${promotion.business.id}`);
  };

  const daysRemaining = getDaysRemaining();
  const usageProgress = getUsageProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={cn("w-4 h-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24">
        {/* Image principale */}
        <div className="relative mb-6">
          <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-red-100 to-orange-100">
            <img 
              src={promotion.image} 
              alt={promotion.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Badge de réduction */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-500 text-white text-lg px-4 py-2 text-lg font-bold">
                -{promotion.discount} OFF
              </Badge>
            </div>

            {/* Statut */}
            <div className="absolute top-4 right-4">
              <Badge className={cn(
                "px-3 py-1",
                promotion.isActive 
                  ? "bg-[hsl(var(--gaboma-green))] text-white" 
                  : "bg-gray-500 text-white"
              )}>
                {promotion.isActive ? "Active" : "Expirée"}
              </Badge>
            </div>

            {/* Temps restant */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-sm">
                      {daysRemaining > 0 ? `${daysRemaining} jours restants` : "Dernières heures !"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expire le {new Date(promotion.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations principales */}
        <div className="space-y-6">
          {/* Titre et description */}
          <div>
            <h1 className="font-bold text-2xl mb-2">{promotion.title}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {promotion.description}
            </p>
            
            {/* Prix */}
            {promotion.originalPrice && promotion.promotionalPrice && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(promotion.promotionalPrice)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(promotion.originalPrice)}
                </span>
                <Badge className="bg-[hsl(var(--gaboma-green))] text-white">
                  Économisez {formatPrice(promotion.originalPrice - promotion.promotionalPrice)}
                </Badge>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {promotion.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          {/* Utilisation */}
          {promotion.maxUses && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-sm">Offre limitée</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {promotion.currentUses}/{promotion.maxUses} utilisées
                  </span>
                </div>
                <Progress value={usageProgress} className="h-2 mb-2" />
                <p className="text-xs text-orange-600">
                  Plus que {promotion.maxUses - promotion.currentUses} places disponibles !
                </p>
              </CardContent>
            </Card>
          )}

          {/* Commerce */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">{promotion.business.name[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{promotion.business.name}</h3>
                      {promotion.business.verified && (
                        <Badge variant="outline" className="text-xs border-[hsl(var(--gaboma-green))] text-[hsl(var(--gaboma-green))]">
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Par {promotion.business.owner}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">⭐ {promotion.business.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm text-muted-foreground">{promotion.business.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVisitBusiness}
                >
                  Voir
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Description détaillée */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Description de l'offre
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {promotion.detailedDescription}
              </p>
            </CardContent>
          </Card>

          {/* Avantages */}
          <Card className="border-[hsl(var(--gaboma-green))]/30 bg-[hsl(var(--gaboma-green))]/5">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-[hsl(var(--gaboma-green))]">
                <CheckCircle className="w-4 h-4" />
                Avantages inclus
              </h3>
              <ul className="space-y-2">
                {promotion.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-[hsl(var(--gaboma-green))] mt-0.5 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Comment l'utiliser */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Comment profiter de cette offre ?</h3>
              <ol className="space-y-2">
                {promotion.howToUse.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
                Conditions d'utilisation
              </h3>
              <ul className="space-y-2">
                {promotion.conditions.slice(0, showAllConditions ? undefined : 3).map((condition, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                    {condition}
                  </li>
                ))}
              </ul>
              {promotion.conditions.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllConditions(!showAllConditions)}
                  className="mt-2 text-amber-700 hover:bg-amber-100"
                >
                  {showAllConditions ? "Voir moins" : `Voir ${promotion.conditions.length - 3} conditions supplémentaires`}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Restrictions */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-red-700">Restrictions</h3>
              <ul className="space-y-2">
                {promotion.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                    {restriction}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Action principale */}
          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90 h-12 text-lg font-semibold"
              onClick={handleClaimPromo}
              disabled={!promotion.isActive || (promotion.maxUses && promotion.currentUses >= promotion.maxUses)}
            >
              {promotion.isActive ? (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Je profite de cette offre !
                </>
              ) : (
                "Offre expirée"
              )}
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleShare}
            >
              <Share className="w-4 h-4 mr-2" />
              Partager cette promotion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};