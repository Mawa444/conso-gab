import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Package, 
  Tag, 
  Truck, 
  CheckCircle, 
  XCircle,
  Plus,
  Minus,
  Eye,
  MessageCircle,
  Info,
  MapPin,
  Clock,
  User,
  Phone,
  Mail
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category?: string;
  subcategory?: string;
  condition: 'new' | 'used' | 'refurbished';
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity?: number;
  specifications?: { [key: string]: string };
  variants?: { name: string; options: string[] }[];
  tags?: string[];
  rating?: number;
  reviews_count?: number;
  delivery_info?: {
    available: boolean;
    cost?: number;
    zones?: string[];
    estimated_time?: string;
  };
}

interface EnhancedCatalogDisplayProps {
  products: Product[];
  catalogName: string;
  businessInfo: {
    name: string;
    contact_phone?: string;
    contact_whatsapp?: string;
    contact_email?: string;
    location?: string;
  };
}

export const EnhancedCatalogDisplay = ({ products, catalogName, businessInfo }: EnhancedCatalogDisplayProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const addToCart = (productId: string, qty: number) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + qty
    }));
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'new':
        return <Badge className="bg-[hsl(var(--gaboma-green))] text-white">Neuf</Badge>;
      case 'used':
        return <Badge className="bg-[hsl(var(--gaboma-yellow))] text-black">Occasion</Badge>;
      case 'refurbished':
        return <Badge className="bg-[hsl(var(--gaboma-blue))] text-white">Reconditionné</Badge>;
      default:
        return null;
    }
  };

  const getAvailabilityBadge = (availability: string, stock?: number) => {
    switch (availability) {
      case 'in_stock':
        return <Badge className="bg-[hsl(var(--gaboma-green))] text-white flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          En stock {stock && `(${stock})`}
        </Badge>;
      case 'low_stock':
        return <Badge className="bg-[hsl(var(--gaboma-yellow))] text-black flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Stock limité {stock && `(${stock})`}
        </Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rupture
        </Badge>;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleProductInquiry = () => {
    // inquiry logic...
    setInquiryMessage("");
    setCustomerInfo({ name: "", phone: "", email: "" });
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary/20">
            <div className="relative aspect-square overflow-hidden">
              {product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              
              <div className="absolute top-2 left-2 space-y-1">
                {getConditionBadge(product.condition)}
                {product.discount && product.discount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    -{product.discount}%
                  </Badge>
                )}
              </div>
              
              <div className="absolute top-2 right-2">
                {getAvailabilityBadge(product.availability, product.stock_quantity)}
              </div>
              
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                >
                  <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                )}
              </div>
              
              {product.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
              
              {product.price && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-[hsl(var(--gaboma-green))]">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {product.rating && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < Math.floor(product.rating!) ? 'fill-[hsl(var(--gaboma-yellow))] text-[hsl(var(--gaboma-yellow))]' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews_count || 0})
                  </span>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1 bg-[hsl(var(--gaboma-blue))] hover:bg-[hsl(var(--gaboma-blue))]/90 text-white"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Info className="w-3 h-3 mr-1" />
                  Détails
                </Button>
                {product.availability !== 'out_of_stock' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => addToCart(product.id, 1)}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Panier
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-[90vh]">
              <div className="relative">
                {selectedProduct.images.length > 0 ? (
                  <div className="relative h-full">
                    <img
                      src={selectedProduct.images[activeImageIndex]}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedProduct.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
                        {selectedProduct.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex flex-col h-full overflow-hidden">
                <DialogHeader className="p-6 border-b flex-shrink-0">
                  <DialogTitle className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        {getConditionBadge(selectedProduct.condition)}
                        {getAvailabilityBadge(selectedProduct.availability, selectedProduct.stock_quantity)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(selectedProduct.id)}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                  <Tabs defaultValue="details" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-3 mx-6 mt-4 flex-shrink-0">
                      <TabsTrigger value="details">Détails</TabsTrigger>
                      <TabsTrigger value="specs">Caractéristiques</TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="flex-1 overflow-hidden mx-6 mt-4">
                      <ScrollArea className="h-full pr-4">
                        <div className="space-y-4">
                          {selectedProduct.price && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-[hsl(var(--gaboma-green))]">
                                  {formatPrice(selectedProduct.price)}
                                </span>
                                {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                                  <span className="text-lg text-muted-foreground line-through">
                                    {formatPrice(selectedProduct.originalPrice)}
                                  </span>
                                )}
                                {selectedProduct.discount && (
                                  <Badge className="bg-red-500 text-white">
                                    -{selectedProduct.discount}% économie
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {selectedProduct.description && (
                            <div>
                              <h4 className="font-medium mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedProduct.description}
                              </p>
                            </div>
                          )}

                          {selectedProduct.variants && selectedProduct.variants.map((variant) => (
                            <div key={variant.name} className="space-y-2">
                              <label className="text-sm font-medium">{variant.name}</label>
                              <div className="flex flex-wrap gap-2">
                                {variant.options.map((option) => (
                                  <Button
                                    key={option}
                                    variant={selectedVariants[variant.name] === option ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedVariants(prev => ({
                                      ...prev,
                                      [variant.name]: option
                                    }))}
                                  >
                                    {option}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}

                          {selectedProduct.availability !== 'out_of_stock' && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Quantité</label>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setQuantity(quantity + 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {selectedProduct.delivery_info?.available && (
                            <div className="space-y-2">
                              <h4 className="font-medium flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                Livraison disponible
                              </h4>
                              <div className="text-sm space-y-1">
                                {selectedProduct.delivery_info.cost && (
                                  <p>Coût: {formatPrice(selectedProduct.delivery_info.cost)}</p>
                                )}
                                {selectedProduct.delivery_info.estimated_time && (
                                  <p>Délai estimé: {selectedProduct.delivery_info.estimated_time}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedProduct.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="specs" className="flex-1 overflow-hidden mx-6 mt-4">
                      <ScrollArea className="h-full pr-4">
                        {selectedProduct.specifications ? (
                          <div className="space-y-4">
                            {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-2 border-b">
                                <span className="font-medium">{key}</span>
                                <span className="text-muted-foreground">{value}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucune caractéristique technique disponible
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="contact" className="flex-1 overflow-hidden mx-6 mt-4">
                      <ScrollArea className="h-full pr-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Demande de renseignements</h4>
                            <p className="text-sm text-muted-foreground">
                              Contactez {businessInfo.name} pour plus d'informations sur ce produit.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Votre nom</label>
                              <Input
                                placeholder="Nom complet"
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Téléphone</label>
                              <Input
                                placeholder="+241 01 23 45 67"
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email (optionnel)</label>
                            <Input
                              placeholder="email@exemple.com"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Votre message</label>
                            <Textarea
                              placeholder="Détails sur votre demande..."
                              value={inquiryMessage}
                              onChange={(e) => setInquiryMessage(e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex-shrink-0 p-6 border-t space-y-3">
                  {selectedProduct.availability !== 'out_of_stock' && (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-[hsl(var(--gaboma-green))] hover:bg-[hsl(var(--gaboma-green))]/90 text-white"
                        onClick={() => addToCart(selectedProduct.id, quantity)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ajouter au panier
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleProductInquiry}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Demander des infos
                      </Button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2">
                    {businessInfo.contact_whatsapp && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://wa.me/${businessInfo.contact_whatsapp}`, '_blank')}
                        className="text-[hsl(var(--gaboma-green))] border-[hsl(var(--gaboma-green))]"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    {businessInfo.contact_phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${businessInfo.contact_phone}`, '_blank')}
                        className="text-[hsl(var(--gaboma-blue))] border-[hsl(var(--gaboma-blue))]"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Appeler
                      </Button>
                    )}
                    {businessInfo.contact_email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`mailto:${businessInfo.contact_email}`, '_blank')}
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
