import { useState } from "react";
import { Heart, Star, MapPin, Bell, Calendar, Filter, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const favoriteCommerces = [{
  id: "fav_001",
  name: "Restaurant Chez Tonton",
  type: "Restaurant",
  rating: 4.9,
  lastVisit: "Il y a 2 jours",
  subscribed: true,
  category: "restaurant"
}, {
  id: "fav_002",
  name: "Salon Afrique Beauté",
  type: "Salon de beauté",
  rating: 4.7,
  lastVisit: "La semaine dernière",
  subscribed: false,
  category: "beaute"
}, {
  id: "fav_003",
  name: "Pharmacie du Centre",
  type: "Pharmacie",
  rating: 4.8,
  lastVisit: "Il y a 5 jours",
  subscribed: true,
  category: "sante"
}];
const favoriteProducts = [{
  id: "prod_001",
  name: "Poulet braisé traditionnel",
  business: "Restaurant Chez Tonton",
  price: "3500 FCFA",
  image: "/placeholder-product.jpg",
  rating: 4.9
}, {
  id: "prod_002",
  name: "Coiffure afro moderne",
  business: "Salon Afrique Beauté",
  price: "15000 FCFA",
  image: "/placeholder-service.jpg",
  rating: 4.7
}];
const subscriptions = [{
  id: "sub_001",
  name: "Restaurant Chez Tonton",
  type: "Restaurant",
  subscribed_at: "Il y a 1 mois",
  notifications: true,
  offers_count: 3
}, {
  id: "sub_002",
  name: "Pharmacie du Centre",
  type: "Pharmacie",
  subscribed_at: "Il y a 2 semaines",
  notifications: false,
  offers_count: 1
}];
interface FavoritesSectionProps {
  userType?: "consumer" | "business";
}
export const FavoritesSection = ({
  userType = "consumer"
}: FavoritesSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const handleSubscribe = (businessId: string) => {
    console.log("S'abonner à:", businessId);
    // TODO: Implémenter l'abonnement
  };
  const handleUnsubscribe = (businessId: string) => {
    console.log("Se désabonner de:", businessId);
    // TODO: Implémenter le désabonnement
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Favoris & Abonnements</h2>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher dans vos favoris..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-white rounded-3xl" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="restaurant">Restaurants</SelectItem>
            <SelectItem value="beaute">Beauté & Bien-être</SelectItem>
            <SelectItem value="sante">Santé</SelectItem>
            <SelectItem value="mode">Mode</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="businesses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white rounded-3xl">
          <TabsTrigger value="businesses" className="rounded-3xl">Entreprises</TabsTrigger>
          <TabsTrigger value="products" className="rounded-3xl">Produits/Services</TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-3xl">Abonnements</TabsTrigger>
        </TabsList>

        {/* Entreprises favorites */}
        <TabsContent value="businesses" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {favoriteCommerces.length} entreprise{favoriteCommerces.length > 1 ? 's' : ''} favorite{favoriteCommerces.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
            {favoriteCommerces.map(business => <Card key={business.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 bg-white rounded-3xl">
                  <div className="flex items-start gap-3 bg-white">
                    <div className="w-12 h-12 from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 bg-[3a75c4] bg-[#3a75c4]/[0.96]">
                      <MapPin className="w-6 h-6 text-primary bg-inherit" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{business.name}</h3>
                          <p className="text-xs text-muted-foreground">{business.type}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{business.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-white">•</span>
                        <span className="text-xs text-muted-foreground">{business.lastVisit}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant={business.subscribed ? "default" : "outline"} onClick={() => business.subscribed ? handleUnsubscribe(business.id) : handleSubscribe(business.id)} className="text-xs h-7">
                          <Bell className="w-3 h-3 mr-1" />
                          {business.subscribed ? "Abonné" : "S'abonner"}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-7">
                          Visiter
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </TabsContent>

        {/* Produits/Services favoris */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {favoriteProducts.length} produit{favoriteProducts.length > 1 ? 's' : ''}/service{favoriteProducts.length > 1 ? 's' : ''} favori{favoriteProducts.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
            {favoriteProducts.map(product => <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-white">
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Image</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.business}</p>
                          <p className="text-sm font-bold text-primary mt-1">{product.price}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </TabsContent>

        {/* Abonnements */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {subscriptions.length} abonnement{subscriptions.length > 1 ? 's' : ''} actif{subscriptions.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="space-y-4">
            {subscriptions.map(subscription => <Card key={subscription.id}>
                <CardContent className="p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                        <Bell className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{subscription.name}</h3>
                        <p className="text-sm text-muted-foreground">{subscription.type}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Abonné {subscription.subscribed_at}
                          </span>
                          {subscription.offers_count > 0 && <Badge variant="secondary" className="text-xs">
                              {subscription.offers_count} offre{subscription.offers_count > 1 ? 's' : ''} active{subscription.offers_count > 1 ? 's' : ''}
                            </Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={subscription.notifications ? "default" : "outline"} className="text-xs">
                        <Bell className="w-3 h-3 mr-1" />
                        {subscription.notifications ? "Notifications ON" : "Notifications OFF"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleUnsubscribe(subscription.id)} className="text-xs text-red-600 hover:text-red-700">
                        Se désabonner
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};