import { useState } from "react";
import { Eye, Navigation, Star, Clock, Verified, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  title: string;
  description: string;
  brand?: string;
  price: number;
  currency: string;
  images: string[];
  merchant: {
    id: string;
    name: string;
    verified: boolean;
    rating: number;
    distance: number;
  };
  attributes: {
    color?: string;
    size?: string;
    material?: string;
  };
  availability: "in_stock" | "low_stock" | "pre_order";
  matchScore: number;
}

interface ProductSearchResultsProps {
  products: Product[];
  merchants: Array<{
    id: string;
    name: string;
    verified: boolean;
    rating: number;
    distance: number;
    productCount: number;
    coordinates: { lat: number; lng: number };
  }>;
  onProductClick: (productId: string) => void;
  onMerchantClick: (merchantId: string) => void;
  onNavigate: (coordinates: { lat: number; lng: number }) => void;
  loading?: boolean;
}

export const ProductSearchResults = ({
  products,
  merchants,
  onProductClick,
  onMerchantClick,
  onNavigate,
  loading = false
}: ProductSearchResultsProps) => {
  const [activeTab, setActiveTab] = useState("products");

  if (loading) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAvailabilityBadge = (availability: Product["availability"]) => {
    const variants = {
      in_stock: { variant: "default" as const, text: "En stock", color: "text-green-600" },
      low_stock: { variant: "secondary" as const, text: "Stock limité", color: "text-orange-600" },
      pre_order: { variant: "outline" as const, text: "Précommande", color: "text-blue-600" }
    };
    
    const config = variants[availability];
    return (
      <Badge variant={config.variant} className={`text-xs ${config.color}`}>
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm shadow-lg max-h-[70vh] flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Résultats de recherche</h3>
          <Badge variant="outline" className="text-xs">
            {products.length} produit{products.length > 1 ? 's' : ''} • {merchants.length} commerce{merchants.length > 1 ? 's' : ''}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="products" className="text-xs">
              Produits ({products.length})
            </TabsTrigger>
            <TabsTrigger value="merchants" className="text-xs">
              Commerces ({merchants.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Onglet Produits */}
          <TabsContent value="products" className="h-full m-0">
            <div className="h-full overflow-y-auto p-4 space-y-3">
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun produit trouvé</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {product.title}
                            </h4>
                            <div className="text-right flex-shrink-0">
                              <div className="font-semibold text-sm">
                                {product.price.toLocaleString()} {product.currency}
                              </div>
                              {product.brand && (
                                <div className="text-xs text-muted-foreground">
                                  {product.brand}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Attributs */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {product.attributes.color && (
                              <Badge variant="outline" className="text-xs h-5">
                                {product.attributes.color}
                              </Badge>
                            )}
                            {product.attributes.size && (
                              <Badge variant="outline" className="text-xs h-5">
                                Taille {product.attributes.size}
                              </Badge>
                            )}
                            {getAvailabilityBadge(product.availability)}
                          </div>

                          {/* Commerce */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMerchantClick(product.merchant.id);
                                }}
                                className="hover:text-primary transition-colors"
                              >
                                {product.merchant.name}
                              </button>
                              {product.merchant.verified && (
                                <Verified className="w-3 h-3 text-primary" />
                              )}
                              <span>•</span>
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>{product.merchant.rating}</span>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{(product.merchant.distance / 1000).toFixed(1)}km</span>
                            </div>

                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onProductClick(product.id);
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Voir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Onglet Commerces */}
          <TabsContent value="merchants" className="h-full m-0">
            <div className="h-full overflow-y-auto p-4 space-y-3">
              {merchants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucun commerce trouvé</p>
                </div>
              ) : (
                merchants.map((merchant) => (
                  <Card key={merchant.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">
                              {merchant.name}
                            </h4>
                            {merchant.verified && (
                              <Badge variant="secondary" className="text-xs h-5">
                                <Verified className="w-3 h-3 mr-1" />
                                Vérifié
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>{merchant.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{(merchant.distance / 1000).toFixed(1)}km</span>
                            </div>
                            <div>
                              {merchant.productCount} produit{merchant.productCount > 1 ? 's' : ''} trouvé{merchant.productCount > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate(merchant.coordinates);
                            }}
                            className="h-7 px-2"
                          >
                            <Navigation className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMerchantClick(merchant.id);
                            }}
                            className="h-7 px-3 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Voir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};