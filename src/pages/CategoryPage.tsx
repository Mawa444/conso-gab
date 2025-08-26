import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Grid3X3, List, Star, MapPin, TrendingUp, Award, Share, Navigation, Users, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CommerceCard } from "@/components/commerce/CommerceCard";
import { EnhancedCommerceDetailsPopup } from "@/components/commerce/EnhancedCommerceDetailsPopup";
import { GeolocalizedAdCarousel } from "@/components/advertising/GeolocalizedAdCarousel";
import { toast } from "sonner";

// Catégories avec toutes les données nécessaires
const categoriesData = {
  commerce: {
    id: "commerce",
    title: "Commerce & Distribution",
    icon: "🛍️",
    color: "from-blue-500 to-indigo-600",
    subcategories: [
      "Supermarchés & hypermarchés",
      "Boutiques de quartier", 
      "E-commerce & ventes en ligne",
      "Vêtements & mode",
      "Chaussures & accessoires",
      "Cosmétiques & beauté",
      "Téléphones & électronique",
      "Alimentation générale",
      "Boissons & alcools",
      "Pharmacies & parapharmacie",
      "Librairies & papeteries"
    ],
    establishments: [
      {
        id: "commerce_001",
        name: "Supermarché Score Libreville",
        type: "Grande distribution",
        owner: "Groupe Score Gabon",
        address: "Centre Commercial Mbolo, Libreville",
        rating: 4.4,
        verified: true,
        employees: ["Direction", "Caissiers", "Rayons", "Sécurité"],
        distance: "1.8km",
        isFavorite: false,
        reviewCount: 156,
        badges: ["Grande Distribution", "Populaire"],
        featured: true,
        subcategory: "Supermarchés & hypermarchés"
      },
      {
        id: "commerce_002",
        name: "Boutique Mode Gaboma",
        type: "Vêtements & Accessoires",
        owner: "Céline Ndong",
        address: "Avenue de l'Indépendance",
        rating: 4.7,
        verified: true,
        employees: ["Céline", "Grace", "Fatima"],
        distance: "1.2km",
        isFavorite: true,
        reviewCount: 89,
        badges: ["Mode", "Artisanal"],
        subcategory: "Vêtements & mode"
      },
      {
        id: "commerce_003",
        name: "Électronique Plus",
        type: "Matériel électronique",
        owner: "Antoine Mba",
        address: "Quartier Glass, Libreville",
        rating: 4.5,
        verified: true,
        employees: ["Antoine", "Technicien", "Vendeur"],
        distance: "800m",
        isFavorite: false,
        reviewCount: 67,
        badges: ["Électronique", "Service Client 5⭐"],
        subcategory: "Téléphones & électronique"
      },
      {
        id: "commerce_004",
        name: "Pharmacie Centrale",
        type: "Pharmacie",
        owner: "Dr. Françoise Mboumba",
        address: "Boulevard Triomphal, Libreville",
        rating: 4.6,
        verified: true,
        employees: ["Pharmacien", "Assistant", "Caisse"],
        distance: "2.1km",
        isFavorite: false,
        reviewCount: 112,
        badges: ["Santé", "Certifié"],
        subcategory: "Pharmacies & parapharmacie"
      }
    ]
  },
  restauration: {
    id: "restauration",
    title: "Restauration & Agroalimentaire",
    icon: "🍴",
    color: "from-orange-500 to-red-600",
    subcategories: [
      "Restaurants traditionnels",
      "Fast-foods & snacks",
      "Cafés & salons de thé",
      "Boulangeries & pâtisseries"
    ],
    establishments: [
      {
        id: "resto_001",
        name: "Restaurant Chez Tonton",
        type: "Restaurant traditionnel",
        owner: "Paul Mba",
        address: "Quartier Glass, Libreville",
        rating: 4.9,
        verified: true,
        employees: ["Paul", "Marie", "Jean", "Sylvie"],
        distance: "800m",
        isFavorite: false,
        reviewCount: 234,
        badges: ["Top Restaurant", "Cuisine Traditionnelle"],
        featured: true,
        subcategory: "Restaurants traditionnels"
      },
      {
        id: "resto_002",
        name: "Café Central",
        type: "Café & Pâtisserie",
        owner: "Marie Nzamba",
        address: "Centre-ville, Libreville",
        rating: 4.6,
        verified: true,
        employees: ["Marie", "Barista", "Pâtissier"],
        distance: "500m",
        isFavorite: true,
        reviewCount: 143,
        badges: ["Café", "Pâtisserie Artisanale"],
        subcategory: "Cafés & salons de thé"
      }
    ]
  },
  hotellerie: {
    id: "hotellerie",
    title: "Hôtellerie & Tourisme",
    icon: "🏨",
    color: "from-purple-500 to-pink-600",
    subcategories: [
      "Hôtels",
      "Auberges & guest houses",
      "Agences de voyage",
      "Sites touristiques"
    ],
    establishments: []
  },
  automobile: {
    id: "automobile",
    title: "Automobile & Transport",
    icon: "🚗",
    color: "from-green-500 to-teal-600",
    subcategories: [
      "Taxi & VTC",
      "Bus & minibus",
      "Bateaux & pirogues motorisées",
      "Location de véhicules"
    ],
    establishments: []
  },
  immobilier: {
    id: "immobilier",
    title: "Immobilier & Habitat",
    icon: "🏠",
    color: "from-emerald-500 to-cyan-600",
    subcategories: [
      "Agences immobilières",
      "Vente de terrains & maisons",
      "Location de logements",
      "Cités universitaires"
    ],
    establishments: []
  },
  artisanat: {
    id: "artisanat",
    title: "Artisanat & Services Techniques",
    icon: "🛠️",
    color: "from-amber-500 to-yellow-600",
    subcategories: [
      "Menuiserie",
      "Couture & stylisme",
      "Mécanique de précision",
      "Électricité & plomberie"
    ],
    establishments: []
  },
  services: {
    id: "services",
    title: "Services Professionnels",
    icon: "💼",
    color: "from-slate-500 to-gray-600",
    subcategories: [
      "Cabinets d'avocats",
      "Comptables & fiscalistes",
      "Agences de communication",
      "Agences marketing & publicité"
    ],
    establishments: []
  },
  education: {
    id: "education",
    title: "Éducation & Formation",
    icon: "🎓",
    color: "from-indigo-500 to-blue-600",
    subcategories: [
      "Écoles maternelles, primaires, secondaires",
      "Universités & grandes écoles",
      "Centres de formation professionnelle",
      "Cours particuliers & tutorat"
    ],
    establishments: []
  },
  sante: {
    id: "sante",
    title: "Santé & Bien-être",
    icon: "👩‍⚕️",
    color: "from-red-500 to-pink-600",
    subcategories: [
      "Hôpitaux & cliniques",
      "Cabinets médicaux",
      "Laboratoires d'analyses",
      "Pharmacies"
    ],
    establishments: []
  },
  culture: {
    id: "culture",
    title: "Culture, Divertissement & Sport",
    icon: "🎤",
    color: "from-violet-500 to-purple-600",
    subcategories: [
      "Cinémas",
      "Salles de spectacle",
      "Festivals & événements",
      "Bars & discothèques"
    ],
    establishments: []
  },
  technologie: {
    id: "technologie",
    title: "Technologie & Numérique",
    icon: "💻",
    color: "from-cyan-500 to-blue-600",
    subcategories: [
      "Vente de matériel informatique",
      "Développeurs & freelances IT",
      "Agences digitales",
      "Fournisseurs d'accès internet"
    ],
    establishments: []
  },
  finance: {
    id: "finance",
    title: "Banques, Finance & Assurances",
    icon: "💳",
    color: "from-teal-500 to-green-600",
    subcategories: [
      "Banques commerciales",
      "Microfinances",
      "Assurances",
      "Mobile Money (Airtel Money, Moov Money, etc.)"
    ],
    establishments: []
  },
  agriculture: {
    id: "agriculture",
    title: "Agriculture & Environnement",
    icon: "🌱",
    color: "from-lime-500 to-green-600",
    subcategories: [
      "Exploitations agricoles",
      "Coopératives agricoles",
      "Pêche & aquaculture",
      "Élevage (volaille, bovins, porcs, etc.)"
    ],
    establishments: []
  },
  institutions: {
    id: "institutions",
    title: "Institutions & Vie Publique",
    icon: "🏛️",
    color: "from-stone-500 to-slate-600",
    subcategories: [
      "Administrations (mairies, préfectures, etc.)",
      "Ministères & organismes publics",
      "ONG & associations",
      "Services communautaires"
    ],
    establishments: []
  },
  logistique: {
    id: "logistique",
    title: "Logistique & Services",
    icon: "📦",
    color: "from-gray-500 to-zinc-600",
    subcategories: [
      "Transport de marchandises",
      "Livraison express",
      "Coursiers indépendants",
      "Entreposage & stockage"
    ],
    establishments: []
  }
};

// Filtres et options de tri
const sortOptions = [
  { value: "rating", label: "Mieux notés", icon: Star },
  { value: "distance", label: "Plus proches", icon: MapPin },
  { value: "popular", label: "Plus populaires", icon: TrendingUp },
  { value: "name", label: "Ordre alphabétique", icon: Filter }
];

const priceRanges = [
  { value: "all", label: "Tous les prix" },
  { value: "budget", label: "Économique (€)" },
  { value: "mid", label: "Intermédiaire (€€)" },
  { value: "premium", label: "Premium (€€€)" }
];

const distanceFilters = [
  { value: "all", label: "Toute distance" },
  { value: "500m", label: "Dans les 500m" },
  { value: "1km", label: "Dans 1 km" },
  { value: "5km", label: "Dans 5 km" }
];

export const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("rating");
  const [priceFilter, setPriceFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null);
  const [showCommerceDetails, setShowCommerceDetails] = useState(false);

  // Récupérer les données de la catégorie
  const category = categoryId ? categoriesData[categoryId as keyof typeof categoriesData] : null;

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Catégorie non trouvée</h1>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  // Filtrer et trier les établissements
  const filteredEstablishments = category.establishments
    .filter(est => {
      if (searchQuery && !est.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (subcategoryFilter !== "all" && est.subcategory !== subcategoryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "distance": return parseFloat(a.distance) - parseFloat(b.distance);
        case "popular": return b.reviewCount - a.reviewCount;
        case "name": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const featuredEstablishments = filteredEstablishments.filter(est => est.featured);
  const topRatedEstablishments = filteredEstablishments.filter(est => est.rating >= 4.7);

  const handleCommerceSelect = (establishment: any) => {
    setSelectedCommerce(establishment);
    setShowCommerceDetails(true);
  };

  const handleFavorite = (establishment: any) => {
    toast.success(`${establishment.name} ajouté aux favoris`);
  };

  const handleMessage = (establishment: any) => {
    toast.info(`Message envoyé à ${establishment.name}`);
  };

  const handleShare = () => {
    navigator.share?.({
      title: `Catégorie ${category.title} - Gaboma`,
      text: `Découvrez les ${filteredEstablishments.length} établissements dans ${category.title}`,
      url: window.location.href
    }) || toast.success("Lien copié dans le presse-papier");
  };

  const handleGetDirections = () => {
    toast.info("Ouverture de Google Maps...");
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header avec navigation et info catégorie */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-20 border-b border-border">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{category.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredEstablishments.length} établissement{filteredEstablishments.length > 1 ? 's' : ''} à Libreville
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4" />
              </Button>
            </div>

            {/* Barre de recherche */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher dans cette catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres et options d'affichage */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {/* Mode d'affichage */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Tri */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Prix */}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Distance */}
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {distanceFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sous-catégorie */}
              <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sous-catégories</SelectItem>
                  {category.subcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contenu principal avec tabs */}
        <div className="p-4">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Tous ({filteredEstablishments.length})
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Vedette ({featuredEstablishments.length})
              </TabsTrigger>
              <TabsTrigger value="top-rated" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Top Notés ({topRatedEstablishments.length})
              </TabsTrigger>
              <TabsTrigger value="nearby" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                À Proximité
              </TabsTrigger>
            </TabsList>

            {/* Bannière publicitaire */}
            <div className="my-6">
              <GeolocalizedAdCarousel userLocation="Libreville" />
            </div>

            <TabsContent value="all" className="space-y-6">
              {/* Statistiques rapides */}
              {filteredEstablishments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="text-center p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold">{filteredEstablishments.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Établissements</p>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-2xl font-bold">
                        {(filteredEstablishments.reduce((acc, est) => acc + est.rating, 0) / filteredEstablishments.length).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Note moyenne</p>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-accent" />
                      <span className="text-2xl font-bold">{featuredEstablishments.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">En vedette</p>
                  </Card>
                  <Card className="text-center p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-green-500" />
                      <span className="text-2xl font-bold">
                        {Math.min(...filteredEstablishments.map(est => parseFloat(est.distance))).toFixed(1)}km
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Plus proche</p>
                  </Card>
                </div>
              )}

              {/* Liste des établissements */}
              <div className={`grid gap-4 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {filteredEstablishments.map((establishment) => (
                  <CommerceCard
                    key={establishment.id}
                    commerce={establishment}
                    variant={viewMode === "list" ? "compact" : "default"}
                    onSelect={handleCommerceSelect}
                    onFavorite={handleFavorite}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="space-y-6">
              <div className={`grid gap-4 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {featuredEstablishments.map((establishment) => (
                  <CommerceCard
                    key={establishment.id}
                    commerce={establishment}
                    variant="featured"
                    onSelect={handleCommerceSelect}
                    onFavorite={handleFavorite}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="top-rated" className="space-y-6">
              <div className={`grid gap-4 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {topRatedEstablishments.map((establishment) => (
                  <CommerceCard
                    key={establishment.id}
                    commerce={establishment}
                    variant="default"
                    onSelect={handleCommerceSelect}
                    onFavorite={handleFavorite}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="nearby" className="space-y-6">
              {/* Actions rapides de géolocalisation */}
              <div className="flex gap-3 mb-6">
                <Button onClick={handleGetDirections} className="flex-1">
                  <Navigation className="w-4 h-4 mr-2" />
                  Voir sur la carte
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share className="w-4 h-4 mr-2" />
                  Partager ma position
                </Button>
              </div>

              <div className={`grid gap-4 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {filteredEstablishments
                  .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                  .map((establishment) => (
                    <CommerceCard
                      key={establishment.id}
                      commerce={establishment}
                      variant="default"
                      onSelect={handleCommerceSelect}
                      onFavorite={handleFavorite}
                      onMessage={handleMessage}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Message si aucun résultat */}
          {filteredEstablishments.length === 0 && (
            <div className="text-center py-12">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto mb-4 opacity-30`}>
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucun établissement trouvé</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Aucun établissement ne correspond à vos critères de recherche dans cette catégorie.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSubcategoryFilter("all");
                  setPriceFilter("all");
                  setDistanceFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {selectedCommerce && (
        <EnhancedCommerceDetailsPopup
          open={showCommerceDetails}
          onClose={() => {
            setShowCommerceDetails(false);
            setSelectedCommerce(null);
          }}
          commerce={selectedCommerce}
          onMessage={handleMessage}
        />
      )}
    </>
  );
};