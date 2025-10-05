import { useState } from "react";
import { X, Star, Heart, Share2, ShoppingCart, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Product {
  id: string;
  name: string;
  price: number | string;
  images: string[];
  category: string;
  description: string;
  stock?: number;
  availability: string;
  tags: string[];
  rating: number;
  reviews: number;
  onSale?: boolean;
  salePrice?: number;
}

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface ProductDetailsModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onMessage?: () => void;
}

const mockReviews: Review[] = [
  {
    id: "1",
    userName: "Marie N.",
    rating: 5,
    comment: "Produit de très bonne qualité, exactement comme sur les photos. Livraison rapide et service client excellent !",
    date: "2024-01-15",
    verified: true
  },
  {
    id: "2", 
    userName: "Jean-Paul M.",
    rating: 4,
    comment: "Très satisfait de mon achat. Le produit correspond bien à la description. Je recommande !",
    date: "2024-01-10",
    verified: true
  },
  {
    id: "3",
    userName: "Sylvie A.",
    rating: 5,
    comment: "Magnifique ! Très belle qualité et finitions parfaites. L'artisan est vraiment talentueux.",
    date: "2024-01-08",
    verified: false
  }
];

export const ProductDetailsModal = ({ 
  product, 
  open, 
  onClose, 
  onAddToCart, 
  onMessage 
}: ProductDetailsModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  if (!open) return null;

  const formatPrice = (price: number | string) => {
    if (typeof price === "string") return price;
    return `${price.toLocaleString()} FCFA`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-[1200] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <h2 className="font-semibold text-lg truncate px-4">{product.name}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Galerie d'images */}
        <div className="relative">
          <div className="aspect-square bg-muted/30 rounded-xl overflow-hidden relative">
            <img 
              src={product.images[currentImageIndex]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {product.images.length > 1 && (
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
              </>
            )}

            {/* Indicateurs d'images */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {product.images.map((_, index) => (
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
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.onSale && (
                <Badge className="bg-red-500 text-white">
                  Promotion
                </Badge>
              )}
              <Badge variant="outline" className="bg-white/90">
                {product.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations principales */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">({product.reviews} avis)</span>
              <Badge 
                variant={product.availability === "Disponible" ? "default" : "secondary"}
              >
                {product.availability}
              </Badge>
            </div>
          </div>

          {/* Prix */}
          <div className="flex items-center gap-3">
            {product.onSale ? (
              <>
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(product.salePrice!)}
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="destructive">
                  -{Math.round((1 - (product.salePrice as number) / (product.price as number)) * 100)}%
                </Badge>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock */}
          {product.stock !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Stock disponible:</span>
              <span className={`font-medium ${product.stock < 3 ? 'text-red-600' : 'text-green-600'}`}>
                {product.stock} unité{product.stock > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Description</h3>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>

        <Separator />

        {/* Avis clients */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Avis clients ({mockReviews.length})</h3>
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <Card key={review.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.userAvatar} />
                      <AvatarFallback>
                        {review.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.userName}</span>
                        {review.verified && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Achat vérifié
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
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Actions flottantes */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onMessage}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button
            className="flex-1"
            onClick={() => onAddToCart?.(product)}
            disabled={product.availability !== "Disponible"}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {typeof product.price === "string" ? "Demander un devis" : "Ajouter au panier"}
          </Button>
        </div>
      </div>
    </div>
  );
};