export interface Commerce {
  id: string;
  name: string;
  type: string;
  category: string;
  owner: string;
  address: string;
  district: string;
  rating: number;
  verified: boolean;
  employees: string[];
  distance: string;
  priceRange: string;
  openNow: boolean;
  reviews: number;
  coordinates: { lat: number; lng: number };
  phone?: string;
  hours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  specialties?: string[];
  paymentMethods?: string[];
  languages?: string[];
  established?: number;
  description?: string;
  images?: string[];
  socialMedia?: {
    facebook?: string;
    whatsapp?: string;
    instagram?: string;
  };
}

export const categories = [
  { id: "all", name: "Tous", count: 2847, icon: "🏪", color: "from-blue-500 to-purple-600" },
  { id: "Restauration", name: "Restauration", count: 456, icon: "🍽️", color: "from-orange-500 to-red-600" },
  { id: "Beauté", name: "Beauté", count: 189, icon: "💄", color: "from-pink-500 to-rose-600" },
  { id: "Automobile", name: "Automobile", count: 167, icon: "🚗", color: "from-blue-600 to-indigo-700" },
  { id: "Bricolage", name: "Bricolage", count: 223, icon: "🔨", color: "from-amber-500 to-orange-600" },
  { id: "Santé", name: "Santé", count: 334, icon: "⚕️", color: "from-green-500 to-emerald-600" },
  { id: "Services", name: "Services", count: 278, icon: "🛠️", color: "from-gray-500 to-slate-600" },
  { id: "Shopping", name: "Shopping", count: 195, icon: "🛍️", color: "from-purple-500 to-violet-600" },
  { id: "Education", name: "Éducation", count: 145, icon: "📚", color: "from-indigo-500 to-blue-600" },
  { id: "Banque", name: "Banque", count: 89, icon: "🏦", color: "from-emerald-500 to-teal-600" },
  { id: "Sport", name: "Sport", count: 123, icon: "⚽", color: "from-green-600 to-lime-600" },
  { id: "Culture", name: "Culture", count: 78, icon: "🎭", color: "from-violet-500 to-purple-600" }
];

export const districts = [
  "Nombakélé", "Glass", "Akanda", "Oloumi", "Cocotiers", "Batterie IV", 
  "Charbonnages", "Lalala", "Rio", "Montagne Sainte", "Nzeng-Ayong",
  "Plaine Orety", "Sibang", "Awendje", "Bambouchine", "Damas"
];

export const mockCommerces: Commerce[] = [
  // Restauration (30 établissements)
  {
    id: "rest_001",
    name: "Boulangerie Chez Mama Nzé",
    type: "Boulangerie artisanale",
    category: "Restauration",
    owner: "Marie Nzé",
    address: "Avenue Bouët, Quartier Nombakélé",
    district: "Nombakélé",
    rating: 4.8,
    verified: true,
    employees: ["Marie Nzé", "Jean-Claude", "Esperance", "Fatou"],
    distance: "300m",
    priceRange: "€",
    openNow: true,
    reviews: 256,
    coordinates: { lat: 0.4162, lng: 9.4673 },
    phone: "+241 07 12 34 56",
    specialties: ["Pain traditionnel", "Pâtisseries", "Viennoiseries"],
    paymentMethods: ["Espèces", "Mobile Money"],
    languages: ["Français", "Fang"],
    established: 2018,
    description: "Boulangerie familiale proposant des produits frais et authentiques depuis plus de 5 ans.",
    hours: {
      monday: "05:30 - 19:00",
      tuesday: "05:30 - 19:00", 
      wednesday: "05:30 - 19:00",
      thursday: "05:30 - 19:00",
      friday: "05:30 - 19:00",
      saturday: "05:30 - 20:00",
      sunday: "06:00 - 18:00"
    }
  },
  {
    id: "rest_002",
    name: "Restaurant Le Palmier d'Or",
    type: "Restaurant gastronomique",
    category: "Restauration",
    owner: "Paul Mba Obame",
    address: "Boulevard Triomphal, Centre-ville",
    district: "Glass",
    rating: 4.6,
    verified: true,
    employees: ["Paul Mba", "Marie Akendengue", "Jean Nguema", "Sylvie Ondo", "Grace Ella"],
    distance: "800m",
    priceRange: "€€€",
    openNow: true,
    reviews: 412,
    coordinates: { lat: 0.4142, lng: 9.4653 },
    phone: "+241 01 23 45 67",
    specialties: ["Cuisine gabonaise", "Fruits de mer", "Grillades"],
    paymentMethods: ["Espèces", "Carte bancaire", "Mobile Money"],
    languages: ["Français", "Anglais", "Fang"],
    established: 2015,
    description: "Restaurant haut de gamme spécialisé dans la cuisine gabonaise moderne avec vue sur l'océan."
  },
  {
    id: "rest_003",
    name: "Maquis Chez Tonton",
    type: "Maquis traditionnel",
    category: "Restauration",
    owner: "André Moussounda",
    address: "Quartier Charbonnages",
    district: "Charbonnages",
    rating: 4.4,
    verified: true,
    employees: ["André", "Paulette", "Junior"],
    distance: "1.2km",
    priceRange: "€",
    openNow: true,
    reviews: 189,
    coordinates: { lat: 0.4125, lng: 9.4695 },
    specialties: ["Poulet braisé", "Poisson grillé", "Bière locale"],
    paymentMethods: ["Espèces", "Mobile Money"],
    established: 2012
  },

  // Beauté (25 établissements)
  {
    id: "beauty_001",
    name: "Coiffure Afrique Beauté",
    type: "Salon de coiffure moderne",
    category: "Beauté",
    owner: "Sylvie Mbourou",
    address: "Avenue Hassan II, Quartier Akanda",
    district: "Akanda", 
    rating: 4.9,
    verified: true,
    employees: ["Sylvie Mbourou", "Grace Mintsa", "Fatou Diallo", "Aline Nguema"],
    distance: "1.1km",
    priceRange: "€€",
    openNow: false,
    reviews: 334,
    coordinates: { lat: 0.4172, lng: 9.4663 },
    phone: "+241 06 78 90 12",
    specialties: ["Tresses africaines", "Défrisage", "Soins capillaires", "Manucure"],
    paymentMethods: ["Espèces", "Mobile Money", "Carte bancaire"],
    languages: ["Français", "Wolof", "Fang"],
    established: 2019,
    description: "Salon moderne spécialisé dans les coiffures africaines et les soins de beauté."
  },
  {
    id: "beauty_002",
    name: "Institut de Beauté Ebène",
    type: "Institut de beauté",
    category: "Beauté",
    owner: "Dr. Fatima Al-Rashid",
    address: "Résidence les Palmiers, Cocotiers",
    district: "Cocotiers",
    rating: 4.7,
    verified: true,
    employees: ["Dr. Fatima", "Aminata", "Khadija", "Sarah"],
    distance: "2.1km",
    priceRange: "€€€",
    openNow: true,
    reviews: 156,
    coordinates: { lat: 0.4089, lng: 9.4734 },
    specialties: ["Soins du visage", "Épilation laser", "Massages", "Pédicure"],
    established: 2020
  },

  // Automobile (20 établissements)
  {
    id: "auto_001",
    name: "Garage Auto Gaboma",
    type: "Garage automobile multimarque",
    category: "Automobile",
    owner: "Pierre Ekomi Ndong",
    address: "Route Nationale N1, Sortie Libreville",
    district: "Oloumi",
    rating: 4.5,
    verified: true,
    employees: ["Pierre Ekomi", "André Obiang", "Michel Eyegue", "Joseph Mba"],
    distance: "650m",
    priceRange: "€€",
    openNow: true,
    reviews: 189,
    coordinates: { lat: 0.4152, lng: 9.4683 },
    phone: "+241 05 43 21 09",
    specialties: ["Réparation mécanique", "Carrosserie", "Climatisation auto", "Diagnostic électronique"],
    paymentMethods: ["Espèces", "Chèque", "Virement bancaire"],
    languages: ["Français", "Fang"],
    established: 2016,
    description: "Garage spécialisé dans la réparation automobile toutes marques avec équipement moderne."
  },

  // Santé (30 établissements)
  {
    id: "health_001",
    name: "Pharmacie du Soleil",
    type: "Pharmacie moderne",
    category: "Santé",
    owner: "Dr. Marie Ndong Ela",
    address: "Carrefour Total, Quartier Glass",
    district: "Glass",
    rating: 4.7,
    verified: true,
    employees: ["Dr. Marie Ndong", "Pharmacien Paul Ovono", "Assistant Claire Mintsa"],
    distance: "500m",
    priceRange: "€€",
    openNow: true,
    reviews: 298,
    coordinates: { lat: 0.4172, lng: 9.4643 },
    phone: "+241 01 76 54 32",
    specialties: ["Médicaments", "Parapharmacie", "Matériel médical", "Conseils pharmaceutiques"],
    paymentMethods: ["Espèces", "Carte bancaire", "Assurance maladie"],
    languages: ["Français", "Fang", "Anglais"],
    established: 2017,
    description: "Pharmacie moderne avec large gamme de produits pharmaceutiques et conseils personnalisés."
  },
  {
    id: "health_002",
    name: "Clinique Sainte-Marie",
    type: "Clinique privée",
    category: "Santé",
    owner: "Dr. Jean-Baptiste Moussounda",
    address: "Boulevard de l'Indépendance",
    district: "Glass",
    rating: 4.6,
    verified: true,
    employees: ["Dr. Jean-Baptiste", "Dr. Sylvie Nze", "Inf. Marie Obame", "Inf. Paul Ekogha"],
    distance: "1.5km",
    priceRange: "€€€",
    openNow: true,
    reviews: 167,
    coordinates: { lat: 0.4195, lng: 9.4625 },
    specialties: ["Médecine générale", "Pédiatrie", "Gynécologie", "Urgences"],
    established: 2014
  },

  // Bricolage & Services (25 établissements)
  {
    id: "diy_001",
    name: "Quincaillerie Moderne SARL",
    type: "Quincaillerie générale",
    category: "Bricolage",
    owner: "André Obame Nguema",
    address: "Marché du Mont-Bouët, Quartier Oloumi",
    district: "Oloumi",
    rating: 4.3,
    verified: true,
    employees: ["André Obame", "Michel Biyoghe", "Joseph Allogho"],
    distance: "1.2km",
    priceRange: "€€",
    openNow: true,
    reviews: 167,
    coordinates: { lat: 0.4132, lng: 9.4693 },
    phone: "+241 02 87 65 43",
    specialties: ["Outillage", "Matériaux de construction", "Électricité", "Plomberie"],
    paymentMethods: ["Espèces", "Chèque", "Mobile Money"],
    languages: ["Français", "Fang"],
    established: 2013,
    description: "Quincaillerie complète pour tous vos besoins en bricolage et construction."
  },

  // Shopping (20 établissements)
  {
    id: "shop_001",
    name: "Boutique Élégance Africaine",
    type: "Boutique de mode",
    category: "Shopping",
    owner: "Aminata Traoré",
    address: "Centre commercial Mbolo",
    district: "Glass",
    rating: 4.8,
    verified: true,
    employees: ["Aminata", "Fatoumata", "Aissatou"],
    distance: "900m",
    priceRange: "€€",
    openNow: true,
    reviews: 145,
    coordinates: { lat: 0.4158, lng: 9.4647 },
    specialties: ["Mode africaine", "Tissus wax", "Bijoux", "Accessoires"],
    established: 2019
  },

  // Éducation (15 établissements)
  {
    id: "edu_001",
    name: "École Privée Les Bambins",
    type: "École primaire privée",
    category: "Education",
    owner: "Mme. Elisabeth Nze Minko",
    address: "Quartier Batterie IV",
    district: "Batterie IV",
    rating: 4.6,
    verified: true,
    employees: ["Elisabeth Nze", "Jean-Paul Mintsa", "Marie-Claire Ondo", "Pierre Nkoghe"],
    distance: "1.8km",
    priceRange: "€€€",
    openNow: false,
    reviews: 89,
    coordinates: { lat: 0.4203, lng: 9.4712 },
    specialties: ["Enseignement bilingue", "Informatique", "Arts", "Sport"],
    established: 2010
  },

  // Banque & Services financiers (10 établissements)
  {
    id: "bank_001",
    name: "Agence BGFI Bank Nombakélé",
    type: "Banque",
    category: "Banque",
    owner: "BGFI Bank Gabon",
    address: "Avenue Bouët, Face Pharmacie centrale",
    district: "Nombakélé",
    rating: 4.2,
    verified: true,
    employees: ["Directeur Alain Nze", "Conseillère Marie Obame", "Caissier Paul Mintsa"],
    distance: "400m",
    priceRange: "€€",
    openNow: true,
    reviews: 234,
    coordinates: { lat: 0.4168, lng: 9.4669 },
    specialties: ["Comptes particuliers", "Crédit", "Change", "Virements internationaux"],
    established: 2008
  }

  // ... Ajout de plus de commerces pour atteindre environ 100-150 établissements
];

// Génération de commerces supplémentaires
const additionalCommerces: Commerce[] = [];

// Restaurants supplémentaires
const restaurantNames = [
  "Chez Mama Ngozi", "Le Baobab", "Restaurant du Port", "La Terrasse", "Maquis Chez Papa",
  "Le Délice Gabonais", "Chez Tata Régine", "Le Grilladin", "Restaurant l'Océan", "Chez Mamie"
];

const beautyNames = [
  "Salon Beauté Noire", "Coiffure Tendance", "Institut Éclat", "Salon Royal", "Beauté d'Afrique",
  "Coiffure Moderne", "Salon VIP", "Beauté Plus", "Institut Glamour", "Salon des Stars"
];

const autoNames = [
  "Garage Central", "Atelier Mécanique Plus", "Garage des Experts", "Auto Service", "Garage Moderne",
  "Méca Plus", "Garage Rapid", "Auto Réparation", "Service Auto", "Garage Professionnel"
];

// Génération automatique de commerces supplémentaires pour avoir plus de données
restaurantNames.forEach((name, index) => {
  additionalCommerces.push({
    id: `rest_${String(index + 10).padStart(3, '0')}`,
    name,
    type: ["Restaurant", "Maquis", "Fast-food", "Brasserie"][index % 4],
    category: "Restauration",
    owner: `Propriétaire ${index + 1}`,
    address: `${districts[index % districts.length]}`,
    district: districts[index % districts.length],
    rating: +(3.5 + Math.random() * 1.5).toFixed(1),
    verified: Math.random() > 0.3,
    employees: Array.from({length: Math.floor(Math.random() * 4) + 2}, (_, i) => `Employé ${i + 1}`),
    distance: `${(Math.random() * 3 + 0.2).toFixed(1)}km`,
    priceRange: ["€", "€€", "€€€"][Math.floor(Math.random() * 3)],
    openNow: Math.random() > 0.2,
    reviews: Math.floor(Math.random() * 300) + 20,
    coordinates: { 
      lat: 0.41 + (Math.random() - 0.5) * 0.02, 
      lng: 9.46 + (Math.random() - 0.5) * 0.02 
    },
    specialties: ["Plats locaux", "Grillades", "Poissons"][Math.floor(Math.random() * 3)] ? ["Plats locaux", "Grillades"] : ["Poissons", "Boissons"],
    paymentMethods: ["Espèces", "Mobile Money"],
    established: 2010 + Math.floor(Math.random() * 13)
  });
});

beautyNames.forEach((name, index) => {
  additionalCommerces.push({
    id: `beauty_${String(index + 10).padStart(3, '0')}`,
    name,
    type: ["Salon de coiffure", "Institut de beauté", "Barbier"][index % 3],
    category: "Beauté",
    owner: `Propriétaire ${index + 1}`,
    address: `${districts[index % districts.length]}`,
    district: districts[index % districts.length],
    rating: +(3.8 + Math.random() * 1.2).toFixed(1),
    verified: Math.random() > 0.25,
    employees: Array.from({length: Math.floor(Math.random() * 3) + 2}, (_, i) => `Coiffeur ${i + 1}`),
    distance: `${(Math.random() * 2.5 + 0.3).toFixed(1)}km`,
    priceRange: ["€", "€€", "€€€"][Math.floor(Math.random() * 3)],
    openNow: Math.random() > 0.15,
    reviews: Math.floor(Math.random() * 200) + 15,
    coordinates: { 
      lat: 0.41 + (Math.random() - 0.5) * 0.02, 
      lng: 9.46 + (Math.random() - 0.5) * 0.02 
    },
    specialties: ["Coiffure", "Manucure", "Soins"],
    paymentMethods: ["Espèces", "Mobile Money"],
    established: 2012 + Math.floor(Math.random() * 11)
  });
});

export const allCommerces = [...mockCommerces, ...additionalCommerces];

export const getCommercesByCategory = (categoryId: string) => {
  if (categoryId === "all") return allCommerces;
  return allCommerces.filter(commerce => commerce.category === categoryId);
};

export const getNearbyCommerces = (lat: number, lng: number, radiusKm: number = 2) => {
  return allCommerces.filter(commerce => {
    const distance = Math.sqrt(
      Math.pow(commerce.coordinates.lat - lat, 2) + 
      Math.pow(commerce.coordinates.lng - lng, 2)
    ) * 111; // Approximation en km
    return distance <= radiusKm;
  });
};

export const getFeaturedCommerces = () => {
  return allCommerces
    .filter(commerce => commerce.verified && commerce.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
};

export const getTrendingCommerces = () => {
  return allCommerces
    .filter(commerce => commerce.reviews >= 100)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 8);
};