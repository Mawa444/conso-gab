export interface BusinessCategory {
  id: string;
  nom: string;
  icon: string;
  color: string;
  subcategories: BusinessSubcategory[];
  tags: string[];
}

export interface BusinessSubcategory {
  id: string;
  nom: string;
  tags: string[];
}

export const businessCategories: BusinessCategory[] = [
  {
    id: "commerce_distribution",
    nom: "Commerce & Distribution",
    icon: "🛒",
    color: "from-blue-500 to-indigo-600",
    tags: ["boutique", "vente", "marché", "commerce", "distribution"],
    subcategories: [
      { 
        id: "epiceries_quartier", 
        nom: "Épiceries de quartier", 
        tags: ["boutique", "alimentation", "denrées", "étalage", "proximité"] 
      },
      { 
        id: "vente_marche", 
        nom: "Vente au marché", 
        tags: ["tomate", "manioc", "poisson", "marché", "légumes", "fruits"] 
      },
      { 
        id: "boucheries", 
        nom: "Boucheries", 
        tags: ["viande", "bœuf", "mouton", "porc", "chèvre", "cabri"] 
      },
      { 
        id: "boulangeries", 
        nom: "Boulangeries & Pâtisseries", 
        tags: ["pain", "gâteau", "viennoiserie", "boulangerie", "pâtisserie"] 
      },
      { 
        id: "supermarches", 
        nom: "Supermarchés & Grossistes", 
        tags: ["distribution", "hypermarché", "gros", "supermarché", "courses"] 
      },
      { 
        id: "vetements", 
        nom: "Vêtements & Friperies", 
        tags: ["habits", "fripes", "sapeurs", "mode", "vêtements", "friperie"] 
      },
      { 
        id: "telephonie", 
        nom: "Téléphonie & Accessoires", 
        tags: ["recharge", "téléphone", "smartphone", "accessoires", "mobile"] 
      }
    ]
  },
  {
    id: "artisanat_services",
    nom: "Artisanat & Services de proximité",
    icon: "🔨",
    color: "from-amber-500 to-orange-600",
    tags: ["artisan", "réparation", "services", "manuel", "technique"],
    subcategories: [
      { 
        id: "cordonnerie", 
        nom: "Cordonnerie", 
        tags: ["réparation chaussures", "sandales", "talons", "cordonnier", "chaussures"] 
      },
      { 
        id: "vulcanisation", 
        nom: "Vulcanisation", 
        tags: ["réparation pneus", "chambre à air", "pneu crevé", "vulcanisateur", "pneu"] 
      },
      { 
        id: "couture", 
        nom: "Couture & Retouches", 
        tags: ["pagne", "tailleur", "couturière", "robe", "couture", "retouches"] 
      },
      { 
        id: "menuiserie", 
        nom: "Menuiserie", 
        tags: ["meubles", "portes", "bois", "menuisier", "ébéniste"] 
      },
      { 
        id: "maconnerie", 
        nom: "Maçonnerie", 
        tags: ["briques", "ciment", "construction", "maçon", "bâtiment"] 
      },
      { 
        id: "mecanique", 
        nom: "Mécanique Auto/Moto", 
        tags: ["garage", "réparation moteur", "auto", "moto", "mécanicien"] 
      },
      { 
        id: "electriciens", 
        nom: "Électriciens", 
        tags: ["câblage", "courant", "installation", "électricité", "électricien"] 
      },
      { 
        id: "plomberie", 
        nom: "Plomberie", 
        tags: ["fuites", "robinet", "tuyaux", "plombier", "eau"] 
      }
    ]
  },
  {
    id: "restauration_hotellerie",
    nom: "Restauration & Hôtellerie",
    icon: "🍽️",
    color: "from-orange-500 to-red-600",
    tags: ["restaurant", "nourriture", "repas", "cuisine", "hôtel"],
    subcategories: [
      { 
        id: "restaurants_traditionnels", 
        nom: "Restaurants traditionnels", 
        tags: ["plat gabonais", "poulet DG", "nyembwe", "cuisine locale", "traditionnel"] 
      },
      { 
        id: "maquis_barbecue", 
        nom: "Maquis & Barbecue", 
        tags: ["brochettes", "grillades", "poissons braisés", "maquis", "barbecue"] 
      },
      { 
        id: "cafeterias_snacks", 
        nom: "Cafétérias & Snacks", 
        tags: ["sandwich", "café", "beignet", "snack", "restauration rapide"] 
      },
      { 
        id: "bars_boites", 
        nom: "Bars & Boîtes de nuit", 
        tags: ["discothèque", "bière", "ambiance", "bar", "boîte de nuit"] 
      },
      { 
        id: "hotels_auberges", 
        nom: "Hôtels & Auberges", 
        tags: ["chambre", "nuitée", "hébergement", "hôtel", "auberge"] 
      },
      { 
        id: "vendeurs_rue", 
        nom: "Vendeurs de rue", 
        tags: ["brochettes", "beignets", "manioc", "rue", "ambulant", "street food"] 
      }
    ]
  },
  {
    id: "sante_bienetre",
    nom: "Santé & Bien-être",
    icon: "🏥",
    color: "from-green-500 to-emerald-600",
    tags: ["santé", "médical", "soins", "bien-être", "pharmacie"],
    subcategories: [
      { 
        id: "pharmacies", 
        nom: "Pharmacies", 
        tags: ["médicaments", "ordonnance", "pharmacie", "santé"] 
      },
      { 
        id: "cliniques", 
        nom: "Cliniques privées", 
        tags: ["hôpital", "soins", "santé", "clinique", "médical"] 
      },
      { 
        id: "medecins", 
        nom: "Médecins généralistes & Spécialistes", 
        tags: ["consultation", "cardiologue", "pédiatre", "médecin", "docteur"] 
      },
      { 
        id: "beaute_coiffure", 
        nom: "Instituts de beauté & Coiffure", 
        tags: ["coiffure", "tresses", "esthétique", "manucure", "beauté", "salon", "barbier"] 
      },
      { 
        id: "sport_fitness", 
        nom: "Sport & Bien-être", 
        tags: ["fitness", "yoga", "musculation", "sport", "gymnastique"] 
      }
    ]
  },
  {
    id: "transport_logistique",
    nom: "Transport & Mobilité",
    icon: "🚗",
    color: "from-blue-600 to-indigo-700",
    tags: ["transport", "mobilité", "déplacement", "véhicule", "livraison"],
    subcategories: [
      { 
        id: "taxis_urbains", 
        nom: "Taxis urbains", 
        tags: ["clando", "transport ville", "taxi", "course"] 
      },
      { 
        id: "moto_taxis", 
        nom: "Moto-taxis", 
        tags: ["moto", "clando moto", "transport rapide", "moto-taxi"] 
      },
      { 
        id: "bus_collectif", 
        nom: "Bus & Transport collectif", 
        tags: ["navette", "transport", "bus", "collectif"] 
      },
      { 
        id: "transport_marchandises", 
        nom: "Transport de marchandises", 
        tags: ["livraison", "camion", "fret", "marchandises"] 
      },
      { 
        id: "livraison_express", 
        nom: "Livraison express", 
        tags: ["coursier", "moto", "rapide", "express", "livraison"] 
      }
    ]
  },
  {
    id: "technologie_numerique",
    nom: "TIC & Services numériques",
    icon: "💻",
    color: "from-cyan-500 to-blue-600",
    tags: ["technologie", "numérique", "informatique", "digital", "tech"],
    subcategories: [
      { 
        id: "developpeurs", 
        nom: "Développeurs & Freelance", 
        tags: ["site web", "app", "logiciel", "développeur", "programmeur"] 
      },
      { 
        id: "fai_telecom", 
        nom: "Fournisseurs Internet & Télécom", 
        tags: ["wifi", "fibre", "4G", "internet", "télécom"] 
      },
      { 
        id: "cybercafes", 
        nom: "Cybercafés", 
        tags: ["impression", "connexion", "photocopie", "cybercafé", "internet"] 
      },
      { 
        id: "paiement_mobile", 
        nom: "Services de paiement mobile", 
        tags: ["Airtel Money", "Moov Money", "transfert", "mobile money"] 
      },
      { 
        id: "reparation_tech", 
        nom: "Réparation tech", 
        tags: ["téléphone", "ordinateur", "réparation", "smartphone", "tech"] 
      }
    ]
  },
  {
    id: "education_formation",
    nom: "Éducation & Formation",
    icon: "📚",
    color: "from-indigo-500 to-blue-600",
    tags: ["éducation", "formation", "école", "cours", "enseignement"],
    subcategories: [
      { 
        id: "ecoles_primaires", 
        nom: "Écoles primaires & secondaires", 
        tags: ["école privée", "collège", "lycée", "primaire", "secondaire"] 
      },
      { 
        id: "universites", 
        nom: "Universités & Formations supérieures", 
        tags: ["fac", "institut", "études", "université", "supérieur"] 
      },
      { 
        id: "formation_pro", 
        nom: "Centres de formation professionnelle", 
        tags: ["couture", "mécanique", "informatique", "formation", "métier"] 
      },
      { 
        id: "cours_particuliers", 
        nom: "Cours particuliers", 
        tags: ["répétiteur", "soutien scolaire", "cours", "tutorat"] 
      }
    ]
  },
  {
    id: "agriculture_peche",
    nom: "Agriculture, Pêche & Élevage",
    icon: "🌱",
    color: "from-green-600 to-lime-600",
    tags: ["agriculture", "pêche", "élevage", "nature", "production"],
    subcategories: [
      { 
        id: "maraichage", 
        nom: "Maraîchage", 
        tags: ["légumes", "tomate", "oignon", "maraîchage", "potager"] 
      },
      { 
        id: "peche", 
        nom: "Pêche", 
        tags: ["poisson", "frais", "fumé", "pêcheur", "mer"] 
      },
      { 
        id: "elevage", 
        nom: "Élevage", 
        tags: ["poulet", "cabri", "bétail", "élevage", "animal"] 
      },
      { 
        id: "foret", 
        nom: "Exploitation forestière", 
        tags: ["bois", "charbon", "sciage", "forêt", "exploitation"] 
      }
    ]
  },
  {
    id: "btp_immobilier",
    nom: "BTP & Immobilier",
    icon: "🏗️",
    color: "from-gray-600 to-slate-700",
    tags: ["construction", "bâtiment", "immobilier", "travaux", "habitat"],
    subcategories: [
      { 
        id: "construction", 
        nom: "Entreprises de construction", 
        tags: ["immeuble", "bâtiment", "routes", "construction", "BTP"] 
      },
      { 
        id: "carreleurs_peintres", 
        nom: "Carreleurs & Peintres", 
        tags: ["peinture", "carrelage", "finition", "décoration"] 
      },
      { 
        id: "immobilier", 
        nom: "Vente & Location immobilière", 
        tags: ["maison", "appartement", "terrain", "immobilier", "location"] 
      }
    ]
  },
  {
    id: "professions_liberales",
    nom: "Institutions & Professions libérales",
    icon: "⚖️",
    color: "from-purple-600 to-indigo-700",
    tags: ["professionnel", "libéral", "juridique", "conseil", "expertise"],
    subcategories: [
      { 
        id: "juristes", 
        nom: "Juristes & Avocats", 
        tags: ["droit", "justice", "tribunal", "avocat", "juriste"] 
      },
      { 
        id: "notaires", 
        nom: "Notaires", 
        tags: ["actes", "contrats", "héritage", "notaire", "légal"] 
      },
      { 
        id: "comptables", 
        nom: "Comptables & Experts", 
        tags: ["fiscalité", "bilan", "impôts", "comptable", "finance"] 
      },
      { 
        id: "communication", 
        nom: "Agences de communication", 
        tags: ["publicité", "marketing", "logo", "communication", "design"] 
      }
    ]
  },
  {
    id: "finance_banque",
    nom: "Finance & Institutions",
    icon: "🏦",
    color: "from-emerald-500 to-teal-600",
    tags: ["finance", "banque", "argent", "crédit", "assurance"],
    subcategories: [
      { 
        id: "banques", 
        nom: "Banques", 
        tags: ["compte", "crédit", "épargne", "banque", "finance"] 
      },
      { 
        id: "microfinance", 
        nom: "Microfinances", 
        tags: ["microcrédit", "épargne", "microfinance", "coopérative"] 
      },
      { 
        id: "assurances", 
        nom: "Assurances", 
        tags: ["assurance", "protection", "garantie", "couverture"] 
      },
      { 
        id: "transfert_argent", 
        nom: "Transfert d'argent", 
        tags: ["Western Union", "MoneyGram", "transfert", "envoi"] 
      }
    ]
  },
  {
    id: "culture_loisirs",
    nom: "Culture, Loisirs & Tourisme",
    icon: "🎭",
    color: "from-violet-500 to-purple-600",
    tags: ["culture", "loisirs", "tourisme", "art", "divertissement"],
    subcategories: [
      { 
        id: "hotels", 
        nom: "Hôtels & Hébergements", 
        tags: ["hôtel", "hébergement", "tourisme", "chambre"] 
      },
      { 
        id: "agences_voyage", 
        nom: "Agences de voyage", 
        tags: ["voyage", "tourisme", "excursion", "agence"] 
      },
      { 
        id: "parcs_ecotourisme", 
        nom: "Parcs nationaux & Écotourisme", 
        tags: ["parc", "nature", "écotourisme", "safari", "environnement"] 
      },
      { 
        id: "artistes", 
        nom: "Artisans, Artistes, Musiciens", 
        tags: ["art", "musique", "artiste", "créateur", "culture"] 
      },
      { 
        id: "evenementiel", 
        nom: "Événementiel & Spectacles", 
        tags: ["événement", "spectacle", "mariage", "fête", "organisation"] 
      }
    ]
  }
];

// Fonction pour obtenir toutes les catégories avec leurs sous-catégories
export const getAllBusinessCategories = () => businessCategories;

// Fonction pour rechercher par tags
export const searchByTags = (searchTerm: string) => {
  const results: Array<{category: BusinessCategory, subcategory?: BusinessSubcategory, relevance: number}> = [];
  
  businessCategories.forEach(category => {
    // Recherche dans les tags de la catégorie
    const categoryMatch = category.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (categoryMatch) {
      results.push({ category, relevance: 100 });
    }
    
    // Recherche dans les sous-catégories
    category.subcategories.forEach(subcategory => {
      const subcategoryMatch = subcategory.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (subcategoryMatch) {
        results.push({ 
          category, 
          subcategory, 
          relevance: subcategoryMatch ? 90 : 70 
        });
      }
    });
  });
  
  return results.sort((a, b) => b.relevance - a.relevance);
};

// Fonction pour obtenir les catégories recommandées pour la création d'entreprise
export const getRecommendedCategories = () => {
  return businessCategories.map(cat => ({
    id: cat.id,
    name: cat.nom,
    icon: cat.icon,
    color: cat.color,
    count: cat.subcategories.length
  }));
};