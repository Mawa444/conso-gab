import { useState, useMemo, useEffect } from "react";
import { Search, Filter, MapPin, Star, Clock, Verified, TrendingUp, Users, Building, Calendar, Euro } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CommerceCard } from "@/components/commerce/CommerceCard";
import { allCommerces, categories, districts } from "@/data/mockCommerces";
import { useNavigate } from "react-router-dom";
import { CommerceListSkeleton } from "@/components/ui/skeleton-screens";

export const CommerceListTab = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [distanceRange, setDistanceRange] = useState([10]);
  const [ratingRange, setRatingRange] = useState([0]);
  const [priceFilter, setPriceFilter] = useState<string[]>(["€", "€€", "€€€"]);
  const [openOnly, setOpenOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // TOUS les hooks DOIVENT être déclarés avant tout return conditionnel
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDataLoaded(true);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Filtrage et tri ultra-avancé
  const filteredAndSortedCommerces = useMemo(() => {
    let filtered = allCommerces.filter(commerce => {
      // Recherche textuelle avancée
      const searchMatch = searchQuery === "" || 
        commerce.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commerce.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commerce.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commerce.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        commerce.specialties?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filtres géographiques
      const categoryMatch = selectedCategory === "all" || commerce.category === selectedCategory;
      const districtMatch = selectedDistrict === "all" || commerce.district === selectedDistrict;
      const distanceMatch = parseFloat(commerce.distance) <= distanceRange[0];

      // Filtres qualité
      const ratingMatch = commerce.rating >= ratingRange[0];
      const priceMatch = priceFilter.includes(commerce.priceRange);
      const openMatch = !openOnly || commerce.openNow;
      const verifiedMatch = !verifiedOnly || commerce.verified;

      return searchMatch && categoryMatch && districtMatch && distanceMatch && 
             ratingMatch && priceMatch && openMatch && verifiedMatch;
    });

    // Système de tri intelligent
    switch (sortBy) {
      case "relevance":
        filtered.sort((a, b) => {
          let scoreA = 0, scoreB = 0;
          
          // Score de pertinence basé sur plusieurs critères
          scoreA += a.rating * 2;
          scoreB += b.rating * 2;
          
          if (a.verified) scoreA += 3;
          if (b.verified) scoreB += 3;
          
          if (a.openNow) scoreA += 2;
          if (b.openNow) scoreB += 2;
          
          scoreA += Math.max(0, 5 - parseFloat(a.distance));
          scoreB += Math.max(0, 5 - parseFloat(b.distance));
          
          return scoreB - scoreA;
        });
        break;
      
      case "distance":
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      
      case "reviews":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      
      case "alphabetical":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      
      case "newest":
        filtered.sort((a, b) => (b.established || 0) - (a.established || 0));
        break;
      
      case "price_low":
        filtered.sort((a, b) => {
          const priceOrder = { "€": 1, "€€": 2, "€€€": 3 };
          return (priceOrder[a.priceRange as keyof typeof priceOrder] || 2) - 
                 (priceOrder[b.priceRange as keyof typeof priceOrder] || 2);
        });
        break;
      
      case "price_high":
        filtered.sort((a, b) => {
          const priceOrder = { "€": 1, "€€": 2, "€€€": 3 };
          return (priceOrder[b.priceRange as keyof typeof priceOrder] || 2) - 
                 (priceOrder[a.priceRange as keyof typeof priceOrder] || 2);
        });
        break;
      
      case "employees":
        filtered.sort((a, b) => b.employees.length - a.employees.length);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedDistrict, sortBy, distanceRange, ratingRange, priceFilter, openOnly, verifiedOnly]);

  // Statistiques par quartier
  const districtStats = useMemo(() => {
    const stats = districts.map(district => {
      const districtCommerces = filteredAndSortedCommerces.filter(c => c.district === district);
      return {
        name: district,
        count: districtCommerces.length,
        avgRating: districtCommerces.length > 0 
          ? (districtCommerces.reduce((sum, c) => sum + c.rating, 0) / districtCommerces.length).toFixed(1)
          : "0",
        openCount: districtCommerces.filter(c => c.openNow).length,
        verifiedCount: districtCommerces.filter(c => c.verified).length
      };
    }).sort((a, b) => b.count - a.count);
    
    return stats;
  }, [filteredAndSortedCommerces]);

  const togglePriceFilter = (price: string) => {
    setPriceFilter(prev => 
      prev.includes(price) 
        ? prev.filter(p => p !== price)
        : [...prev, price]
    );
  };

  // MAINTENANT le return conditionnel APRÈS tous les hooks
  if (isLoading || !dataLoaded) {
    return <CommerceListSkeleton />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Barre de recherche et contrôles */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 p-4 space-y-4">
        {/* Recherche principale */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, type, spécialité, quartier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="px-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Filtres rapides */}
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Quartier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous quartiers</SelectItem>
              {districts.map(district => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">🎯 Pertinence</SelectItem>
              <SelectItem value="distance">📍 Distance</SelectItem>
              <SelectItem value="rating">⭐ Note</SelectItem>
              <SelectItem value="reviews">💬 Avis</SelectItem>
              <SelectItem value="alphabetical">🔤 Alphabétique</SelectItem>
              <SelectItem value="newest">🆕 Plus récent</SelectItem>
              <SelectItem value="price_low">💰 Prix croissant</SelectItem>
              <SelectItem value="price_high">💸 Prix décroissant</SelectItem>
              <SelectItem value="employees">👥 Taille équipe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Distance */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Distance max: {distanceRange[0]}km
                  </Label>
                  <Slider
                    value={distanceRange}
                    onValueChange={setDistanceRange}
                    max={20}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Note minimum */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Note minimum: {ratingRange[0]}/5
                  </Label>
                  <Slider
                    value={ratingRange}
                    onValueChange={setRatingRange}
                    max={5}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Prix */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Euro className="w-4 h-4" />
                    Gamme de prix
                  </Label>
                  <div className="flex gap-2">
                    {["€", "€€", "€€€"].map(price => (
                      <Button
                        key={price}
                        variant={priceFilter.includes(price) ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePriceFilter(price)}
                        className="flex-1"
                      >
                        {price}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Switches */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="open-only"
                    checked={openOnly}
                    onCheckedChange={setOpenOnly}
                  />
                  <Label htmlFor="open-only" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Ouvert maintenant
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="verified-only"
                    checked={verifiedOnly}
                    onCheckedChange={setVerifiedOnly}
                  />
                  <Label htmlFor="verified-only" className="flex items-center gap-2">
                    <Verified className="w-4 h-4" />
                    Vérifiés uniquement
                  </Label>
                </div>
              </div>

              {/* Reset filters */}
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedDistrict("all");
                  setSortBy("relevance");
                  setDistanceRange([10]);
                  setRatingRange([0]);
                  setPriceFilter(["€", "€€", "€€€"]);
                  setOpenOnly(false);
                  setVerifiedOnly(false);
                }}
                className="w-full"
              >
                Réinitialiser tous les filtres
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
          {/* Panneau latéral - Statistiques par quartier */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Répartition par quartier
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {districtStats.slice(0, 10).map((stat) => (
                    <div
                      key={stat.name}
                      className={`p-2 rounded-lg cursor-pointer transition-colors border ${
                        selectedDistrict === stat.name 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'hover:bg-muted/50 border-transparent'
                      }`}
                      onClick={() => setSelectedDistrict(selectedDistrict === stat.name ? "all" : stat.name)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{stat.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {stat.count} commerce{stat.count > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium">⭐ {stat.avgRating}</div>
                          <div className="text-xs text-green-600">{stat.openCount} ouvert{stat.openCount > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Statistiques globales */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Statistiques
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <div className="text-lg font-bold text-primary">{filteredAndSortedCommerces.length}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="p-3 bg-green-500/5 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {filteredAndSortedCommerces.filter(c => c.openNow).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Ouverts</div>
                  </div>
                  <div className="p-3 bg-blue-500/5 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {filteredAndSortedCommerces.filter(c => c.verified).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Vérifiés</div>
                  </div>
                  <div className="p-3 bg-orange-500/5 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {filteredAndSortedCommerces.length > 0 
                        ? (filteredAndSortedCommerces.reduce((acc, c) => acc + c.rating, 0) / filteredAndSortedCommerces.length).toFixed(1)
                        : '0'
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Note moy.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des commerces */}
          <div className="lg:col-span-3">
            {/* Header des résultats */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {filteredAndSortedCommerces.length} commerce{filteredAndSortedCommerces.length > 1 ? 's' : ''} trouvé{filteredAndSortedCommerces.length > 1 ? 's' : ''}
                </h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </Badge>
                  )}
                  {selectedDistrict !== "all" && (
                    <Badge variant="secondary">{selectedDistrict}</Badge>
                  )}
                  {openOnly && <Badge variant="secondary">Ouvert maintenant</Badge>}
                  {verifiedOnly && <Badge variant="secondary">Vérifiés</Badge>}
                </div>
              </div>
            </div>

            {/* Liste */}
            <div className="grid gap-4">
              {filteredAndSortedCommerces.map((commerce) => (
                <CommerceCard
                  key={commerce.id}
                  commerce={commerce}
                  onSelect={() => navigate(`/business/${commerce.id}`)}
                  onMessage={() => console.log("Message to", commerce.name)}
                  variant="default"
                />
              ))}
              
              {filteredAndSortedCommerces.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Aucun commerce trouvé</p>
                  <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};