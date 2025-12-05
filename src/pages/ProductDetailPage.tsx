import { useState } from "react";
import { ArrowLeft, Star, Heart, MessageCircle, Share, MapPin, Plus, Minus, ShoppingCart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStartConversation } from "@/hooks/use-start-conversation";
import { useProduct } from "@/hooks/use-product";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { startBusinessConversation } = useStartConversation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold mb-2">Produit introuvable</h1>
        <Button onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  // Adapter les données pour l'affichage
  const productData = product as any;
  const rawImages = productData.images;
  const images: string[] = Array.isArray(rawImages) ? rawImages : typeof rawImages === 'string' ? [rawImages] : ["/placeholder.svg"];
  const business = productData.business;
  const reviews: any[] = [];
  const averageRating = 0;

  const stock = productData.stock_quantity || 0;
  const isAvailable = stock > 0;
  const availabilityLabel = isAvailable ? "Disponible" : "Rupture de stock";
  const isOnSale = productData.is_on_sale || false;
  const salePrice = productData.sale_price;
  const tags = productData.tags || [];

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: productData.name,
        text: `Découvrez ${productData.name} sur ConsoGab`,
        url: window.location.href
      });
    }
  };

  const handleAddToCart = () => {
    toast.success("Produit ajouté au panier");
  };

  const handleFindNearby = () => {
    toast.info("Fonctionnalité à venir");
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
              src={images[currentImageIndex]} 
              alt={productData.name}
              className="w-full h-full object-cover"
            />
            {isOnSale && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                Promo
              </Badge>
            )}
            {stock < 5 && stock > 0 && (
              <Badge variant="destructive" className="absolute top-4 right-4">
                Stock limité ({stock})
              </Badge>
            )}
          </div>
          
          {/* Indicateurs d'images */}
          {images.length > 1 && (
            <div className="flex gap-2 justify-center mt-4">
              {images.map((_, index) => (
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
              <h1 className="font-bold text-xl leading-tight pr-4">{productData.name}</h1>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              {isOnSale && salePrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrice(salePrice)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(productData.price)}
                  </span>
                  <Badge className="bg-red-500 text-white">
                    Économisez {formatPrice(productData.price - salePrice)}
                  </Badge>
                </div>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(productData.price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({reviews.length} avis)</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <Badge 
                variant={isAvailable ? "default" : "secondary"}
                className={cn(isAvailable ? "bg-[hsl(var(--gaboma-green))] text-white" : "")}
              >
                {availabilityLabel}
              </Badge>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {productData.description}
            </p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Commerce */}
          {business && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">{business.business_name?.[0] || 'C'}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{business.business_name}</h3>
                      <p className="text-sm text-muted-foreground">{business.address || "Adresse non renseignée"}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startBusinessConversation(business.id)}
                  >
                    Voir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sélection taille et quantité */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-4">
              {/* Tailles - Placeholder car pas dans la DB pour l'instant */}
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
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock}
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
              disabled={!selectedSize || !isAvailable}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ajouter au panier • {formatPrice((salePrice || productData.price) * quantity)}
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
                onClick={() => business && startBusinessConversation(business.id)}
                disabled={!business}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contacter
              </Button>
            </div>
          </div>

          {/* Tabs détaillées */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Avis ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Description détaillée
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {productData.description || "Aucune description disponible."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 mt-6">
              <p className="text-center text-muted-foreground py-8">Aucun avis pour le moment.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
