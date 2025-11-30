# Système de Géolocalisation Ultra-Intelligent

## Vue d'ensemble

Ce système de géolocalisation est conçu pour être **autonome**, **robuste** et **ultra-réactif**. Il s'adapte automatiquement à la position de l'utilisateur et propose des recommandations intelligentes basées sur la proximité.

## Architecture

### 1. Contexte Global : `GeoLocationContext`

Le contexte centralise la gestion de la position de l'utilisateur dans toute l'application.

**Fichier :** `src/contexts/GeoLocationContext.tsx`

**Fonctionnalités :**
- Tracking en temps réel de la position
- Mise à jour automatique lors des déplacements (>50m)
- Gestion des permissions et erreurs
- Position par défaut : Libreville (0.4162, 9.4673)

**Utilisation :**
```tsx
import { useGeoLocationContext } from '@/contexts/GeoLocationContext';

const MyComponent = () => {
  const { position, loading, error, startTracking } = useGeoLocationContext();
  
  // position contient : { latitude, longitude, accuracy, timestamp }
};
```

### 2. Service de Géolocalisation : `GeoLocationService`

Le service contient toute la logique métier de géolocalisation.

**Fichier :** `src/services/geoLocationService.ts`

**Fonctionnalités :**
- **Élargissement automatique du rayon** : Commence à 2km, élargit progressivement jusqu'à 50km
- **Calcul de distance** : Formule de Haversine pour une précision maximale
- **Tri par proximité** : Les résultats les plus proches en premier
- **Formatage intelligent** : "50 m" ou "2.3 km"

**Méthodes principales :**
```tsx
// Récupérer les entreprises les plus proches
GeoLocationService.getNearestBusinesses(position, {
  initialRadius: 2,    // Rayon initial en km
  maxRadius: 50,       // Rayon maximum en km
  minResults: 5,       // Minimum de résultats souhaités
  limit: 50           // Limite totale
});

// Récupérer les catalogues géolocalisés
GeoLocationService.getNearestCatalogs(position, options);

// Filtrer des items par distance
GeoLocationService.filterByDistance(items, position, radiusKm);

// Calculer la distance entre deux points
GeoLocationService.calculateDistance(lat1, lon1, lat2, lon2);
```

### 3. Hook de Recommandations : `useGeoRecommendations`

Hook React qui combine le contexte et le service pour fournir des recommandations en temps réel.

**Fichier :** `src/hooks/use-geo-recommendations.ts`

**Fonctionnalités :**
- Mise à jour automatique quand l'utilisateur se déplace
- Récupération parallèle des entreprises et catalogues
- Rafraîchissement manuel possible
- Gestion du chargement et des erreurs

**Utilisation :**
```tsx
import { useGeoRecommendations } from '@/hooks/use-geo-recommendations';

const MyComponent = () => {
  const {
    businesses,      // Entreprises géolocalisées
    catalogs,        // Catalogues géolocalisés
    loading,         // État de chargement
    error,           // Erreur éventuelle
    refresh,         // Fonction pour rafraîchir
    currentPosition  // Position actuelle
  } = useGeoRecommendations({
    initialRadius: 2,
    maxRadius: 50,
    minResults: 5,
    autoRefresh: true
  });
};
```

## Fonctionnement du Système

### 1. Initialisation

Au démarrage de l'application :
1. Le `GeoLocationProvider` demande la permission de géolocalisation
2. Si refusée : position par défaut sur Libreville
3. Si acceptée : récupère la position réelle

### 2. Tracking en Temps Réel

Le système surveille les déplacements :
- Mise à jour uniquement si déplacement > 50m (évite les micro-actualisations)
- Utilise `watchPosition` du navigateur
- Consommation optimisée de la batterie

### 3. Recherche Intelligente

Quand l'utilisateur consulte des recommandations :

```
1. Recherche dans un rayon de 2km
   ↓
2. Résultats trouvés ?
   ├─ OUI (≥5) → Afficher
   └─ NON → Élargir à 4km
      ↓
3. Résultats trouvés ?
   ├─ OUI (≥5) → Afficher
   └─ NON → Élargir à 8km
      ↓
... jusqu'à 50km maximum
```

### 4. Tri et Affichage

Les résultats sont :
1. Triés par distance (plus proche en premier)
2. Formatés avec la distance ("500 m" ou "2.3 km")
3. Enrichis avec les informations business

## Intégration dans l'Application

### Page d'Accueil (`HomePage.tsx`)

```tsx
const {
  businesses,
  loading,
  refresh
} = useGeoRecommendations({
  initialRadius: 2,
  maxRadius: 50,
  minResults: 5,
  autoRefresh: true
});
```

Affiche automatiquement :
- Les entreprises les plus proches
- La distance de chaque entreprise
- Badge de vérification
- Mise à jour automatique lors des déplacements

### Page Carte (`MapPage.tsx`)

Utilise le contexte pour :
- Centrer la carte sur la position de l'utilisateur
- Charger les entreprises dans la zone visible
- Mettre à jour lors du déplacement de la carte

### Liste de Commerces (`CommerceListTab.tsx`)

Affiche les entreprises géolocalisées sous forme de liste avec :
- Distance affichée pour chaque commerce
- Indicateur de position de l'utilisateur
- Bouton de rafraîchissement

## Base de Données

### Tables Utilisées

**`business_profiles`**
- `latitude` : Latitude de l'entreprise (NUMERIC)
- `longitude` : Longitude de l'entreprise (NUMERIC)
- `location` : Point géographique (GEOGRAPHY, PostGIS)

### Fonctions RPC Supabase

**`get_nearest_businesses`**
```sql
get_nearest_businesses(
  user_lat: double precision,
  user_lng: double precision,
  radius_meters: integer,
  limit_count: integer
) RETURNS TABLE(...)
```

Retourne les entreprises dans un rayon donné avec :
- Distance calculée par PostGIS (ST_Distance)
- Tri par distance croissante
- Filtres : is_active, is_sleeping, is_deactivated

## Comportements Spécifiques

### Scénario 1 : Utilisateur à Nzeng-Ayong
1. Position détectée : (0.4162, 9.4673)
2. Recherche des entreprises dans 2km
3. Si 0 résultat → élargit à 4km
4. Continue jusqu'à trouver des résultats
5. Affiche toujours quelque chose (jamais de page vide)

### Scénario 2 : Déplacement vers PK5
1. Détection du déplacement (>50m)
2. Nouvelle position : (0.4000, 9.4500)
3. Rafraîchissement automatique des recommandations
4. Nouvelle recherche dans 2km autour de PK5
5. Mise à jour instantanée de l'affichage

### Scénario 3 : Voisin avec un Catalogue
Si un voisin crée un catalogue à 100m :
1. À la prochaine actualisation, il apparaît en premier
2. Distance affichée : "100 m"
3. Badge "Le plus proche" (optionnel)

## Optimisations

1. **Debouncing** : Évite les requêtes trop fréquentes lors des mouvements
2. **Cache** : Position mise en cache (maximumAge: 30s)
3. **Parallélisation** : Entreprises et catalogues récupérés simultanément
4. **Lazy Loading** : Chargement progressif des résultats
5. **Requêtes optimisées** : Utilise les index spatiaux PostGIS

## Configuration

### Modifier les Paramètres par Défaut

Dans `src/services/geoLocationService.ts` :
```tsx
const DEFAULT_OPTIONS = {
  initialRadius: 2,    // Rayon initial (km)
  maxRadius: 50,       // Rayon maximum (km)
  minResults: 5,       // Résultats minimum
  limit: 50           // Limite totale
};
```

### Ajuster la Sensibilité de Tracking

Dans `src/contexts/GeoLocationContext.tsx` :
```tsx
// Mise à jour si déplacement > 50m
if (distance > 0.05) { // 0.05 km = 50m
  setPosition(newPosition);
}
```

## Maintenance

### Ajouter un Nouveau Type de Contenu Géolocalisé

1. Créer une méthode dans `GeoLocationService` :
```tsx
static async getNearestAnnonces(position, options) {
  // Logique similaire à getNearestBusinesses
}
```

2. Mettre à jour `useGeoRecommendations` :
```tsx
const [annonces, setAnnonces] = useState([]);
// Ajouter la récupération dans fetchRecommendations
```

### Déboguer les Problèmes de Géolocalisation

1. Vérifier les permissions dans le navigateur
2. Consulter la console pour les erreurs PostGIS
3. Vérifier que les entreprises ont bien latitude/longitude
4. Tester avec la position par défaut (Libreville)

## Tests

### Tester Manuellement

1. Accepter/refuser la géolocalisation
2. Se déplacer (simuler avec les DevTools Chrome)
3. Vérifier les résultats affichés
4. Tester le rafraîchissement manuel

### Points de Vérification

- [ ] Position demandée au chargement
- [ ] Position par défaut si refus
- [ ] Mise à jour lors des déplacements
- [ ] Résultats triés par distance
- [ ] Distances correctement calculées
- [ ] Élargissement automatique du rayon
- [ ] Jamais de page vide

## Conclusion

Ce système de géolocalisation est conçu pour être :
- **Autonome** : Fonctionne sans intervention manuelle
- **Robuste** : Gère tous les cas d'erreur
- **Intelligent** : S'adapte automatiquement
- **Performant** : Optimisé pour la rapidité
- **Réactif** : Mise à jour en temps réel

Il constitue le cœur de l'application et assure que chaque utilisateur voit toujours les contenus les plus pertinents par rapport à sa position.
