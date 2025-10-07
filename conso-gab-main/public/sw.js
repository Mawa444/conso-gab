// Service Worker pour ConsoGab PWA
// Version: 2.0.0 - Amélioration du caching et de l'activation

const VERSION = "2.0.0"; // Nouvelle version
const APP_CACHE_PREFIX = "consogab";

// Noms de cache clairs
const STATIC_CACHE_NAME = `${APP_CACHE_PREFIX}-static-${VERSION}`;
const DYNAMIC_CACHE_NAME = `${APP_CACHE_PREFIX}-dynamic-${VERSION}`; // Cache général pour les assets
const API_CACHE_NAME = `${APP_CACHE_PREFIX}-api-${VERSION}`; // Cache pour les données API

// Liste des noms de cache pour l'activation
const ALL_CACHE_NAMES = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME];

// Ressources statiques critiques (App Shell)
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  // ... autres fichiers critiques
];

// API endpoints pour la stratégie Stale While Revalidate (SWR)
const API_ENDPOINTS_SWR = [
  "/rest/v1/business_profiles",
  "/rest/v1/catalogs",
  // Les profils utilisateurs (user_profiles) sont souvent plus dynamiques,
  // donc ils sont passés en Network First (par défaut pour l'API)
];

// URLs des Fonts externes (à séparer des assets internes pour une meilleure gestion d'erreur)
const EXTERNAL_FONTS = [
  "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Lalezar&display=swap",
];
