import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { GeolocalizedAdCarousel } from "@/components/advertising/GeolocalizedAdCarousel";

const categories = [
  {
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
    ]
  },
  {
    id: "restauration",
    title: "Restauration & Agroalimentaire",
    icon: "🍴",
    color: "from-orange-500 to-red-600",
    subcategories: [
      "Restaurants traditionnels",
      "Fast-foods & snacks",
      "Cafés & salons de thé",
      "Boulangeries & pâtisseries",
      "Traiteurs & services événementiels",
      "Vente de fruits & légumes",
      "Boucheries & charcuteries",
      "Poissonneries",
      "Produits locaux (manioc, banane, etc.)",
      "Livraison de repas"
    ]
  },
  {
    id: "hotellerie",
    title: "Hôtellerie & Tourisme",
    icon: "🏨",
    color: "from-purple-500 to-pink-600",
    subcategories: [
      "Hôtels",
      "Auberges & guest houses",
      "Agences de voyage",
      "Sites touristiques",
      "Parcs & loisirs",
      "Location saisonnière",
      "Transport touristique (bus, minibus, bateaux)"
    ]
  },
  {
    id: "automobile",
    title: "Automobile & Transport",
    icon: "🚗",
    color: "from-green-500 to-teal-600",
    subcategories: [
      "Taxi & VTC",
      "Bus & minibus",
      "Bateaux & pirogues motorisées",
      "Location de véhicules",
      "Vente de voitures & motos",
      "Réparation mécanique & garages",
      "Stations-service",
      "Vente de pièces détachées"
    ]
  },
  {
    id: "immobilier",
    title: "Immobilier & Habitat",
    icon: "🏠",
    color: "from-emerald-500 to-cyan-600",
    subcategories: [
      "Agences immobilières",
      "Vente de terrains & maisons",
      "Location de logements",
      "Cités universitaires",
      "Résidences meublées",
      "Services de déménagement",
      "Décoration & ameublement"
    ]
  },
  {
    id: "artisanat",
    title: "Artisanat & Services Techniques",
    icon: "🛠️",
    color: "from-amber-500 to-yellow-600",
    subcategories: [
      "Menuiserie",
      "Couture & stylisme",
      "Mécanique de précision",
      "Électricité & plomberie",
      "Maçonnerie & BTP",
      "Bijouterie & artisanat local",
      "Cordonnerie",
      "Sérigraphie & impression"
    ]
  },
  {
    id: "services",
    title: "Services Professionnels",
    icon: "💼",
    color: "from-slate-500 to-gray-600",
    subcategories: [
      "Cabinets d'avocats",
      "Comptables & fiscalistes",
      "Agences de communication",
      "Agences marketing & publicité",
      "Bureaux d'étude & ingénierie",
      "Conseils & formations professionnelles",
      "Consultants indépendants"
    ]
  },
  {
    id: "education",
    title: "Éducation & Formation",
    icon: "🎓",
    color: "from-indigo-500 to-blue-600",
    subcategories: [
      "Écoles maternelles, primaires, secondaires",
      "Universités & grandes écoles",
      "Centres de formation professionnelle",
      "Cours particuliers & tutorat",
      "Cours en ligne & e-learning",
      "Bibliothèques",
      "Centres linguistiques"
    ]
  },
  {
    id: "sante",
    title: "Santé & Bien-être",
    icon: "👩‍⚕️",
    color: "from-red-500 to-pink-600",
    subcategories: [
      "Hôpitaux & cliniques",
      "Cabinets médicaux",
      "Laboratoires d'analyses",
      "Pharmacies",
      "Centres de kinésithérapie",
      "Salles de sport & fitness",
      "Spas & instituts de beauté",
      "Médecine traditionnelle & phytothérapie"
    ]
  },
  {
    id: "culture",
    title: "Culture, Divertissement & Sport",
    icon: "🎤",
    color: "from-violet-500 to-purple-600",
    subcategories: [
      "Cinémas",
      "Salles de spectacle",
      "Festivals & événements",
      "Bars & discothèques",
      "Associations sportives",
      "Clubs de football, basketball, etc.",
      "Centres de loisirs & jeux pour enfants"
    ]
  },
  {
    id: "technologie",
    title: "Technologie & Numérique",
    icon: "💻",
    color: "from-cyan-500 to-blue-600",
    subcategories: [
      "Vente de matériel informatique",
      "Développeurs & freelances IT",
      "Agences digitales",
      "Fournisseurs d'accès internet",
      "Réparateurs de téléphones et PC",
      "Startups tech",
      "Cybers cafés"
    ]
  },
  {
    id: "finance",
    title: "Banques, Finance & Assurances",
    icon: "💳",
    color: "from-teal-500 to-green-600",
    subcategories: [
      "Banques commerciales",
      "Microfinances",
      "Assurances",
      "Mobile Money (Airtel Money, Moov Money, etc.)",
      "Change de devises",
      "Services financiers alternatifs (fintech)"
    ]
  },
  {
    id: "agriculture",
    title: "Agriculture & Environnement",
    icon: "🌱",
    color: "from-lime-500 to-green-600",
    subcategories: [
      "Exploitations agricoles",
      "Coopératives agricoles",
      "Pêche & aquaculture",
      "Élevage (volaille, bovins, porcs, etc.)",
      "Produits bio & naturels",
      "Services environnementaux (recyclage, collecte déchets, énergies vertes)"
    ]
  },
  {
    id: "institutions",
    title: "Institutions & Vie Publique",
    icon: "🏛️",
    color: "from-stone-500 to-slate-600",
    subcategories: [
      "Administrations (mairies, préfectures, etc.)",
      "Ministères & organismes publics",
      "ONG & associations",
      "Services communautaires",
      "Églises & lieux de culte"
    ]
  },
  {
    id: "logistique",
    title: "Logistique & Services",
    icon: "📦",
    color: "from-gray-500 to-zinc-600",
    subcategories: [
      "Transport de marchandises",
      "Livraison express",
      "Coursiers indépendants",
      "Entreposage & stockage",
      "Douanes & transit"
    ]
  }
];

interface CategoriesSectionProps {
  userLocation?: string;
}

export const CategoriesSection = ({ userLocation = "Libreville" }: CategoriesSectionProps) => {
  const handleCategoryClick = (categoryId: string) => {
    console.log("Catégorie sélectionnée:", categoryId);
  };

  // Fonction pour insérer des pubs après chaque 5 catégories
  const renderCategoriesWithAds = () => {
    const elementsToRender = [];
    
    for (let i = 0; i < categories.length; i += 5) {
      const chunk = categories.slice(i, i + 5);
      
      // Ajouter le groupe de 5 catégories
      elementsToRender.push(
        <div key={`categories-${i}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chunk.map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {category.subcategories.length} sous-catégories
                    </Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-32 overflow-hidden">
                  {category.subcategories.slice(0, 4).map((subcategory, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                      <span className="truncate">{subcategory}</span>
                    </div>
                  ))}
                  {category.subcategories.length > 4 && (
                    <div className="text-xs text-muted-foreground pt-1">
                      +{category.subcategories.length - 4} autres...
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  Explorer cette catégorie
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      );
      
      // Ajouter une bannière publicitaire après chaque groupe (sauf le dernier)
      if (i + 5 < categories.length) {
        elementsToRender.push(
          <div key={`ad-${i}`} className="py-8">
            <GeolocalizedAdCarousel userLocation={userLocation} />
          </div>
        );
      }
    }
    
    return elementsToRender;
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Toutes nos catégories</h2>
        <p className="text-muted-foreground">Explorez tous les secteurs d'activité du Gabon</p>
      </div>

      {renderCategoriesWithAds()}
    </div>
  );
};