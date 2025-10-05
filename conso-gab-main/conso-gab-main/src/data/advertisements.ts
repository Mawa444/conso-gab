export interface Advertisement {
  id: number;
  title: string;
  subtitle: string;
  image: string; // 1920x1080px
  backgroundColor: string;
  cta: string;
  displayFormat: 'carousel' | 'card' | 'fullscreen';
  displayContext: 'list' | 'popup' | 'fullscreen';
  targeting: {
    country?: string;
    province?: string;
    city?: string;
    zone?: string;
    neighborhood?: string;
  };
  tags: string[];
}

export const advertisements: Advertisement[] = [
  // --- Generic Ads from AdCarousel ---
  {
    id: 101,
    title: "Découvrez nos nouveaux partenaires",
    subtitle: "Plus de 50 nouveaux commerces rejoignent ConsoGab",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
    backgroundColor: "from-emerald-500 to-teal-600",
    cta: "Voir les nouveautés",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Libreville" },
    tags: ["nouveautés", "partenaires", "shopping"]
  },
  {
    id: 102,
    title: "Promotion Spéciale",
    subtitle: "10% de réduction chez nos partenaires beauté",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
    backgroundColor: "from-rose-500 to-pink-600",
    cta: "Profiter de l'offre",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Libreville" },
    tags: ["promotion", "réduction", "beauté"]
  },
  {
    id: 103,
    title: "Nouvelle Zone de Livraison",
    subtitle: "ConsoGab s'étend maintenant à Port-Gentil",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    backgroundColor: "from-blue-500 to-indigo-600",
    cta: "En savoir plus",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Port-Gentil" },
    tags: ["livraison", "nouveau", "port-gentil"]
  },
  {
    id: 104,
    title: "Programme de Fidélité",
    subtitle: "Gagnez des points à chaque achat et débloquez des récompenses",
    image: "https://images.unsplash.com/photo-1607734834519-d8576ae60ea7?w=800&h=400&fit=crop",
    backgroundColor: "from-amber-500 to-orange-600",
    cta: "Rejoindre maintenant",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { country: "Gabon" },
    tags: ["fidélité", "récompenses", "programme"]
  },

  // --- Geolocalized Ads from GeolocalizedAdCarousel ---
  {
    id: 1,
    title: "Restaurant Le Jardin des Saveurs",
    subtitle: "Cuisine française et gabonaise - Livraison gratuite à Libreville",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop",
    backgroundColor: "from-emerald-500 to-teal-600",
    cta: "Commander maintenant",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Libreville" },
    tags: ["restaurant", "cuisine française", "livraison"]
  },
  {
    id: 2,
    title: "Pharmacie Moderna Libreville",
    subtitle: "Vos médicaments livrés en 30 minutes dans tout Libreville",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop",
    backgroundColor: "from-blue-500 to-indigo-600",
    cta: "Voir les produits",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Libreville" },
    tags: ["pharmacie", "médicaments", "livraison rapide"]
  },
  {
    id: 3,
    title: "Supermarché Carrefour Libreville",
    subtitle: "Promotion spéciale : -20% sur tous les produits frais",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&h=400&fit=crop",
    backgroundColor: "from-orange-500 to-red-600",
    cta: "Profiter de l'offre",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Libreville" },
    tags: ["supermarché", "promotion", "produits frais"]
  },
  {
    id: 4,
    title: "Boulangerie Chez Mama Nzeng-Ayong",
    subtitle: "Pain frais tous les matins - Spécialités locales",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=400&fit=crop",
    backgroundColor: "from-amber-500 to-orange-600",
    cta: "Réserver votre pain",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Libreville", zone: "Nzeng-Ayong" },
    tags: ["boulangerie", "pain frais", "spécialités locales"]
  },
  {
    id: 5,
    title: "Garage Auto Nzeng-Ayong",
    subtitle: "Réparation et entretien automobile - Service rapide",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=400&fit=crop",
    backgroundColor: "from-slate-500 to-gray-600",
    cta: "Prendre rendez-vous",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Libreville", zone: "Nzeng-Ayong" },
    tags: ["garage", "réparation automobile", "entretien"]
  },
  {
    id: 6,
    title: "Marché d'Owendo",
    subtitle: "Produits frais et locaux - Ouvert tous les jours",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=400&fit=crop",
    backgroundColor: "from-green-500 to-emerald-600",
    cta: "Découvrir les produits",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Owendo" },
    tags: ["marché", "produits frais", "produits locaux"]
  },
  {
    id: 7,
    title: "École Technique d'Owendo",
    subtitle: "Formations professionnelles - Inscriptions ouvertes",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop",
    backgroundColor: "from-indigo-500 to-purple-600",
    cta: "S'inscrire maintenant",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Owendo" },
    tags: ["école", "formation professionnelle", "inscriptions"]
  },
  {
    id: 8,
    title: "Hôtel Atlantique Port-Gentil",
    subtitle: "Vue sur l'océan - Réservation en ligne disponible",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop",
    backgroundColor: "from-cyan-500 to-blue-600",
    cta: "Réserver maintenant",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Port-Gentil" },
    tags: ["hôtel", "vue sur l'océan", "réservation"]
  },
  {
    id: 9,
    title: "Clinique Maritime Port-Gentil",
    subtitle: "Soins de qualité - Urgences 24h/24",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=400&fit=crop",
    backgroundColor: "from-red-500 to-pink-600",
    cta: "Prendre rendez-vous",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Port-Gentil" },
    tags: ["clinique", "soins", "urgences"]
  },
  {
    id: 10,
    title: "Hôpital Albert Schweitzer",
    subtitle: "Centre médical de référence - Consultations spécialisées",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=400&fit=crop",
    backgroundColor: "from-teal-500 to-green-600",
    cta: "Prendre rendez-vous",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Lambaréné" },
    tags: ["hôpital", "centre médical", "consultations"]
  },
  {
    id: 11,
    title: "Restaurant Chez Maman Rosine",
    subtitle: "Spécialités gabonaises authentiques à Owendo",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop",
    backgroundColor: "from-orange-500 to-red-600",
    cta: "Commander maintenant",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Owendo" },
    tags: ["restaurant", "cuisine gabonaise", "spécialités"]
  },
  {
    id: 12,
    title: "Pharmacie Lambaréné Centre",
    subtitle: "Vos médicaments livrés en 30 minutes",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=400&fit=crop",
    backgroundColor: "from-green-500 to-teal-600",
    cta: "Voir les produits",
    displayFormat: 'carousel',
    displayContext: 'list',
    targeting: { city: "Lambaréné" },
    tags: ["pharmacie", "médicaments", "livraison rapide"]
  },
  
  // --- Fullscreen Ads ---
  {
    id: 201,
    title: "ConsoGab Premium",
    subtitle: "Passez à Premium pour une expérience sans publicité et des fonctionnalités exclusives.",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1920&h=1080&fit=crop",
    backgroundColor: "from-gray-800 to-black",
    cta: "Découvrir Premium",
    displayFormat: 'fullscreen',
    displayContext: 'fullscreen',
    targeting: { country: "Gabon" },
    tags: ["premium", "exclusif", "sans publicité"]
  },
  {
    id: 202,
    title: "Téléchargez l'Application Mobile",
    subtitle: "Accédez à ConsoGab partout, tout le temps.",
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=1920&h=1080&fit=crop",
    backgroundColor: "from-blue-700 to-blue-900",
    cta: "Télécharger maintenant",
    displayFormat: 'fullscreen',
    displayContext: 'fullscreen',
    targeting: { country: "Gabon" },
    tags: ["mobile", "application", "téléchargement"]
  },
];