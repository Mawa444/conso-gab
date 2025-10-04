# 📋 CHECK-LIST DE CORRECTIONS - APPLICATION GABOMA

## 🎯 OBJECTIF
Atteindre 100% de production readiness avec une application robuste, fiable et aux normes professionnelles.

---

## 🚨 PHASE 1 - CORRECTIONS CRITIQUES (P0) - SEMAINE 1-2

### 1.1 Design System & Cohérence Visuelle ⚠️ CRITIQUE
**État actuel:** ❌ 33 couleurs hardcodées, incohérence visuelle
**Objectif:** ✅ Système de tokens HSL complet et cohérent

#### Actions:
- [ ] **1.1.1** Auditer toutes les couleurs hardcodées dans le projet
  - Fichiers à vérifier: tous les `.tsx` avec `#`, `rgb()`, ou couleurs directes
  - Créer un mapping des couleurs vers tokens sémantiques
  
- [ ] **1.1.2** Refondre `src/index.css` avec système HSL complet
  - Définir palette primaire/secondaire/accent en HSL
  - Créer tokens pour: success, warning, error, info
  - Définir gradients réutilisables
  - Ajouter tokens pour ombres et élévations
  
- [ ] **1.1.3** Mettre à jour `tailwind.config.ts`
  - Mapper tous les tokens CSS vers Tailwind
  - Assurer cohérence light/dark mode
  
- [ ] **1.1.4** Corriger les composants UI (shadcn)
  - `src/components/ui/button.tsx` - variants avec tokens
  - `src/components/ui/card.tsx` - suppression couleurs hardcodées
  - `src/components/ui/badge.tsx` - variantes sémantiques
  - Tous les autres composants ui/*
  
- [ ] **1.1.5** Corriger les composants métier
  - Priority 1: Header, BottomNavigation (toujours visibles)
  - Priority 2: Cards (CommerceCard, CatalogCard, etc.)
  - Priority 3: Modals et overlays
  - Priority 4: Formulaires et inputs

**Temps estimé:** 12h
**Impact:** 🔥 CRITIQUE - Affecte toute l'interface

---

### 1.2 Hiérarchie Z-Index ⚠️ CRITIQUE
**État actuel:** ❌ 21 valeurs arbitraires (z-[1200], z-[9999], etc.)
**Objectif:** ✅ Système cohérent et prévisible

#### Actions:
- [ ] **1.2.1** Définir échelle de z-index dans index.css
  ```css
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-notification: 1080;
  --z-fab: 1090;
  ```

- [ ] **1.2.2** Remplacer tous les z-index arbitraires
  - Fichiers concernés: Header, BottomNavigation, modals, tooltips
  - Utiliser les tokens définis
  
- [ ] **1.2.3** Tester toutes les superpositions
  - Modal + Dropdown
  - Tooltip + Modal
  - FAB + Bottom Navigation
  - Notifications + tout le reste

**Temps estimé:** 6h
**Impact:** 🔥 CRITIQUE - Évite les bugs d'affichage

---

### 1.3 Layout & Overflow ⚠️ CRITIQUE
**État actuel:** ❌ Éléments qui débordent, superpositions maladroites
**Objectif:** ✅ Layout robuste avec containment proper

#### Actions:
- [ ] **1.3.1** Créer `src/components/layout/PageLayout.tsx`
  - Container principal avec padding responsive
  - Max-width sur desktop
  - Safe areas pour mobile (notch, home indicator)
  - Overflow control
  
- [ ] **1.3.2** Créer `src/components/layout/ContentContainer.tsx`
  - Wrapper pour contenu avec spacing cohérent
  - Gestion des marges internes
  
- [ ] **1.3.3** Auditer tous les composants pour overflow
  - Images non contraintes
  - Textes longs sans ellipsis
  - Listes infinies sans virtualization
  
- [ ] **1.3.4** Corriger les pages problématiques
  - HomePage - hero section
  - MapPage - carte + overlays
  - ProductDetailPage - images et description
  - BusinessDashboardPage - tableaux
  
- [ ] **1.3.5** Ajouter safe-area-inset pour mobile
  - Bottom Navigation
  - Header
  - Modals et sheets

**Temps estimé:** 10h
**Impact:** 🔥 CRITIQUE - UX fondamentale

---

### 1.4 TypeScript Strict Mode 🔴 URGENT
**État actuel:** ❌ 52 usages de `any`, types faibles
**Objectif:** ✅ Types stricts partout

#### Actions:
- [ ] **1.4.1** Activer strict mode dans tsconfig.json
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true
    }
  }
  ```

- [ ] **1.4.2** Typer tous les hooks customs
  - `use-business-creation.ts`
  - `use-catalog-management.ts`
  - `use-product-management.ts`
  - Tous les autres hooks

- [ ] **1.4.3** Typer tous les services
  - `business.service.ts`
  - `catalog.service.ts`
  - Créer types d'erreur personnalisés

- [ ] **1.4.4** Typer les réponses Supabase
  - Utiliser les types générés
  - Créer types composites quand nécessaire

- [ ] **1.4.5** Éliminer tous les `any` explicites
  - Remplacer par `unknown` + type guards quand pertinent
  - Créer types précis sinon

**Temps estimé:** 14h
**Impact:** 🔴 URGENT - Fiabilité et maintenabilité

---

## 🟡 PHASE 2 - OPTIMISATIONS PERFORMANCE (P0) - SEMAINE 3

### 2.1 Optimisation Images 📸
**État actuel:** ❌ Images lourdes (3.2MB), pas de lazy loading
**Objectif:** ✅ Images optimisées < 200KB, lazy loading partout

#### Actions:
- [ ] **2.1.1** Optimiser images existantes
  - `src/assets/hero-marketplace.jpg` → WebP < 150KB
  - `src/assets/gaboma-logo.png` → SVG ou WebP < 50KB
  
- [ ] **2.1.2** Implémenter lazy loading systématique
  - Améliorer `src/components/performance/LazyImage.tsx`
  - Ajouter skeleton loading
  - Progressive image loading (blur-up)
  
- [ ] **2.1.3** Ajouter compression automatique
  - Hook pour upload d'images
  - Compression côté client avant upload
  - Génération de thumbnails
  
- [ ] **2.1.4** Implémenter srcset/picture pour responsive
  - Différentes tailles selon viewport
  - Art direction si nécessaire

**Temps estimé:** 8h
**Impact:** 🟡 Important - Performance perceived

---

### 2.2 Réduction Bundle Size 📦
**État actuel:** ❌ 280KB (objectif: <200KB)
**Objectif:** ✅ Bundle optimisé < 200KB

#### Actions:
- [ ] **2.2.1** Tree-shaking lucide-react
  - Importer uniquement icônes utilisées
  - Pas d'import `* as Icons`
  
- [ ] **2.2.2** Code splitting avancé
  - Lazy load toutes les routes
  - Lazy load components lourds (Map, Chart, etc.)
  
- [ ] **2.2.3** Analyser dépendances lourdes
  - `npm run build` avec analyzer
  - Identifier et remplacer libs lourdes
  
- [ ] **2.2.4** Configurer compression Vite
  - Brotli compression
  - Minification aggressive

**Temps estimé:** 6h
**Impact:** 🟡 Important - Performance loading

---

### 2.3 Database Indexes 🗄️
**État actuel:** ❌ Queries lentes, pas d'index sur colonnes critiques
**Objectif:** ✅ 6 index critiques ajoutés

#### Actions:
- [ ] **2.3.1** Créer migration pour indexes
  ```sql
  -- Index sur business_profiles
  CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
  CREATE INDEX idx_business_profiles_location ON business_profiles USING GIST(location);
  
  -- Index sur catalogs
  CREATE INDEX idx_catalogs_business_id ON catalogs(business_id);
  CREATE INDEX idx_catalogs_visibility ON catalogs(visibility, is_active);
  
  -- Index sur messages
  CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at DESC);
  
  -- Index sur favorites
  CREATE INDEX idx_favorites_user_id ON favorites(user_id);
  ```

- [ ] **2.3.2** Tester performance avant/après
  - Queries complexes
  - Liste de commerces
  - Recherche de produits

**Temps estimé:** 3h
**Impact:** 🟡 Important - Performance queries

---

## 🔵 PHASE 3 - SÉCURITÉ & RLS (P0) - SEMAINE 4

### 3.1 Complétion RLS Policies 🔐
**État actuel:** ❌ Tables sans RLS (order_items, attachments, media)
**Objectif:** ✅ 100% des tables avec RLS

#### Actions:
- [ ] **3.1.1** RLS pour order_items
  ```sql
  ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  -- Policies pour buyers et sellers
  ```

- [ ] **3.1.2** RLS pour attachments
  ```sql
  ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
  -- Policies basées sur conversation membership
  ```

- [ ] **3.1.3** RLS pour media
  ```sql
  ALTER TABLE media ENABLE ROW LEVEL SECURITY;
  -- Policies basées sur ownership et visibility
  ```

- [ ] **3.1.4** Audit complet de toutes les policies
  - Vérifier logique de chaque policy
  - Tester cas edge (deleted users, etc.)

**Temps estimé:** 8h
**Impact:** 🔵 Critique - Sécurité

---

### 3.2 Validation Zod Edge Functions 🛡️
**État actuel:** ❌ Edge functions sans validation
**Objectif:** ✅ Validation stricte sur toutes les entrées

#### Actions:
- [ ] **3.2.1** Ajouter Zod aux edge functions
  - `supabase/functions/send-message/index.ts`
  - `supabase/functions/create-order/index.ts`
  - Toutes les autres functions

- [ ] **3.2.2** Créer schémas de validation réutilisables
  - Messages
  - Orders
  - Reservations
  - Quotes

- [ ] **3.2.3** Gérer erreurs de validation proprement
  - Retourner erreurs claires
  - Logger tentatives invalides

**Temps estimé:** 6h
**Impact:** 🔵 Critique - Sécurité

---

## 🟢 PHASE 4 - MONITORING & ERREURS (P1) - SEMAINE 5

### 4.1 Sentry Integration 📊
**État actuel:** ❌ Pas de monitoring d'erreurs
**Objectif:** ✅ Sentry configuré et actif

#### Actions:
- [ ] **4.1.1** Installer et configurer Sentry
  ```bash
  npm install @sentry/react @sentry/vite-plugin
  ```

- [ ] **4.1.2** Configurer dans main.tsx
  - DSN Sentry
  - Environment (prod/staging)
  - Release tracking

- [ ] **4.1.3** Ajouter source maps
  - Configuration Vite
  - Upload automatique

- [ ] **4.1.4** Créer alerts
  - Erreurs critiques
  - Performance degradation

**Temps estimé:** 4h
**Impact:** 🟢 Important - Monitoring

---

### 4.2 Health Checks 💚
**État actuel:** ❌ Pas de health checks
**Objectif:** ✅ Endpoints de santé

#### Actions:
- [ ] **4.2.1** Créer edge function health
  - Check database connection
  - Check storage access
  - Return status JSON

- [ ] **4.2.2** Frontend health checks
  - API reachability
  - Critical features working

**Temps estimé:** 3h
**Impact:** 🟢 Important - Monitoring

---

## 🔷 PHASE 5 - TESTS & QUALITÉ (P1) - SEMAINE 6

### 5.1 Augmenter Couverture Tests 🧪
**État actuel:** ❌ 5% de couverture
**Objectif:** ✅ 60% minimum

#### Actions:
- [ ] **5.1.1** Tests des services
  - business.service.ts
  - catalog.service.ts
  - Autres services critiques

- [ ] **5.1.2** Tests des hooks customs
  - use-business-creation
  - use-catalog-management
  - use-product-management

- [ ] **5.1.3** Tests des composants critiques
  - Forms (SignupWizard, BusinessCreation, etc.)
  - Cards (CommerceCard, CatalogCard)
  - Modals

- [ ] **5.1.4** Tests d'intégration
  - Flux complet création business
  - Flux complet création catalog
  - Flux messaging

**Temps estimé:** 20h
**Impact:** 🔷 Important - Qualité

---

## 📚 PHASE 6 - DOCUMENTATION & LÉGAL (P0) - SEMAINE 7

### 6.1 Documentation Légale ⚖️
**État actuel:** ❌ Pas de documents légaux
**Objectif:** ✅ Tous les documents requis

#### Actions:
- [ ] **6.1.1** Politique de confidentialité
  - RGPD compliant
  - Données collectées
  - Usage des données
  - Droits des utilisateurs

- [ ] **6.1.2** Conditions d'utilisation
  - Droits et devoirs
  - Responsabilités
  - Limitations

- [ ] **6.1.3** Politique de cookies
  - Types de cookies
  - Consentement

- [ ] **6.1.4** Intégrer dans l'app
  - Pages dédiées
  - Liens dans footer
  - Consentement au signup

**Temps estimé:** 8h (avec aide juridique)
**Impact:** 🔵 Critique - Légal obligatoire

---

### 6.2 Documentation Technique 📖
**État actuel:** ⚠️ Documentation partielle
**Objectif:** ✅ Documentation complète

#### Actions:
- [ ] **6.2.1** README.md complet
  - Installation
  - Configuration
  - Développement
  - Déploiement

- [ ] **6.2.2** Documentation API
  - Endpoints edge functions
  - Paramètres et réponses
  - Exemples d'utilisation

- [ ] **6.2.3** Guide d'utilisation utilisateur
  - Tutoriels
  - FAQ
  - Troubleshooting

**Temps estimé:** 6h
**Impact:** 🟢 Important - Maintenabilité

---

## 📊 MÉTRIQUES DE SUCCÈS

### Performance
- ✅ Bundle size < 200KB
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Lighthouse Score > 90

### Qualité Code
- ✅ 0 erreurs TypeScript
- ✅ 0 usages de `any`
- ✅ Test coverage > 60%
- ✅ 0 couleurs hardcodées

### Sécurité
- ✅ 100% tables avec RLS
- ✅ Toutes edge functions validées
- ✅ Pas de failles XSS/injection
- ✅ Headers sécurité configurés

### UX/UI
- ✅ 0 éléments qui débordent
- ✅ Z-index cohérent
- ✅ Design system unifié
- ✅ Dark mode fonctionnel

### Production
- ✅ Monitoring actif (Sentry)
- ✅ Health checks opérationnels
- ✅ Documentation complète
- ✅ Légal en place

---

## 🎯 RÉSUMÉ TIMELINE

| Semaine | Phase | Effort | Priorité |
|---------|-------|--------|----------|
| 1-2 | Design System + Layout + TypeScript | 36h | 🔥 P0 |
| 3 | Performance (Images + Bundle + DB) | 17h | 🟡 P0 |
| 4 | Sécurité (RLS + Validation) | 14h | 🔵 P0 |
| 5 | Monitoring (Sentry + Health) | 7h | 🟢 P1 |
| 6 | Tests (60% coverage) | 20h | 🔷 P1 |
| 7 | Documentation + Légal | 14h | 🔵 P0 |

**TOTAL: 108 heures sur 7 semaines**

---

## ✅ CHECKLIST FINALE AVANT LANCEMENT

### Infrastructure
- [ ] Staging environment configuré
- [ ] CDN configuré (Cloudflare/Vercel)
- [ ] SSL/HTTPS actif
- [ ] Monitoring configuré
- [ ] Backups automatiques configurés

### Sécurité
- [ ] Toutes les RLS policies actives
- [ ] Validation sur toutes les entrées
- [ ] Rate limiting configuré
- [ ] CORS correctement configuré
- [ ] Headers sécurité (CSP, etc.)

### Performance
- [ ] Bundle < 200KB
- [ ] Images optimisées
- [ ] Lazy loading partout
- [ ] Indexes database
- [ ] Cache configuré

### Qualité
- [ ] 0 erreurs TypeScript
- [ ] Tests > 60%
- [ ] Pas de console.log en prod
- [ ] Error boundaries partout
- [ ] Loading states partout

### Légal & Documentation
- [ ] Privacy policy publiée
- [ ] Terms of service publiés
- [ ] Cookie policy publiée
- [ ] Documentation technique
- [ ] Guide utilisateur

### UX/UI
- [ ] Design system cohérent
- [ ] Pas d'overflow
- [ ] Z-index organisé
- [ ] Dark mode fonctionnel
- [ ] Responsive sur tous devices

---

## 🚀 VERDICT FINAL

**Score Production Readiness Actuel: 65%**

**Score Cible après corrections: 95%**

**Recommandation: GO pour BETA après Phase 1-4 (5 semaines)**

**GO pour PRODUCTION PUBLIQUE après Phase 1-7 (7 semaines)**
