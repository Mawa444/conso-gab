import { useState } from "react";
import { Star, Heart, MessageCircle, Flag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductDetailsModal } from "./ProductDetailsModal";

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

interface Service {
  id: string;
  name: string;
  price: number | string;
  duration?: string;
  images: string[];
  category: string;
  description: string;
  availability: string;
  zone: string;
  rating: number;
  reviews: number;
  featured?: boolean;
}

interface ProfessionalCatalogProps {
  commerceId: string;
  commerceName: string;
  type: "product" | "service" | "mixed";
  products?: Product[];
  services?: Service[];
  onProductSelect?: (product: Product) => void;
  onServiceSelect?: (service: Service) => void;
  onMessage?: (commerce: any) => void;
}

// Données d'exemple
const mockProducts: Product[] = [
  {
    id: "prod_1",
    name: "Robe Traditionnelle Gabonaise",
    price: 45000,
    images: ["/api/placeholder/300/300", "/api/placeholder/300/300"],
    category: "Vêtements Femmes",
    description: "Magnifique robe traditionnelle confectionnée avec des tissus authentiques gabonais. Parfaite pour les cérémonies et événements spéciaux.",
    stock: 5,
    availability: "Disponible",
    tags: ["Traditionnel", "Cérémonie", "Femme", "Authentique"],
    rating: 4.8,
    reviews: 23,
    onSale: true,
    salePrice: 38000
  },
  {
    id: "prod_2",
    name: "Chaussures en Cuir Local",
    price: 35000,
    images: ["/api/placeholder/300/300"],
    category: "Chaussures",
    description: "Chaussures artisanales en cuir véritable, confectionnées par nos artisans locaux avec un savoir-faire ancestral.",
    stock: 8,
    availability: "Disponible",
    tags: ["Cuir", "Artisanal", "Confort", "Local"],
    rating: 4.6,
    reviews: 15
  },
  {
    id: "prod_3",
    name: "Sac à Main Ethnique",
    price: "Sur devis",
    images: ["/api/placeholder/300/300", "/api/placeholder/300/300"],
    category: "Accessoires",
    description: "Sac à main unique inspiré des motifs traditionnels gabonais. Chaque pièce est personnalisable selon vos préférences.",
    availability: "Sur commande",
    tags: ["Personnalisable", "Ethnique", "Unique", "Accessoire"],
    rating: 4.9,
    reviews: 8
  }
];

const mockServices: Service[] = [
  {
    id: "serv_1",
    name: "Coupe et Coiffure Moderne",
    price: 8000,
    duration: "1h30",
    images: ["/api/placeholder/300/300"],
    category: "Coiffure",
    description: "Service de coiffure professionnelle avec des techniques modernes adaptées aux cheveux africains.",
    availability: "Lundi à Samedi, 8h-18h",
    zone: "Libreville - Tous quartiers",
    rating: 4.7,
    reviews: 42,
    featured: true
  },
  {
    id: "serv_2",
    name: "Soin Capillaire Naturel",
    price: 12000,
    duration: "2h",
    images: ["/api/placeholder/300/300", "/api/placeholder/300/300"],
    category: "Soin",
    description: "Traitement capillaire avec des produits naturels locaux pour nourrir et réparer vos cheveux en profondeur.",
    availability: "Sur rendez-vous",
    zone: "Libreville - Akanda, Nombakélé",
    rating: 4.9,
    reviews: 28
  }
];

export const ProfessionalCatalog = ({ 
  commerceId, 
  commerceName, 
  type, 
  products = mockProducts, 
  services = mockServices,
  onProductSelect,
  onServiceSelect,
  onMessage 
}: ProfessionalCatalogProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Organiser les produits par catégorie
  const productCategories = products ? [...new Set(products.map(p => p.category))] : [];
  const serviceCategories = services ? [...new Set(services.map(s => s.category))] : [];

  const formatPrice = (price: number | string) => {
    if (typeof price === "string") return price;
    return `${price.toLocaleString()} FCFA`;
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-square bg-muted/30 rounded-t-lg overflow-hidden">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.onSale && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              Promo
            </Badge>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/80 hover:bg-white">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          {product.stock !== undefined && product.stock < 3 && (
            <Badge variant="destructive" className="absolute bottom-2 left-2">
              Stock limité
            </Badge>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h4>
            <Badge variant="outline" className="mt-1 text-xs">
              {product.category}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews} avis)</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {product.onSale ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(product.salePrice!)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            <Badge 
              variant={product.availability === "Disponible" ? "default" : "secondary"}
              className="text-xs"
            >
              {product.availability}
            </Badge>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => {
                setSelectedProduct(product);
                onProductSelect?.(product);
              }}
            >
              Voir détails
            </Button>
            <Button size="sm" variant="outline" className="px-3">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ServiceCard = ({ service }: { service: Service }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted/30 rounded-t-lg overflow-hidden">
          <img 
            src={service.images[0]} 
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {service.featured && (
            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
              Recommandé
            </Badge>
          )}
          <div className="absolute top-2 right-2">
            <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/80 hover:bg-white">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
              {service.name}
            </h4>
            <Badge variant="outline" className="mt-1 text-xs">
              {service.category}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{service.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">({service.reviews} avis)</span>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            {service.duration && (
              <div>Durée: {service.duration}</div>
            )}
            <div>Zone: {service.zone}</div>
            <div>Disponibilité: {service.availability}</div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(service.price)}
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => onServiceSelect?.(service)}
              >
                Réserver
              </Button>
              <Button size="sm" variant="outline" className="px-3">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue={type === "mixed" ? "products" : type === "product" ? "products" : "services"}>
        {type === "mixed" && (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
        )}

        {(type === "product" || type === "mixed") && (
          <TabsContent value="products" className="space-y-6">
            {/* Filtres par catégorie */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("all")}
              >
                Tous
              </Button>
              {productCategories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Grille de produits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                ?.filter(product => activeCategory === "all" || product.category === activeCategory)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </TabsContent>
        )}

        {(type === "service" || type === "mixed") && (
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services?.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Modal de détails produit */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product) => {}}
          onMessage={() => onMessage?.({ id: commerceId, name: commerceName })}
        />
      )}
    </div>
  );
};