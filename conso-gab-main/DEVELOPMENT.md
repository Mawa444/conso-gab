# 🛠️ Guide Développeur - ConsoGab

**Version**: 2.1 - Architecture Enterprise-Grade
**Dernière mise à jour**: 5 Octobre 2025

---

## 📋 Table des Matières

- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [🏗️ Architecture](#️-architecture)
- [📁 Structure du Projet](#-structure-du-projet)
- [🔧 Technologies & Outils](#-technologies--outils)
- [🧪 Tests & Qualité](#-tests--qualité)
- [🚢 Déploiement](#-déploiement)
- [📚 Bonnes Pratiques](#-bonnes-pratiques)
- [🔍 Debugging & Monitoring](#-debugging--monitoring)
- [🤝 Contribution](#-contribution)

---

## 🚀 Démarrage Rapide

### Prérequis

```bash
# Node.js 18+
node --version  # v18.0.0+

# pnpm (recommandé)
npm install -g pnpm

# Git
git --version
```

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-org/consogab.git
cd consogab

# Installer les dépendances
pnpm install

# Copier les variables d'environnement
cp .env.example .env

# Démarrer en développement
pnpm dev
```

### Scripts Disponibles

```bash
# Développement
pnpm dev          # Serveur de développement
pnpm build        # Build de production
pnpm preview      # Aperçu build local
pnpm type-check   # Vérification TypeScript
pnpm lint         # Linting ESLint
pnpm format       # Formatage Prettier

# Tests
pnpm test:unit    # Tests unitaires
pnpm test:e2e     # Tests E2E
pnpm test:prod    # Tests de production
pnpm test:coverage # Tests avec couverture

# Qualité
pnpm audit        # Audit sécurité
pnpm bundle:analyze # Analyse bundle
pnpm lighthouse   # Audit performance

# Base de données
pnpm db:reset     # Reset DB locale
pnpm db:seed      # Seed données de test
pnpm db:migrate   # Appliquer migrations
```

---

## 🏗️ Architecture

### Principes Architecturaux

ConsoGab suit une **architecture modulaire** avec séparation claire des préoccupations :

```
🎨 UI Layer (Components)     → Présentation pure
🎣 Logic Layer (Hooks)       → Logique UI réutilisable
🔧 Service Layer (Services)  → Logique métier
🗃️ Data Layer (Supabase)     → Persistance & API
```

### Patterns Utilisés

#### 1. **Service Layer Pattern**
```typescript
// ✅ BON: Logique métier isolée
export class AuthService {
  static async signUp(data: SignUpData): Promise<Result> {
    // Validation + logique métier pure
  }
}
```

#### 2. **Custom Hooks Pattern**
```typescript
// ✅ BON: Logique UI réutilisable
export const useHomePageState = () => {
  const [ui, setUI] = useState(initialUIState);
  const [data, setData] = useState(initialDataState);

  return { ui, data, actions };
};
```

#### 3. **Repository Pattern (React Query)**
```typescript
// ✅ BON: Abstraction données
const { data: businesses } = useQuery({
  queryKey: queryKeys.business.list(filters),
  queryFn: () => BusinessService.getBusinesses(filters),
});
```

---

## 📁 Structure du Projet

```
conso-gab-main/
├── 📁 src/
│   ├── 📁 components/          # Composants React
│   │   ├── 📁 ui/              # Design System (shadcn)
│   │   ├── 📁 auth/            # Authentification UI
│   │   ├── 📁 error/           # Gestion d'erreurs
│   │   ├── 📁 business/        # Composants métier
│   │   └── 📁 catalog/         # Catalogue produits
│   ├── 📁 pages/               # Pages/conteneurs
│   ├── 📁 services/            # Logique métier
│   ├── 📁 hooks/               # Hooks personnalisés
│   ├── 📁 lib/                 # Utilitaires/infrastructure
│   │   ├── 📁 monitoring/      # Monitoring & analytics
│   │   ├── 📁 accessibility/   # Accessibilité WCAG
│   │   └── 📁 query-client.ts  # React Query config
│   ├── 📁 types/               # Définition des types
│   └── 📁 __tests__/           # Tests unitaires
├── 📁 supabase/                # Backend Supabase
│   ├── 📁 functions/           # Edge Functions
│   └── 📁 migrations/          # Schéma DB
├── 📁 public/                  # Assets statiques
├── 📁 e2e/                     # Tests E2E
└── 📁 .github/                 # CI/CD
```

### Conventions de Nommage

#### Fichiers
- **PascalCase** pour composants: `AuthProvider.tsx`
- **camelCase** pour hooks: `useHomePageState.ts`
- **kebab-case** pour utilitaires: `query-client.ts`

#### Variables & Fonctions
- **camelCase** pour variables/fonctions: `handleSubmit`
- **PascalCase** pour types/interfaces: `UserProfile`
- **SCREAMING_SNAKE_CASE** pour constantes: `API_BASE_URL`

#### Tests
- **`.test.tsx`** pour composants
- **`.test.ts`** pour services/hooks
- **`.spec.ts`** pour E2E

---

## 🔧 Technologies & Outils

### Core Stack

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18.2+ | Framework UI |
| **TypeScript** | 5.0+ | Type safety |
| **Vite** | 4.0+ | Build tool |
| **Supabase** | Latest | Backend-as-a-Service |
| **React Query** | 5.0+ | Data fetching |
| **React Router** | 6.0+ | Routing |
| **Tailwind CSS** | 3.0+ | Styling |
| **Shadcn/ui** | Latest | Component library |

### Outils de Développement

#### Tests & Qualité
```json
{
  "vitest": "^1.0.0",           // Test runner
  "playwright": "^1.40.0",       // E2E testing
  "@testing-library/react": "^14.0.0", // Component testing
  "eslint": "^8.0.0",            // Linting
  "prettier": "^3.0.0",          // Code formatting
  "typescript": "^5.0.0"         // Type checking
}
```

#### Performance & Monitoring
```json
{
  "web-vitals": "^3.0.0",        // Core Web Vitals
  "workbox": "^7.0.0",           // PWA & caching
  "@axe-core/react": "^4.0.0"    // Accessibility testing
}
```

#### CI/CD
```yaml
# .github/workflows/ci.yml
- Quality checks (lint, type-check, format)
- Unit tests with coverage
- E2E tests with Playwright
- Performance audits (Lighthouse)
- Security scans
- Accessibility tests
- Automated deployment
```

---

## 🧪 Tests & Qualité

### Stratégie de Test

#### 1. **Tests Unitaires** (Services & Hooks)
```typescript
// src/__tests__/services/auth.service.test.ts
describe('AuthService', () => {
  it('should create user account successfully', async () => {
    // Arrange
    vi.mocked(supabase.auth.signUp).mockResolvedValue(mockData);

    // Act
    const result = await AuthService.signUp(data);

    // Assert
    expect(result.user).toEqual(mockData.user);
  });
});
```

#### 2. **Tests Composants** (RTL)
```typescript
// src/__tests__/components/AuthProvider.test.tsx
describe('AuthProvider', () => {
  it('should provide auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });
});
```

#### 3. **Tests E2E** (Playwright)
```typescript
// e2e/home-page.spec.ts
test('should load home page successfully', async ({ page }) => {
  await page.goto('/consumer/home');
  await expect(page.locator('text=Découvrir')).toBeVisible();
});
```

### Métriques Qualité

#### Couverture Cible
- **Services**: 90%+
- **Hooks**: 100%
- **Composants**: 70%+
- **E2E**: 60%+ (scenarios critiques)

#### Performance Cible
- **LCP**: < 2500ms
- **FID**: < 100ms
- **CLS**: < 0.1
- **Bundle**: < 200KB

#### Accessibilité Cible
- **WCAG AA**: 95%+
- **Lighthouse A11y**: 90+

---

## 🚢 Déploiement

### Environnements

#### 1. **Développement**
```bash
pnpm dev  # http://localhost:8080
```

#### 2. **Staging**
```bash
# Auto-deploy depuis main branch
# URL: https://consogab-staging.vercel.app
```

#### 3. **Production**
```bash
# Deploy depuis releases GitHub
# URL: https://consogab.com
```

### Variables d'Environnement

```bash
# .env.local (développement)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SENTRY_DSN=your_sentry_dsn

# .env.production (production)
VITE_SUPABASE_URL=prod_supabase_url
VITE_SUPABASE_ANON_KEY=prod_anon_key
VITE_SENTRY_DSN=prod_sentry_dsn
```

### Health Checks

```bash
# API health check
curl https://consogab.com/api/health

# Database connection
curl https://consogab.com/api/health/db

# Service Worker status
curl https://consogab.com/sw.js
```

---

## 📚 Bonnes Pratiques

### Code Quality

#### 1. **TypeScript Strict**
```typescript
// ✅ BON: Types explicites
interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

// ❌ MAUVAIS: any partout
const user: any = { id: 1, email: 'test' };
```

#### 2. **Error Handling**
```typescript
// ✅ BON: Gestion d'erreur centralisée
try {
  const result = await AuthService.signUp(data);
  if (!result.success) {
    toast.error(result.error);
    return;
  }
  // Success handling
} catch (error) {
  console.error('Signup failed:', error);
  toast.error('Une erreur inattendue s\'est produite');
}
```

#### 3. **Performance**
```typescript
// ✅ BON: useCallback pour stabilité
const handleSubmit = useCallback(async (data: FormData) => {
  // Logique
}, []); // Dépendances vides = stable

// ✅ BON: useMemo pour calculs coûteux
const filteredItems = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);
```

### Sécurité

#### 1. **Input Validation**
```typescript
// ✅ BON: Validation côté client ET serveur
const CreateOrderSchema = z.object({
  business_id: z.string().uuid(),
  total_amount: z.number().positive(),
  items: z.array(OrderItemSchema).min(1),
});

// Validation côté serveur (Edge Function)
const validationResult = CreateOrderSchema.safeParse(requestData);
if (!validationResult.success) {
  return new Response(JSON.stringify({
    error: 'Validation failed',
    details: validationResult.error.errors
  }), { status: 400 });
}
```

#### 2. **Authentification**
```typescript
// ✅ BON: Vérification auth systématique
const { data: { user }, error } = await supabase.auth.getUser();
if (!user || error) {
  throw new Error('Authentication required');
}
```

### Accessibilité

#### 1. **ARIA Labels**
```typescript
// ✅ BON: Labels descriptifs
<Button
  onClick={handleDelete}
  aria-label="Supprimer ce catalogue"
>
  <Trash2 className="w-4 h-4" />
</Button>
```

#### 2. **Focus Management**
```typescript
// ✅ BON: Gestion focus dans modals
const containerRef = useFocusTrap(isOpen);

// Auto-focus premier élément
useEffect(() => {
  if (isOpen) {
    focusUtils.autoFocus(containerRef.current);
  }
}, [isOpen]);
```

### Performance

#### 1. **React Query Optimization**
```typescript
// ✅ BON: Cache optimisé
const { data: businesses } = useQuery({
  queryKey: queryKeys.business.list(filters),
  queryFn: () => BusinessService.getBusinesses(filters),
  staleTime: 10 * 60 * 1000, // 10 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
```

#### 2. **Bundle Splitting**
```typescript
// ✅ BON: Lazy loading
const BusinessDashboard = lazy(() =>
  import('@/pages/BusinessDashboardPage')
);

// ✅ BON: Suspense boundaries
<Suspense fallback={<PageSkeleton />}>
  <BusinessDashboard />
</Suspense>
```

---

## 🔍 Debugging & Monitoring

### Outils de Debug

#### 1. **React DevTools**
```bash
# Extension Chrome/Firefox
# Inspecter composants, state, performance
```

#### 2. **React Query DevTools**
```typescript
// src/main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  {import.meta.env.DEV && <ReactQueryDevtools />}
</QueryClientProvider>
```

#### 3. **Performance Monitor**
```typescript
// src/lib/monitoring/performance-monitor.ts
import { getPerformanceMonitor } from '@/lib/monitoring/performance-monitor';

// Track custom metrics
getPerformanceMonitor().trackMetric('user_action', 150, 'ms', {
  action: 'catalog_view',
  catalogId: '123'
});
```

### Monitoring Production

#### 1. **Sentry** (Errors)
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

#### 2. **Analytics** (Usage)
```typescript
// src/lib/analytics/tracker.ts
analytics.track({
  name: 'page_view',
  properties: {
    page: '/consumer/home',
    userId: user?.id,
  },
});
```

#### 3. **Performance** (Web Vitals)
```typescript
// Automatic tracking via Performance Monitor
// LCP, FID, CLS tracked automatically
```

---

## 🤝 Contribution

### Workflow Git

```bash
# 1. Créer une branche feature
git checkout -b feature/nom-fonctionnalite

# 2. Commits atomiques
git commit -m "feat: add user authentication"
git commit -m "test: add auth service tests"

# 3. Push et PR
git push origin feature/nom-fonctionnalite
# Créer PR avec description détaillée
```

### Standards de Code

#### Commits Conventionnels
```
feat: add user authentication
fix: resolve login redirect issue
test: add auth service unit tests
docs: update API documentation
refactor: optimize HomePage component
```

#### PR Requirements
- ✅ **Tests passing** (unit + E2E)
- ✅ **Code review** approuvé
- ✅ **Linting** sans erreurs
- ✅ **TypeScript** strict compliant
- ✅ **Coverage** maintenue
- ✅ **Documentation** mise à jour

### Code Review Checklist

#### Fonctionnalité
- [ ] Requirements respectés
- [ ] Tests couvrent tous les cas
- [ ] UX/UI cohérente

#### Qualité
- [ ] TypeScript strict
- [ ] Pas de `any` ou `as any`
- [ ] Error handling approprié
- [ ] Performance optimisée

#### Architecture
- [ ] Séparation des préoccupations
- [ ] Réutilisabilité du code
- [ ] Patterns consistants
- [ ] Tests maintenables

---

## 📞 Support & Ressources

### Documentation
- [Architecture](./ARCHITECTURE.md)
- [API Docs](./api/)
- [Tests Guide](./TESTING.md)

### Outils
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Actions](https://github.com/features/actions)

### Contacts
- **Tech Lead**: tech@consogab.com
- **DevOps**: infra@consogab.com
- **Security**: security@consogab.com

---

## 🎯 Roadmap Développement

### Phase 7 (Q1 2026): Scale & Performance
- Migration vers GraphQL
- Micro-frontend architecture
- Advanced caching strategies
- Real-time optimizations

### Phase 8 (Q2 2026): Intelligence Artificielle
- AI-powered recommendations
- Smart search with NLP
- Automated content moderation
- Predictive analytics

### Phase 9 (Q3 2026): Mobile Excellence
- React Native app
- Advanced PWA features
- Offline-first architecture
- Push notifications

---

*Ce guide est vivant et évolue avec le projet. Contributions bienvenues !*