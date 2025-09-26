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
import { useRealBusinesses } from "@/hooks/use-real-businesses";
import { businessCategories } from "@/data/businessCategories";
import { useNavigate } from "react-router-dom";
import { CommerceListSkeleton } from "@/components/ui/skeleton-screens";

export const CommerceListTab = () => {
  const navigate = useNavigate();
  const { businesses, loading, error } = useRealBusinesses();
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

  // Catégories et districts des vraies données
  const categories = businessCategories.map(cat => ({ id: cat.id, name: cat.nom, icon: cat.icon }));
  const districts = [...new Set(businesses.map(b => b.city).filter(Boolean))] as string[];

  // Filtrage et tri ultra-avancé
  const filteredAndSortedCommerces = useMemo(() => {
    let filtered = businesses.filter(business => {
      // Recherche textuelle avancée
      const searchMatch = searchQuery === "" || 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.city?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtres géographiques
      const categoryMatch = selectedCategory === "all" || business.category === selectedCategory;
      const districtMatch = selectedDistrict === "all" || business.city === selectedDistrict;
      
      // Filtres qualité - adapté aux vraies données
      const verifiedMatch = !verifiedOnly || business.is_verified;

      return searchMatch && categoryMatch && districtMatch && verifiedMatch;
    });

    // Système de tri intelligent adapté aux vraies données
    switch (sortBy) {
      case "relevance":
        filtered.sort((a, b) => {
          let scoreA = 0, scoreB = 0;
          
          if (a.is_verified) scoreA += 3;
          if (b.is_verified) scoreB += 3;
          
          // Plus récent = plus pertinent
          scoreA += new Date(a.created_at).getTime() / 1000000000;
          scoreB += new Date(b.created_at).getTime() / 1000000000;
          
          return scoreB - scoreA;
        });
        break;
      
      case "alphabetical":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      
      default:
        // Tri par défaut : vérifiés d'abord, puis par ordre alphabétique
        filtered.sort((a, b) => {
          if (a.is_verified && !b.is_verified) return -1;
          if (!a.is_verified && b.is_verified) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return filtered;
  }, [businesses, searchQuery, selectedCategory, selectedDistrict, sortBy, verifiedOnly]);

  // Statistiques par quartier
  const districtStats = useMemo(() => {
    const stats = districts.map(district => {
      const districtBusinesses = filteredAndSortedCommerces.filter(b => b.city === district);
      return {
        name: district,
        count: districtBusinesses.length,
        verifiedCount: districtBusinesses.filter(b => b.is_verified).length
      };
    }).sort((a, b) => b.count - a.count);
    
    return stats;
  }, [filteredAndSortedCommerces, districts]);

  const togglePriceFilter = (price: string) => {
    setPriceFilter(prev => 
      prev.includes(price) 
        ? prev.filter(p => p !== price)
        : [...prev, price]
    );
  };

  // MAINTENANT le return conditionnel APRÈS tous les hooks
  if (loading) {
    return <CommerceListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Aucune entreprise</h3>
        <p className="text-muted-foreground">Aucune entreprise n'est encore enregistrée.</p>
      </div>
    );
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
                          <div className="text-xs text-green-600">{stat.verifiedCount} vérifié{stat.verifiedCount > 1 ? 's' : ''}</div>
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
                      {filteredAndSortedCommerces.filter(b => b.is_verified).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Vérifiés</div>
                  </div>
                  <div className="p-3 bg-blue-500/5 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {filteredAndSortedCommerces.filter(b => b.is_active).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Actifs</div>
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