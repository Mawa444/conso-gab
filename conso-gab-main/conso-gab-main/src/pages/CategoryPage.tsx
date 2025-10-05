import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Grid3X3, List, Star, MapPin, TrendingUp, Share, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CommerceCard } from "@/components/commerce/CommerceCard";
import { EnhancedCommerceDetailsPopup } from "@/components/commerce/EnhancedCommerceDetailsPopup";
import { GeolocalizedAdCarousel } from "@/components/advertising/GeolocalizedAdCarousel";
import { useRealBusinesses } from "@/hooks/use-real-businesses";
import { getAllBusinessCategories } from "@/data/businessCategories";
import { toast } from "sonner";
import { PageWithSkeleton } from "@/components/layout/PageWithSkeleton";
import { CommerceListSkeleton } from "@/components/ui/skeleton-screens";

// Filtres et options de tri
const sortOptions = [{
  value: "rating",
  label: "Mieux notés",
  icon: Star
}, {
  value: "distance",
  label: "Plus proches",
  icon: MapPin
}, {
  value: "popular",
  label: "Plus populaires",
  icon: TrendingUp
}, {
  value: "name",
  label: "Ordre alphabétique",
  icon: Filter
}];
const CategoryPage = () => {
  const {
    categoryId
  } = useParams<{
    categoryId: string;
  }>();
  const navigate = useNavigate();
  const {
    businesses,
    loading,
    error
  } = useRealBusinesses();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [showCommerceDetails, setShowCommerceDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  useEffect(() => {
    // Get user location from localStorage
    const savedLocation = localStorage.getItem('user_location');
    if (savedLocation) {
      try {
        setUserLocation(JSON.parse(savedLocation));
      } catch {}
    }
  }, []);

  // Récupérer les données de la catégorie
  const categories = getAllBusinessCategories();
  const category = categories.find(cat => cat.id === categoryId);

  // Mapping des catégories de la base de données vers les nouvelles catégories
  const categoryMapping: Record<string, string> = {
    'restaurant': 'restauration_hotellerie',
    'technology': 'technologie_numerique',
    'automotive': 'transport_logistique',
    'education': 'education_formation',
    'entertainment': 'culture_loisirs',
    'healthcare': 'sante_bienetre',
    'retail': 'commerce_distribution',
    'services': 'artisanat_services',
    'finance': 'finance_banque',
    'real_estate': 'btp_immobilier',
    'beauty': 'sante_bienetre',
    'fitness': 'sante_bienetre',
    'agriculture': 'agriculture_peche',
    'manufacturing': 'btp_immobilier',
    'other': 'professions_liberales'
  };
  if (!category) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Catégorie non trouvée</h1>
          <p className="text-muted-foreground mb-4">
            Catégorie demandée : {categoryId}
          </p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>;
  }

  // Filtrer les entreprises par catégorie (avec mapping)
  const categoryBusinesses = businesses.filter(business => {
    // Vérifier si la catégorie de l'entreprise correspond directement
    if (business.category === category.id) {
      return true;
    }
    // Vérifier avec le mapping inverse
    const mappedCategory = categoryMapping[business.category];
    return mappedCategory === category.id;
  });

  // Filtrer et trier les établissements
  const filteredEstablishments = categoryBusinesses.filter(business => {
    if (searchQuery && !business.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "distance":
        // Calculate distance from user location
        if (!userLocation?.latitude || !userLocation?.longitude) return 0;
        const distA = a.latitude && a.longitude
          ? Math.sqrt(Math.pow(a.latitude - userLocation.latitude, 2) + Math.pow(a.longitude - userLocation.longitude, 2))
          : Infinity;
        const distB = b.latitude && b.longitude
          ? Math.sqrt(Math.pow(b.latitude - userLocation.latitude, 2) + Math.pow(b.longitude - userLocation.longitude, 2))
          : Infinity;
        return distA - distB;
      case "popular":
        // Sort by name as fallback (popularity data not available yet)
        return a.name.localeCompare(b.name);
      case "rating":
        // Sort by name as fallback (rating data not available yet)
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
  const handleCommerceSelect = (business: any) => {
    navigate(`/business/${business.id}`);
  };
  const handleFavorite = (business: any) => {
    toast.success(`${business.name} ajouté aux favoris`);
  };
  const handleMessage = (business: any) => {
    toast.info(`Message envoyé à ${business.name}`);
  };
  const handleShare = () => {
    navigator.share?.({
      title: `Catégorie ${category.nom} - Gaboma`,
      text: `Découvrez les ${filteredEstablishments.length} établissements dans ${category.nom}`,
      url: window.location.href
    }) || toast.success("Lien copié dans le presse-papier");
  };
  const handleGetDirections = () => {
    toast.info("Ouverture de Google Maps...");
  };
  if (error) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>;
  }
  return <PageWithSkeleton isLoading={loading} skeleton={<CommerceListSkeleton />}>
    <div className="min-h-screen bg-background">
        {/* Header avec navigation et info catégorie */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-20 border-b border-border">
          <div className="p-4 bg-white rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{category.nom}</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredEstablishments.length} établissement{filteredEstablishments.length > 1 ? 's' : ''} trouvé{filteredEstablishments.length > 1 ? 's' : ''}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4" />
              </Button>
            </div>

            {/* Barre de recherche */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Rechercher dans cette catégorie..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 rounded-3xl" />
            </div>

            {/* Filtres et options d'affichage */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 my-0">
              {/* Mode d'affichage */}
              <div className="flex items-center gap-2">
                <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")} className="bg-inherit">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Tri */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">Tous ({filteredEstablishments.length})</TabsTrigger>
              <TabsTrigger value="verified">Vérifiés ({filteredEstablishments.filter(b => b.is_verified).length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {/* Publicité */}
              <GeolocalizedAdCarousel />

              {/* Liste des établissements */}
              {filteredEstablishments.length === 0 ? <Card>
                  <CardContent className="p-12 text-center bg-white rounded-3xl">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Aucun établissement trouvé</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? "Aucun établissement ne correspond à votre recherche." : "Aucun établissement dans cette catégorie pour le moment."}
                    </p>
                  </CardContent>
                </Card> : <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                  {filteredEstablishments.map(business => <Card key={business.id} className="group hover:shadow-lg transition-all cursor-pointer" onClick={() => handleCommerceSelect(business)}>
                      <CardContent className="p-4 bg-white">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{business.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {business.address || 'Adresse non spécifiée'}
                              </p>
                              {business.description && <p className="text-sm text-muted-foreground line-clamp-2">
                                  {business.description}
                                </p>}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {business.is_verified && <Badge variant="default" className="text-xs">
                                  Vérifié
                                </Badge>}
                              {business.city && <Badge variant="outline" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {business.city}
                                </Badge>}
                            </div>

                            <div className="flex items-center gap-2">
                              {business.phone && <Button variant="outline" size="sm">
                                  Contacter
                                </Button>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>}
            </TabsContent>

            <TabsContent value="verified" className="space-y-6">
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {filteredEstablishments.filter(b => b.is_verified).map(business => <Card key={business.id} className="group hover:shadow-lg transition-all cursor-pointer" onClick={() => handleCommerceSelect(business)}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{business.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {business.address || 'Adresse non spécifiée'}
                            </p>
                            {business.description && <p className="text-sm text-muted-foreground line-clamp-2">
                                {business.description}
                              </p>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="default" className="text-xs">
                              Vérifié
                            </Badge>
                            {business.city && <Badge variant="outline" className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                {business.city}
                              </Badge>}
                          </div>

                          <div className="flex items-center gap-2">
                            {business.phone && <Button variant="outline" size="sm">
                                Contacter
                              </Button>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
    </div>

    {/* Popup de détails du commerce */}
    {showCommerceDetails && selectedCommerce && <EnhancedCommerceDetailsPopup commerce={selectedCommerce} open={showCommerceDetails} onClose={() => {
      setShowCommerceDetails(false);
      setSelectedCommerce(null);
    }} />}
  </PageWithSkeleton>;
};

export default CategoryPage;