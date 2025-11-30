# Plan de Migration vers Architecture Modulaire

## 🎯 Objectif
Transformer l'architecture actuelle en modules indépendants sans casser l'application existante.

## 📋 Étapes de Migration

### Phase 1: Préparation (1-2 jours)
1. **Créer la structure des modules** ✅
   - Dossiers `src/modules/`
   - Fichiers `index.ts` pour chaque module
   
2. **Analyser les dépendances actuelles**
   - Cartographier les imports/exports
   - Identifier les dépendances circulaires
   
3. **Définir les interfaces publiques**
   - Types communs dans `shared/types/`
   - Services interfaces dans `shared/services/`

### Phase 2: Migration Progressive (3-5 jours)

#### 2.1 Module Auth (Priorité 1)
- [ ] Déplacer `src/components/auth/` → `src/modules/auth/components/`
- [ ] Créer `src/modules/auth/hooks/useAuth.ts`
- [ ] Créer `src/modules/auth/types/auth.types.ts`
- [ ] Mettre à jour les imports dans l'app

#### 2.2 Module Profile (Priorité 1)
- [ ] Déplacer les composants profile
- [ ] Migrer `useProfileMode` et `useBusinessCreation`
- [ ] Créer les types profile

#### 2.3 Module Business (Priorité 2)
- [ ] Déplacer les composants business
- [ ] Migrer les hooks business
- [ ] Créer les services business

#### 2.4 Autres modules (Priorité 3)
- [ ] Catalog
- [ ] Messaging
- [ ] Location
- [ ] Commerce
- [ ] Search
- [ ] Advertising
- [ ] Reviews
- [ ] Booking

### Phase 3: Optimisation (2-3 jours)

#### 3.1 Code Splitting
```typescript
// Lazy loading des modules
const BusinessModule = lazy(() => import('@/modules/business'));
const CatalogModule = lazy(() => import('@/modules/catalog'));
```

#### 3.2 Services Centralisés
```typescript
// shared/services/apiClient.ts
export class ApiClient {
  // Interface unifiée pour tous les modules
}
```

#### 3.3 Event System
```typescript
// shared/events/eventBus.ts
export class EventBus {
  // Communication inter-modules
}
```

### Phase 4: Tests et Validation (1-2 jours)
- [ ] Tests unitaires par module
- [ ] Tests d'intégration
- [ ] Validation des performances
- [ ] Documentation mise à jour

## 🔄 Commandes de Migration

### Étape 1: Créer les dossiers
```bash
mkdir -p src/modules/{auth,profile,business,catalog,messaging,location,commerce,search,advertising,reviews,booking}/{components,hooks,services,types}
mkdir -p src/shared/{components,hooks,services,utils,types}
```

### Étape 2: Déplacer les fichiers (exemple auth)
```bash
# Auth components
mv src/components/auth/* src/modules/auth/components/
# Auth hooks  
mv src/hooks/use-auth* src/modules/auth/hooks/
```

### Étape 3: Mettre à jour les imports
```typescript
// Avant
import { LoginModal } from '@/components/auth/LoginModal';
// Après  
import { LoginModal } from '@/modules/auth';
```

## ⚠️ Points d'Attention

### Dépendances Circulaires
- Identifier avec: `madge --circular src/`
- Résoudre via interfaces dans `shared/`

### Import Paths
- Configurer les alias dans `tsconfig.json`
- Utiliser des imports absolus: `@/modules/auth`

### Performance
- Implémenter le lazy loading progressivement
- Surveiller la taille des bundles

### Tests
- Maintenir la couverture de tests existante
- Tester chaque module indépendamment

## 📈 Bénéfices Attendus

1. **Maintenabilité**: Code plus organisé et prévisible
2. **Réutilisabilité**: Modules réutilisables dans d'autres projets
3. **Performance**: Code splitting et lazy loading
4. **Équipe**: Travail parallèle sur différents modules
5. **Tests**: Tests plus ciblés et rapides
6. **Documentation**: Architecture auto-documentée

## 🎯 Success Metrics

- ✅ Aucune régression fonctionnelle
- ✅ Temps de build < temps actuel
- ✅ Bundle size par route optimisé
- ✅ 100% des tests passent
- ✅ Imports circulaires = 0