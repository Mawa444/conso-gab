export interface MockCatalog {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  business_id: string;
  business_name: string;
  is_public: boolean;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
  seo_score: number;
}

export const mockCatalogs: MockCatalog[] = [
  // Catalogues pour le business "rest_001" (Boulangerie Chez Mama Nzé)
  {
    id: "cat_001",
    name: "Pains Traditionnels",
    description: "Notre sélection de pains frais préparés chaque matin avec des ingrédients de qualité",
    images: [
      "/placeholder.svg?height=400&width=600&text=Pain+Traditionnel",
      "/placeholder.svg?height=400&width=600&text=Baguette+Française",
      "/placeholder.svg?height=400&width=600&text=Pain+de+Mie"
    ],
    category: "Boulangerie",
    business_id: "rest_001", 
    business_name: "Boulangerie Chez Mama Nzé",
    is_public: true,
    is_active: true,
    product_count: 12,
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-12-01T10:30:00Z",
    seo_score: 85
  },
  {
    id: "cat_002", 
    name: "Pâtisseries & Gâteaux",
    description: "Délicieuses pâtisseries et gâteaux pour toutes vos occasions spéciales",
    images: [
      "/placeholder.svg?height=400&width=600&text=Gâteau+Anniversaire",
      "/placeholder.svg?height=400&width=600&text=Croissants",
      "/placeholder.svg?height=400&width=600&text=Éclairs"
    ],
    category: "Pâtisserie",
    business_id: "rest_001",
    business_name: "Boulangerie Chez Mama Nzé", 
    is_public: true,
    is_active: true,
    product_count: 8,
    created_at: "2024-02-10T14:20:00Z",
    updated_at: "2024-11-28T16:45:00Z",
    seo_score: 78
  },

  // Catalogues pour le business "rest_002" (Restaurant Le Palmier d'Or)
  {
    id: "cat_003",
    name: "Cuisine Gabonaise Authentique", 
    description: "Découvrez nos plats traditionnels gabonais préparés selon les recettes ancestrales",
    images: [
      "/placeholder.svg?height=400&width=600&text=Poulet+Nyembwe",
      "/placeholder.svg?height=400&width=600&text=Poisson+Salé",
      "/placeholder.svg?height=400&width=600&text=Manioc+Sauce"
    ],
    category: "Plats traditionnels",
    business_id: "rest_002",
    business_name: "Restaurant Le Palmier d'Or",
    is_public: true,
    is_active: true,
    product_count: 15,
    created_at: "2024-03-05T12:00:00Z",
    updated_at: "2024-12-02T09:15:00Z", 
    seo_score: 92
  },
  {
    id: "cat_004",
    name: "Fruits de Mer Premium",
    description: "Sélection de fruits de mer frais pêchés le jour même sur les côtes gabonaises",
    images: [
      "/placeholder.svg?height=400&width=600&text=Crevettes+Grillées",
      "/placeholder.svg?height=400&width=600&text=Homard+Royal", 
      "/placeholder.svg?height=400&width=600&text=Poisson+Blanc"
    ],
    category: "Fruits de mer",
    business_id: "rest_002",
    business_name: "Restaurant Le Palmier d'Or",
    is_public: true,
    is_active: true,
    product_count: 10,
    created_at: "2024-04-12T18:30:00Z",
    updated_at: "2024-11-30T14:20:00Z",
    seo_score: 88
  },

  // Catalogues pour le business "beauty_001" (Coiffure Afrique Beauté)
  {
    id: "cat_005",
    name: "Coiffures Africaines Modernes",
    description: "Styles de coiffure africaine tendance alliant tradition et modernité",
    images: [
      "/placeholder.svg?height=400&width=600&text=Tresses+Box+Braids",
      "/placeholder.svg?height=400&width=600&text=Vanilles+Twist",
      "/placeholder.svg?height=400&width=600&text=Locks+Naturelles"
    ],
    category: "Coiffure",
    business_id: "beauty_001",
    business_name: "Coiffure Afrique Beauté",
    is_public: true,
    is_active: true,
    product_count: 18,
    created_at: "2024-01-20T11:45:00Z",
    updated_at: "2024-12-01T15:30:00Z",
    seo_score: 90
  },
  {
    id: "cat_006", 
    name: "Soins Capillaires Naturels",
    description: "Produits et soins pour entretenir vos cheveux avec des ingrédients naturels d'Afrique",
    images: [
      "/placeholder.svg?height=400&width=600&text=Beurre+Karité",
      "/placeholder.svg?height=400&width=600&text=Huile+Coco",
      "/placeholder.svg?height=400&width=600&text=Masque+Avocat"
    ],
    category: "Soins capillaires",
    business_id: "beauty_001", 
    business_name: "Coiffure Afrique Beauté",
    is_public: true,
    is_active: true,
    product_count: 14,
    created_at: "2024-05-08T13:25:00Z",
    updated_at: "2024-11-25T17:10:00Z",
    seo_score: 82
  },

  // Catalogues pour le business "auto_001" (Garage Auto Gaboma)
  {
    id: "cat_007",
    name: "Réparations Mécaniques", 
    description: "Services complets de réparation mécanique pour tous types de véhicules",
    images: [
      "/placeholder.svg?height=400&width=600&text=Moteur+Réparation",
      "/placeholder.svg?height=400&width=600&text=Freins+Entretien",
      "/placeholder.svg?height=400&width=600&text=Diagnostic+Auto"
    ],
    category: "Mécanique",
    business_id: "auto_001",
    business_name: "Garage Auto Gaboma", 
    is_public: true,
    is_active: true,
    product_count: 25,
    created_at: "2024-02-18T09:00:00Z",
    updated_at: "2024-11-29T12:40:00Z",
    seo_score: 86
  },
  {
    id: "cat_008",
    name: "Pièces Détachées Originales",
    description: "Large stock de pièces détachées d'origine pour toutes marques de véhicules",
    images: [
      "/placeholder.svg?height=400&width=600&text=Filtre+Moteur",
      "/placeholder.svg?height=400&width=600&text=Plaquettes+Frein",
      "/placeholder.svg?height=400&width=600&text=Courroie+Distribution"
    ],
    category: "Pièces auto",
    business_id: "auto_001",
    business_name: "Garage Auto Gaboma",
    is_public: true,
    is_active: true,
    product_count: 35,
    created_at: "2024-06-22T16:15:00Z",
    updated_at: "2024-12-01T11:55:00Z", 
    seo_score: 79
  }
];

export const getCatalogsByBusinessId = (businessId: string): MockCatalog[] => {
  return mockCatalogs.filter(catalog => catalog.business_id === businessId);
};

export const getAllPublicCatalogs = (): MockCatalog[] => {
  return mockCatalogs.filter(catalog => catalog.is_public && catalog.is_active);
};