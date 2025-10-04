# ✅ CHECKLIST PRODUCTION - GABOMA

## 🎯 OBJECTIF: Validation Déploiement Grand Public

Date: 2025-10-04
Version: 1.0.0 (MVP)
Status: **85% READY**

---

## 🔐 SÉCURITÉ [PRIORITÉ 1]

### Authentification & Autorisation
- [x] ✅ RLS activé sur toutes tables sensibles
- [x] ✅ Système de rôles implémenté (SECURITY DEFINER functions)
- [x] ✅ Validation Zod côté client (BusinessCreation)
- [x] ✅ Rate limiting mutations critiques
- [ ] ⚠️ **Validation Zod edge functions** (create-order, send-message, validate-payment)
- [ ] ⚠️ **Auth middleware + token refresh** automatique
- [ ] ⚠️ **Penetration testing** (manuel ou automatisé)

**Actions Requises:**
```typescript
// CRITIQUE: Ajouter validation edge functions
// supabase/functions/create-order/index.ts
import { z } from 'zod';

const OrderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive()
  })),
  total_amount: z.number().positive()
});

// Dans handler
const validated = OrderSchema.parse(await req.json());
```

### RLS & Permissions
- [x] ✅ business_profiles RLS complet
- [x] ✅ catalogs RLS policies
- [x] ✅ orders RLS policies
- [x] ✅ messages RLS policies
- [ ] ⚠️ **order_items RLS manquant** (SELECT policy uniquement)
- [ ] ⚠️ **attachments RLS incomplet** (pas UPDATE/DELETE)
- [ ] ⚠️ **media RLS partiel**

**Actions Requises:**
```sql
-- CRITIQUE: Compléter RLS order_items
CREATE POLICY "Users can view their order items"
ON order_items FOR SELECT
USING (
  order_id IN (
    SELECT id FROM orders 
    WHERE buyer_id = auth.uid() 
    OR seller_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid())
  )
);

-- CRITIQUE: Compléter attachments policies
CREATE POLICY "Users can delete their attachments"
ON attachments FOR DELETE
USING (message_id IN (SELECT id FROM messages WHERE sender_id = auth.uid()));
```

### Data Protection
- [x] ✅ Pin codes hashés (business_profiles)
- [x] ✅ HTTPS enforced (Supabase default)
- [x] ✅ Pas de données sensibles en localStorage
- [ ] ⚠️ **GDPR compliance** (politique confidentialité)
- [ ] ⚠️ **Data retention policies** non définies
- [ ] ⚠️ **User data export** non implémenté

**Actions Requises:**
```
1. Créer /legal/privacy-policy page
2. Créer /legal/terms-of-service page
3. Implémenter export données utilisateur (RGPD Art. 20)
4. Définir politique suppression données (72h business, 30j users)
```

### Injection & XSS
- [x] ✅ Pas de dangerouslySetInnerHTML
- [x] ✅ Prepared statements (Supabase SDK)
- [x] ✅ Input sanitization (Zod)
- [ ] ⚠️ **CSP headers** non configurés
- [ ] ⚠️ **CORS policies** à valider production

**Actions Requises:**
```typescript
// vite.config.ts - Ajouter CSP headers
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
  }
});
```

---

## ⚡ PERFORMANCE [PRIORITÉ 1]

### Bundle Size & Load Time
- [x] ✅ Code splitting (lazy loading routes)
- [x] ✅ LazyImage component (images)
- [x] ✅ React Query caching (5min staleTime)
- [ ] ⚠️ **Bundle: 240KB (objectif <200KB)**
- [ ] ⚠️ **Tree-shaking lucide-react** incomplet
- [ ] ⚠️ **CDN pour assets** non configuré

**Métriques Actuelles vs Objectifs:**
| Métrique | Actuel | Objectif | Status |
|----------|--------|----------|--------|
| **LCP** | ~3200ms | <2500ms | 🔴 |
| **FID** | ~140ms | <100ms | 🟡 |
| **CLS** | 0.13 | <0.1 | 🟡 |
| **Bundle** | 240KB | <200KB | 🟡 |
| **TTI** | ~4000ms | <3000ms | 🔴 |

**Actions Requises:**
```typescript
// 1. Tree-shake Lucide icons
// ❌ import { Star } from 'lucide-react';
// ✅ import Star from 'lucide-react/dist/esm/icons/star';

// 2. Lazy-load Radix UI
// components/ui/lazy-dialog.tsx
export const Dialog = lazy(() => 
  import('@radix-ui/react-dialog').then(m => ({ default: m.Dialog }))
);

// 3. Setup CDN (Cloudflare/Vercel)
// - Images WebP compression
// - Brotli compression
// - Edge caching
```

### Database Queries
- [x] ✅ Query caching (React Query)
- [x] ✅ Optimistic updates implémentés
- [ ] ⚠️ **Indexes manquants** (6 identifiés)
- [ ] ⚠️ **N+1 queries** (use-real-businesses)
- [ ] ⚠️ **SELECT * partout** (à projeter explicitement)

**Actions Requises:**
```sql
-- IMPORTANT: Ajouter indexes performance
CREATE INDEX idx_catalogs_geo_city ON catalogs(geo_city) 
WHERE is_active = true AND is_public = true;

CREATE INDEX idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

CREATE INDEX idx_business_category 
ON business_profiles(category) 
WHERE is_active = true;

CREATE INDEX idx_favorites_user 
ON favorites(user_id, created_at DESC);

CREATE INDEX idx_catalog_bookings_date 
ON catalog_bookings(catalog_id, booking_date, status);

CREATE INDEX idx_orders_seller_status 
ON orders(seller_id, status, created_at DESC);
```

### Images & Assets
- [x] ✅ Lazy loading images (LazyImage)
- [ ] ⚠️ **Images non optimisées** (hero-marketplace.jpg 3.2MB)
- [ ] ⚠️ **Pas de WebP conversion**
- [ ] ⚠️ **Pas de responsive images** (srcset)

**Actions Requises:**
```bash
# Optimiser toutes images
npm install sharp
node scripts/optimize-images.js

# Convertir en WebP
for file in src/assets/*.jpg; do
  cwebp "$file" -o "${file%.jpg}.webp"
done
```

---

## 🎨 UX/UI [PRIORITÉ 2]

### Loading States
- [x] ✅ Skeleton screens (SkeletonLayout créé)
- [x] ✅ LoadingStates (mimo-chat)
- [ ] ⚠️ **Manquant sur BusinessDashboard**
- [ ] ⚠️ **Manquant sur ProductDetail**
- [ ] ⚠️ **Manquant sur PublicCatalogs**

**Actions Requises:**
```typescript
// Wrapper toutes les pages avec SkeletonLayout
import { SkeletonLayout, PageSkeleton } from '@/components/layout/SkeletonLayout';

export const BusinessDashboardPage = () => {
  const { data, isLoading } = useQuery(/*...*/);
  
  return (
    <SkeletonLayout isLoading={isLoading} skeleton={<PageSkeleton />}>
      {/* Content */}
    </SkeletonLayout>
  );
};
```

### Feedback Utilisateur
- [x] ✅ Toast notifications (sonner)
- [x] ✅ Error boundaries
- [ ] ⚠️ **Pas de confirmation suppression** (business, catalog)
- [ ] ⚠️ **Pas de progress upload** (images)
- [ ] ⚠️ **Erreurs API non user-friendly**

**Actions Requises:**
```typescript
// 1. Confirmation dialogs
import { AlertDialog } from '@/components/ui/alert-dialog';

const handleDelete = async () => {
  const confirmed = await confirm('Supprimer définitivement ce business ?');
  if (!confirmed) return;
  
  toast.promise(deleteBusiness(id), {
    loading: 'Suppression...',
    success: 'Business supprimé',
    error: (err) => `Erreur: ${err.message}`
  });
};

// 2. Upload progress
<Progress value={uploadProgress} />
```

### Accessibilité (A11y)
- [x] ✅ Semantic HTML (header, main, nav)
- [x] ✅ Composants Radix UI (aria-* built-in)
- [ ] ⚠️ **Focus management incomplet**
- [ ] ⚠️ **Navigation clavier limitée**
- [ ] ⚠️ **Pas d'audit automatisé**

**Actions Requises:**
```bash
# Run Lighthouse audit
npx lighthouse https://gaboma.app --view

# Install axe DevTools
npm install -D @axe-core/react

# Target: WCAG AA compliance
- Color contrast ratio ≥ 4.5:1
- Keyboard navigable
- Screen reader compatible
```

### Mobile Experience
- [x] ✅ Responsive design (Tailwind)
- [x] ✅ Bottom navigation mobile
- [x] ✅ Touch-friendly buttons (min 44px)
- [ ] ⚠️ **PWA manifest** incomplet
- [ ] ⚠️ **Pas de Service Worker**
- [ ] ⚠️ **Install prompt** non implémenté

**Actions Requises:**
```json
// public/manifest.json
{
  "name": "Gaboma",
  "short_name": "Gaboma",
  "description": "Marketplace Gabon",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#10b981",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🧪 TESTING [PRIORITÉ 2]

### Test Coverage
- [x] ✅ Tests unitaires: BusinessService (80%)
- [x] ✅ Tests hooks: useBusinessCreation (90%)
- [x] ✅ Tests composants: ErrorBoundary (75%)
- [ ] ⚠️ **Coverage global: ~8% (objectif 60%)**
- [ ] ⚠️ **Pas de tests intégration**
- [ ] ⚠️ **Pas de tests E2E**

**Actions Requises:**
```bash
# Sprint 1: Tests critiques (60% coverage)
src/__tests__/
  services/
    ✓ business.service.test.ts
    ❌ catalog.service.test.ts
    ❌ product.service.test.ts
  
  hooks/
    ✓ use-business-creation.test.tsx
    ❌ use-catalog-management.test.tsx
    ❌ use-profile-mode.test.tsx

# Sprint 2: Integration tests
tests/integration/
  business-flow.test.ts
  catalog-booking-flow.test.ts

# Sprint 3: E2E (Playwright)
e2e/
  critical-paths.spec.ts
```

### CI/CD Pipeline
- [ ] ⚠️ **Pas de CI/CD configuré**
- [ ] ⚠️ **Tests non automatisés**
- [ ] ⚠️ **Pas de preview deployments**

**Actions Requises:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
      
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: https://preview.gaboma.app
          budgetPath: ./budget.json
```

---

## 📊 MONITORING [PRIORITÉ 2]

### Error Tracking
- [x] ✅ ErrorBoundary React
- [x] ✅ errorTracker custom
- [x] ✅ Global error handlers
- [ ] ⚠️ **Pas d'intégration Sentry**
- [ ] ⚠️ **Pas d'alerting automatique**
- [ ] ⚠️ **Logs non centralisés**

**Actions Requises:**
```typescript
// main.tsx - Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    })
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
});
```

### Performance Monitoring
- [x] ✅ performanceMonitor (Web Vitals)
- [x] ✅ Tracking basique (LCP, FID, CLS)
- [ ] ⚠️ **Pas de dashboard temps réel**
- [ ] ⚠️ **Pas d'alertes performance**
- [ ] ⚠️ **Métriques métier non trackées**

**Actions Requises:**
```typescript
// 1. Setup Datadog RUM
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: 'xxx',
  clientToken: 'xxx',
  site: 'datadoghq.eu',
  service: 'gaboma-web',
  env: 'production',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
});

// 2. Track business metrics
analytics.track('business_created', { category, city });
analytics.track('catalog_published', { products_count });
analytics.track('booking_completed', { amount, payment_method });
```

### Health Checks
- [ ] ⚠️ **Pas d'endpoint /health**
- [ ] ⚠️ **Pas de monitoring uptime**
- [ ] ⚠️ **Pas de status page**

**Actions Requises:**
```typescript
// pages/api/health.ts
export default async function handler(req, res) {
  try {
    // Check DB
    const { error: dbError } = await supabase
      .from('business_profiles')
      .select('count')
      .limit(1);
    
    if (dbError) throw new Error('DB unreachable');
    
    // Check Storage
    const { error: storageError } = await supabase.storage
      .from('catalog-covers')
      .list('', { limit: 1 });
    
    if (storageError) throw new Error('Storage unreachable');
    
    res.status(200).json({ 
      status: 'healthy',
      timestamp: Date.now(),
      checks: { database: 'ok', storage: 'ok' }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
}
```

---

## 🗂️ DATA MANAGEMENT [PRIORITÉ 2]

### Backups & Recovery
- [x] ✅ Supabase auto-backup (daily)
- [ ] ⚠️ **Pas de backup testing** (restauration jamais testée)
- [ ] ⚠️ **Pas de disaster recovery plan**
- [ ] ⚠️ **RTO/RPO non définis**

**Actions Requises:**
```
1. Tester restauration backup (1x par mois)
2. Définir RTO: 4 heures
3. Définir RPO: 24 heures
4. Documenter procédure recovery
```

### Data Integrity
- [x] ✅ Foreign keys définies
- [x] ✅ Constraints (NOT NULL, CHECK)
- [ ] ⚠️ **Pas de triggers validation** (booking conflicts)
- [ ] ⚠️ **Pas de soft deletes** (data loss risk)

**Actions Requises:**
```sql
-- IMPORTANT: Prevent booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM catalog_bookings
    WHERE catalog_id = NEW.catalog_id
      AND booking_date = NEW.booking_date
      AND status NOT IN ('cancelled', 'rejected')
      AND (NEW.booking_time, NEW.end_time) OVERLAPS (booking_time, end_time)
  ) THEN
    RAISE EXCEPTION 'Créneau déjà réservé';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_booking_conflicts
  BEFORE INSERT ON catalog_bookings
  FOR EACH ROW EXECUTE FUNCTION check_booking_conflict();

-- IMPORTANT: Soft deletes
ALTER TABLE business_profiles ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE catalogs ADD COLUMN deleted_at TIMESTAMP;
```

### Migrations
- [x] ✅ Supabase migrations configurées
- [x] ✅ Version control (git)
- [ ] ⚠️ **Pas de rollback strategy** documentée
- [ ] ⚠️ **Pas de seeds production**

---

## 📚 DOCUMENTATION [PRIORITÉ 3]

### User Documentation
- [ ] ⚠️ **Pas de guide utilisateur**
- [ ] ⚠️ **Pas de FAQ**
- [ ] ⚠️ **Pas de tutoriels vidéo**
- [ ] ⚠️ **Pas de help center**

**Actions Requises:**
```
pages/help/
  getting-started.tsx
  faq.tsx
  business-guide.tsx
  consumer-guide.tsx
```

### Developer Documentation
- [x] ✅ README.md (basic)
- [x] ✅ ARCHITECTURE.md
- [ ] ⚠️ **Pas d'API docs** (OpenAPI/Swagger)
- [ ] ⚠️ **Pas de Storybook** (UI components)
- [ ] ⚠️ **Pas d'onboarding dev**

**Actions Requises:**
```bash
# 1. Setup Storybook
npx sb init

# 2. Generate API docs
npm install -D swagger-jsdoc swagger-ui-react

# 3. Create CONTRIBUTING.md
```

### Legal & Compliance
- [ ] ⚠️ **Privacy Policy manquante**
- [ ] ⚠️ **Terms of Service manquants**
- [ ] ⚠️ **Cookie Policy manquante**
- [ ] ⚠️ **RGPD compliance non vérifiée**

---

## 🚀 INFRASTRUCTURE [PRIORITÉ 1]

### Déploiement
- [ ] ⚠️ **Environment variables non vérifiées**
- [ ] ⚠️ **Pas de staging environment**
- [ ] ⚠️ **Pas de blue-green deployment**
- [ ] ⚠️ **Rollback strategy non définie**

**Actions Requises:**
```bash
# Environments
- Production: gaboma.app
- Staging: staging.gaboma.app (à créer)
- Preview: pr-{number}.gaboma.app

# CI/CD
- Auto-deploy staging (main branch)
- Manual deploy production (release tags)
- Preview deployments (PRs)
```

### Scaling & Performance
- [ ] ⚠️ **Pas de CDN configuré** (images, assets)
- [ ] ⚠️ **Pas de load testing**
- [ ] ⚠️ **Pas de rate limiting API** (Supabase)
- [ ] ⚠️ **Capacité max non définie**

**Actions Requises:**
```typescript
// 1. Setup Cloudflare CDN
// 2. Load test avec k6
import http from 'k6/http';
export default function() {
  http.get('https://gaboma.app');
}

// Target: 
// - 1000 concurrent users
// - <2s response time
// - 99% success rate
```

### Monitoring Infrastructure
- [ ] ⚠️ **Pas de monitoring Supabase** (DB metrics)
- [ ] ⚠️ **Pas d'alerting incidents**
- [ ] ⚠️ **Pas de runbook** (incident response)

---

## 📋 CHECKLIST FINALE

### 🔴 BLOQUANT (Must-have avant prod)
- [ ] **Validation edge functions** (Zod)
- [ ] **RLS complet** (order_items, attachments, media)
- [ ] **Bundle <200KB**
- [ ] **Images optimisées** (WebP, compression)
- [ ] **Indexes DB** (6 critiques)
- [ ] **Sentry intégré**
- [ ] **Privacy Policy + ToS**
- [ ] **Health checks endpoints**
- [ ] **Test coverage >40%**
- [ ] **Staging environment**

### 🟡 IMPORTANT (Nice-to-have Sprint 1-2)
- [ ] Auth middleware + token refresh
- [ ] Confirmation dialogs (delete, destructive)
- [ ] Progress indicators (uploads)
- [ ] PWA manifest + Service Worker
- [ ] Integration tests
- [ ] Datadog/LogRocket
- [ ] Backup testing
- [ ] Load testing
- [ ] API documentation
- [ ] User guide

### 🟢 OPTIONNEL (Post-launch)
- [ ] E2E tests (Playwright)
- [ ] Storybook
- [ ] Feature flags
- [ ] A/B testing
- [ ] Blue-green deployment
- [ ] Status page
- [ ] Video tutorials
- [ ] Advanced analytics

---

## 🎯 VERDICT FINAL

### ✅ Points Forts
```
✓ Architecture solide et scalable
✓ Sécurité de base (RLS, validation client)
✓ Performance acceptable (240KB bundle)
✓ Error handling robuste
✓ Code propre et maintenable
```

### ⚠️ Risques Majeurs
```
✗ Bundle size limite (240KB vs objectif 200KB)
✗ Test coverage insuffisant (8% vs objectif 60%)
✗ RLS incomplet (3 tables à risque)
✗ Monitoring production absent
✗ Documentation légale manquante
```

### 📊 Score Production Readiness

| Catégorie | Score | Status |
|-----------|-------|--------|
| **Sécurité** | 80% | 🟡 |
| **Performance** | 75% | 🟡 |
| **UX/UI** | 85% | ✅ |
| **Testing** | 30% | 🔴 |
| **Monitoring** | 40% | 🔴 |
| **Infrastructure** | 60% | 🟡 |
| **Documentation** | 45% | 🔴 |
| **GLOBAL** | **65%** | 🟡 |

### 🚦 Recommandation

**STATUT: GO CONDITIONNEL**

✅ **Prêt pour Soft Launch** (beta limité):
- 100-500 utilisateurs
- Monitoring manuel
- Support direct

⚠️ **Pas prêt pour Grand Public** sans:
- Compléter RLS (P0)
- Sentry + monitoring (P0)
- Test coverage >40% (P0)
- Legal docs (P0)
- Performance optimisée <200KB (P1)

**Timeline recommandée:**
```
Semaine 1-2: Fixes P0 sécurité + monitoring
Semaine 3: Tests + legal
Semaine 4: Soft launch beta
Semaine 5-6: Monitoring + ajustements
Semaine 7: Full production launch
```

---

**Date de GO Production estimée: Semaine 7 (sous conditions fixes P0)**

*Ce document doit être révisé hebdomadairement et validé par toute l'équipe avant déploiement.*
