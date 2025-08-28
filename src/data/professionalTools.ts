// Configuration des outils professionnels par catégorie

export interface ProfessionalTool {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: "action" | "analytics" | "management" | "communication";
  category: string[];
  premium?: boolean;
}

export interface CategoryConfig {
  id: string;
  name: string;
  defaultTools: string[];
  availableTools: string[];
  customSections: {
    catalog: string; // "menu", "produits", "services", "catalogue"
    pricing: string; // "tarifs", "prix", "devis", "promotions"
    booking: string; // "réservation", "rendez-vous", "commande", "contact"
  };
  analytics: {
    keyMetrics: string[];
    specialCharts: string[];
  };
}

export const professionalTools: ProfessionalTool[] = [
  // Outils de communication
  {
    id: "catalog",
    name: "Catalogue",
    icon: "📋",
    description: "Gérer vos produits/services",
    type: "management",
    category: ["all"]
  },
  {
    id: "menu",
    name: "Menu",
    icon: "🍽️",
    description: "Gérer votre carte/menu",
    type: "management",
    category: ["Restauration"]
  },
  {
    id: "services",
    name: "Services",
    icon: "🛠️",
    description: "Gérer vos prestations",
    type: "management",
    category: ["Services", "Beauté", "Santé", "Automobile"]
  },
  {
    id: "products",
    name: "Produits",
    icon: "📦",
    description: "Gérer votre inventaire",
    type: "management",
    category: ["Shopping", "Bricolage"]
  },
  {
    id: "appointments",
    name: "Rendez-vous",
    icon: "📅",
    description: "Planning et réservations",
    type: "management",
    category: ["Beauté", "Santé", "Services"]
  },
  {
    id: "orders",
    name: "Commandes",
    icon: "🛒",
    description: "Gestion des commandes",
    type: "management",
    category: ["Restauration", "Shopping"]
  },
  {
    id: "quotes",
    name: "Devis",
    icon: "📄",
    description: "Créer et gérer les devis",
    type: "management",
    category: ["Services", "Automobile", "Bricolage"]
  },
  {
    id: "promotions",
    name: "Promotions",
    icon: "🎯",
    description: "Campagnes et offres",
    type: "action",
    category: ["all"]
  },
  
  // Outils d'analytics
  {
    id: "visitor_analytics",
    name: "Analyses visiteurs",
    icon: "👥",
    description: "Statistiques de fréquentation",
    type: "analytics",
    category: ["all"]
  },
  {
    id: "sales_analytics",
    name: "Ventes",
    icon: "💰",
    description: "Performances commerciales",
    type: "analytics",
    category: ["all"]
  },
  {
    id: "geo_analytics",
    name: "Géolocalisation",
    icon: "🗺️",
    description: "Analyse géographique",
    type: "analytics",
    category: ["all"],
    premium: true
  },
  {
    id: "customer_insights",
    name: "Profil clients",
    icon: "🎯",
    description: "Comportements clients",
    type: "analytics",
    category: ["all"],
    premium: true
  },
  {
    id: "competition_analysis",
    name: "Concurrence",
    icon: "⚔️",
    description: "Analyse concurrentielle",
    type: "analytics",
    category: ["all"],
    premium: true
  },
  
  // Outils de communication
  {
    id: "messaging",
    name: "Messages",
    icon: "💬",
    description: "Chat avec les clients",
    type: "communication",
    category: ["all"]
  },
  {
    id: "reviews_management",
    name: "Avis clients",
    icon: "⭐",
    description: "Gestion des avis",
    type: "communication",
    category: ["all"]
  },
  {
    id: "social_media",
    name: "Réseaux sociaux",
    icon: "📱",
    description: "Gestion réseaux sociaux",
    type: "communication",
    category: ["all"],
    premium: true
  },
  
  // Outils d'action
  {
    id: "qr_generator",
    name: "QR Code",
    icon: "📱",
    description: "Générer vos QR codes",
    type: "action",
    category: ["all"]
  },
  {
    id: "loyalty_program",
    name: "Fidélité",
    icon: "🎁",
    description: "Programme de fidélité",
    type: "action",
    category: ["all"],
    premium: true
  },
  {
    id: "inventory",
    name: "Stock",
    icon: "📊",
    description: "Gestion des stocks",
    type: "management",
    category: ["Shopping", "Restauration", "Bricolage"]
  }
];

export const categoryConfigs: CategoryConfig[] = [
  {
    id: "Restauration",
    name: "Restauration",
    defaultTools: ["menu", "orders", "visitor_analytics", "messaging", "promotions"],
    availableTools: ["menu", "orders", "visitor_analytics", "sales_analytics", "geo_analytics", "messaging", "reviews_management", "promotions", "qr_generator", "loyalty_program", "inventory"],
    customSections: {
      catalog: "Catalogues",
      pricing: "tarifs", 
      booking: "commande"
    },
    analytics: {
      keyMetrics: ["commandes", "revenus", "clients_fideles", "plat_populaire"],
      specialCharts: ["affluence_horaire", "commandes_semaine", "revenus_mensuel"]
    }
  },
  {
    id: "Beauté",
    name: "Beauté & Bien-être",
    defaultTools: ["services", "appointments", "visitor_analytics", "messaging", "promotions"],
    availableTools: ["services", "appointments", "visitor_analytics", "sales_analytics", "customer_insights", "messaging", "reviews_management", "promotions", "loyalty_program"],
    customSections: {
      catalog: "Catalogues",
      pricing: "tarifs",
      booking: "rendez-vous"
    },
    analytics: {
      keyMetrics: ["rdv_pris", "taux_satisfaction", "clients_reguliers", "service_populaire"],
      specialCharts: ["rdv_semaine", "satisfaction_temps", "retention_client"]
    }
  },
  {
    id: "Automobile",
    name: "Automobile",
    defaultTools: ["services", "quotes", "visitor_analytics", "messaging", "appointments"],
    availableTools: ["services", "quotes", "appointments", "visitor_analytics", "sales_analytics", "messaging", "reviews_management", "inventory"],
    customSections: {
      catalog: "Catalogues",
      pricing: "devis",
      booking: "rendez-vous"
    },
    analytics: {
      keyMetrics: ["devis_demandes", "reparations", "satisfaction", "delai_moyen"],
      specialCharts: ["devis_mois", "type_reparation", "satisfaction_service"]
    }
  },
  {
    id: "Santé",
    name: "Santé",
    defaultTools: ["services", "appointments", "visitor_analytics", "messaging"],
    availableTools: ["services", "appointments", "visitor_analytics", "customer_insights", "messaging", "reviews_management"],
    customSections: {
      catalog: "Catalogues",
      pricing: "tarifs",
      booking: "rendez-vous"
    },
    analytics: {
      keyMetrics: ["consultations", "patients", "taux_rdv", "satisfaction"],
      specialCharts: ["rdv_semaine", "patients_mois", "services_demandes"]
    }
  },
  {
    id: "Shopping",
    name: "Shopping",
    defaultTools: ["products", "inventory", "visitor_analytics", "messaging", "promotions"],
    availableTools: ["products", "inventory", "orders", "visitor_analytics", "sales_analytics", "geo_analytics", "messaging", "reviews_management", "promotions", "loyalty_program"],
    customSections: {
      catalog: "Catalogues",
      pricing: "prix",
      booking: "commande"
    },
    analytics: {
      keyMetrics: ["ventes", "produits_stock", "clients", "panier_moyen"],
      specialCharts: ["ventes_jour", "produits_populaires", "stock_alerte"]
    }
  },
  {
    id: "Services",
    name: "Services",
    defaultTools: ["services", "quotes", "visitor_analytics", "messaging", "appointments"],
    availableTools: ["services", "quotes", "appointments", "visitor_analytics", "sales_analytics", "customer_insights", "messaging", "reviews_management", "promotions"],
    customSections: {
      catalog: "Catalogues",
      pricing: "devis",
      booking: "contact"
    },
    analytics: {
      keyMetrics: ["devis", "contrats", "satisfaction", "revenue"],
      specialCharts: ["devis_mois", "services_demandes", "client_acquisition"]
    }
  },
  {
    id: "Bricolage",
    name: "Bricolage",
    defaultTools: ["products", "inventory", "quotes", "visitor_analytics", "messaging"],
    availableTools: ["products", "inventory", "quotes", "visitor_analytics", "sales_analytics", "messaging", "reviews_management"],
    customSections: {
      catalog: "Catalogues",
      pricing: "prix",
      booking: "devis"
    },
    analytics: {
      keyMetrics: ["ventes", "stock", "devis", "categories_pop"],
      specialCharts: ["ventes_saison", "stock_rotation", "devis_conversion"]
    }
  }
];

export const getToolsForCategory = (categoryId: string): ProfessionalTool[] => {
  return professionalTools.filter(tool => 
    tool.category.includes(categoryId) || tool.category.includes("all")
  );
};

export const getCategoryConfig = (categoryId: string): CategoryConfig | null => {
  return categoryConfigs.find(config => config.id === categoryId) || null;
};

export const getDefaultToolsForCategory = (categoryId: string): ProfessionalTool[] => {
  const config = getCategoryConfig(categoryId);
  if (!config) return [];
  
  return professionalTools.filter(tool => 
    config.defaultTools.includes(tool.id)
  );
};