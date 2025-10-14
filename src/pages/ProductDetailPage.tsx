import { useState } from "react";
import { ArrowLeft, Star, Heart, MessageCircle, Share, MapPin, Plus, Minus, ShoppingCart, Info, Users, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStartConversation } from "@/hooks/use-start-conversation";

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  onSale: boolean;
  images: string[];
  category: string;
  description: string;
  detailedDescription: string;
  stock: number;
  availability: string;
  tags: string[];
  rating: number;
  reviews: number;
  sku: string;
  weight?: string;
  dimensions?: string;
  material?: string;
  madeIn: string;
  business: {
    id: string;
    name: string;
    owner: string;
    address: string;
    rating: number;
    distance: string;
  };
  specifications: { [key: string]: string };
  relatedProducts: string[];
}

const mockProduct: ProductDetail = {
  id: "prod_001",
  name: "Robe Traditionnelle Gabonaise Élégante",
  price: 45000,
  salePrice: 38000,
  onSale: true,
  images: [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400&text=Vue+dos",
    "/placeholder.svg?height=400&width=400&text=Détails",
    "/placeholder.svg?height=400&width=400&text=Modèle"
  ],
  category: "Vêtements Femmes",
  description: "Magnifique robe traditionnelle confectionnée avec des tissus authentiques gabonais.",
  detailedDescription: "Cette robe exceptionnelle est confectionnée à la main par nos artisans locaux avec des tissus wax authentiques importés directement d'Afrique de l'Ouest. Chaque motif raconte une histoire et reflète la richesse culturelle gabonaise. Parfaite pour les cérémonies, mariages, ou événements spéciaux.",
  stock: 5,
  availability: "Disponible",
  tags: ["Traditionnel", "Cérémonie", "Femme", "Authentique", "Artisanal"],
  rating: 4.8,
  reviews: 23,
  sku: "RTG-001",
  weight: "0.8 kg",
  dimensions: "Tailles: S, M, L, XL disponibles",
  material: "100% Coton Wax authentique",
  madeIn: "Fabriqué au Gabon",
  business: {
    id: "business_002",
    name: "Atelier Mama Rosine",
    owner: "Rosine Mbadinga",
    address: "Marché Mont-Bouët, Libreville",
    rating: 4.9,
    distance: "2.3 km"
  },
  specifications: {
    "Tissu": "Coton Wax authentique",
    "Couleurs": "Bleu royal, Or, Rouge",
    "Entretien": "Lavage à la main recommandé",
    "Tailles": "S (36), M (38), L (40), XL (42)",
    "Coupe": "Ajustée avec ceinture incluse",
    "Style": "Traditionnel moderne"
  },
  relatedProducts: ["prod_002", "prod_003", "prod_004"]
};

const reviews = [
  { id: 1, user: "Fatou M.", rating: 5, comment: "Magnifique ! La qualité est exceptionnelle et les finitions parfaites. Je la porte pour toutes mes cérémonies.", date: "Il y a 1 semaine", verified: true, size: "M" },
  { id: 2, user: "Grâce K.", rating: 5, comment: "Très belle robe, conforme à la description. L'artisane est très professionnelle.", date: "Il y a 2 semaines", verified: true, size: "L" },
  { id: 3, user: "Marlène T.", rating: 4, comment: "Beau travail artisanal. Le tissu est de qualité. Livraison rapide.", date: "Il y a 3 semaines", verified: false, size: "S" }
];

export const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { startBusinessConversation } = useStartConversation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const product = mockProduct; // En réalité, on fetcherait par ID

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Découvrez ${product.name} sur ConsoGab`,
        url: window.location.href
      });
    }
  };

  const handleFindNearby = () => {
    // Navigation vers une carte montrant tous les commerces qui vendent ce produit
    navigate(`/product/${id}/nearby`);
  };

  const handleAddToCart = () => {
    console.log("Ajouté au panier:", { product, quantity, selectedSize });
    // Logique d'ajout au panier
  };

  const handleContactBusiness = () => {
    navigate(`/business/${product.business.id}`);
  };

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
        {/* Galerie photos */}
        <div className="relative mb-6">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <img 
              src={product.images[currentImageIndex]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.onSale && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                -15% Promo
              </Badge>
            )}
            {product.stock < 5 && (
              <Badge variant="destructive" className="absolute top-4 right-4">
                Stock limité ({product.stock})
              </Badge>
            )}
          </div>
          
          {/* Indicateurs d'images */}
          {product.images.length > 1 && (
            <div className="flex gap-2 justify-center mt-4">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    index === currentImageIndex ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Informations principales */}
        <div className="space-y-6">
          {/* Titre et prix */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="font-bold text-xl leading-tight pr-4">{product.name}</h1>
              <Badge variant="outline" className="shrink-0">
                {product.category}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              {product.onSale ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrice(product.salePrice!)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge className="bg-red-500 text-white">
                    Économisez {formatPrice(product.price - product.salePrice!)}
                  </Badge>
                </div>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{product.rating}</span>
                <span className="text-sm text-muted-foreground">({product.reviews} avis)</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <Badge 
                variant={product.availability === "Disponible" ? "default" : "secondary"}
                className="bg-[hsl(var(--gaboma-green))] text-white"
              >
                {product.availability}
              </Badge>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Commerce */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">{product.business.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.business.name}</h3>
                    <p className="text-sm text-muted-foreground">Par {product.business.owner}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{product.business.rating}</span>
                      </div>
                      <Separator orientation="vertical" className="h-3" />
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm">{product.business.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleContactBusiness}
                >
                  Voir
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sélection taille et quantité */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-4">
              {/* Tailles */}
              <div>
                <h3 className="font-semibold mb-3">Sélectionner la taille</h3>
                <div className="grid grid-cols-4 gap-2">
                  {["S", "M", "L", "XL"].map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      className={cn("h-12", selectedSize === size && "bg-primary text-primary-foreground")}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quantité */}
              <div>
                <h3 className="font-semibold mb-3">Quantité</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions principales */}
          <div className="space-y-3">
            <Button
              className="w-full bg-[hsl(var(--gaboma-green))] text-white hover:bg-[hsl(var(--gaboma-green))]/90 h-12"
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ajouter au panier • {formatPrice((product.salePrice || product.price) * quantity)}
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleFindNearby}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Où trouver ?
              </Button>
              <Button
                variant="outline"
                onClick={() => startBusinessConversation(product.business.id)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contacter
              </Button>
            </div>
          </div>

          {/* Tabs détaillées */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Détails</TabsTrigger>
              <TabsTrigger value="reviews">Avis ({product.reviews})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Description détaillée
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.detailedDescription}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Informations produit</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span>{product.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Poids:</span>
                      <span>{product.weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Matériau:</span>
                      <span>{product.material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Origine:</span>
                      <span>{product.madeIn}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Spécifications techniques</h3>
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground font-medium">{key}:</span>
                        <span className="text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                                Achat vérifié
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              Taille {review.size}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-3 h-3",
                                  i < review.rating 
                                    ? "fill-yellow-400 text-yellow-400" 
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};