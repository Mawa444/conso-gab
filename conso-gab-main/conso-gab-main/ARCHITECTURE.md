# Architecture Modulaire ConsoGab

## 🏗️ Structure par Domaines Fonctionnels

### 📁 src/modules/

#### 🔐 auth/
**Responsabilité**: Authentification, autorisation, gestion des sessions
```
auth/
├── components/
│   ├── LoginModal.tsx
│   ├── SignupWizard.tsx
│   └── AuthProvider.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuthCleanup.ts
├── services/
│   └── authService.ts
└── types/
    └── auth.types.ts
```

#### 👤 profile/
**Responsabilité**: Gestion des profils utilisateur, switch consommateur/business
```
profile/
├── components/
│   ├── ProfileModeSwitch.tsx
│   ├── ProfileSettings.tsx
│   └── AdvancedBusinessManager.tsx
├── hooks/
│   ├── useProfileMode.ts
│   └── useBusinessCreation.ts
├── services/
│   └── profileService.ts
└── types/
    └── profile.types.ts
```

#### 🏢 business/
**Responsabilité**: Gestion des entreprises, collaborateurs, outils business
```
business/
├── components/
│   ├── BusinessCreationWizard.tsx
│   ├── BusinessDashboard.tsx
│   ├── MultiBusinessManager.tsx
│   └── BusinessToolsSection.tsx
├── hooks/
│   ├── useBusinessList.ts
│   ├── useBusinessSubscriptions.ts
│   └── useBusinessCreation.ts
├── services/
│   └── businessService.ts
└── types/
    └── business.types.ts
```

#### 📦 catalog/
**Responsabilité**: Gestion des catalogues, produits, inventaire
```
catalog/
├── components/
│   ├── CatalogCreationWizard.tsx
│   ├── CatalogManager.tsx
│   ├── ProductManager.tsx
│   └── CatalogGalleryView.tsx
├── hooks/
│   ├── useCatalogManagement.ts
│   ├── useRealCatalogs.ts
│   └── useProductManagement.ts
├── services/
│   └── catalogService.ts
└── types/
    └── catalog.types.ts
```

#### 💬 messaging/
**Responsabilité**: Conversations, messages, notifications temps réel
```
messaging/
├── components/
│   ├── MessageHomePage.tsx
│   ├── ConversationDetail.tsx
│   ├── AudioRecorder.tsx
│   └── RealTimeProvider.tsx
├── hooks/
│   ├── useConversations.ts
│   ├── useMessages.ts
│   └── useAudioRecorder.ts
├── services/
│   └── messagingService.ts
└── types/
    └── messaging.types.ts
```

#### 🗺️ location/
**Responsabilité**: Géolocalisation, cartes, zones de livraison
```
location/
├── components/
│   ├── InteractiveMap.tsx
│   ├── LocationRequestModal.tsx
│   └── UserLocationManager.tsx
├── hooks/
│   ├── useLocationData.ts
│   ├── useGeocoding.ts
│   └── useLocationSecurity.ts
├── services/
│   └── locationService.ts
└── types/
    └── location.types.ts
```

#### 🛒 commerce/
**Responsabilité**: E-commerce, commandes, paiements
```
commerce/
├── components/
│   ├── CommerceCard.tsx
│   ├── ProductDetailsModal.tsx
│   └── OrderManagement.tsx
├── hooks/
│   ├── useNearestCommerce.ts
│   └── useProductInteractions.ts
├── services/
│   └── commerceService.ts
└── types/
    └── commerce.types.ts
```

#### 📅 booking/
**Responsabilité**: Réservations, créneaux, calendrier
```
booking/
├── components/
│   ├── BookingModal.tsx
│   ├── CatalogBookingStep.tsx
│   └── BookingCalendar.tsx
├── hooks/
│   └── useBookingManagement.ts
├── services/
│   └── bookingService.ts
└── types/
    └── booking.types.ts
```

#### 🔍 search/
**Responsabilité**: Recherche intelligente, filtres, indexation
```
search/
├── components/
│   ├── IntelligentSearchBar.tsx
│   ├── SearchModal.tsx
│   └── SearchFilters.tsx
├── hooks/
│   └── useUnifiedSearch.ts
├── services/
│   └── searchService.ts
└── types/
    └── search.types.ts
```

#### 📱 advertising/
**Responsabilité**: Publicités, géolocalisation ads, carrousels
```
advertising/
├── components/
│   ├── AdCarousel.tsx
│   └── GeolocalizedAdCarousel.tsx
├── hooks/
│   └── useAdvertising.ts
├── services/
│   └── advertisingService.ts
└── types/
    └── advertising.types.ts
```

#### ⭐ reviews/
**Responsabilité**: Avis, notations, commentaires
```
reviews/
├── components/
│   ├── ReviewSection.tsx
│   └── ReviewReplySection.tsx
├── hooks/
│   └── useReviews.ts
├── services/
│   └── reviewService.ts
└── types/
    └── review.types.ts
```

### 📁 src/shared/
**Responsabilité**: Composants, hooks et services partagés

```
shared/
├── components/
│   └── ui/           # Design system (Button, Card, etc.)
├── hooks/
│   ├── useDebounce.ts
│   ├── useMobile.tsx
│   └── useToast.ts
├── services/
│   └── supabaseClient.ts
├── utils/
│   ├── validation.ts
│   └── utils.ts
└── types/
    └── common.types.ts
```

### 📁 src/app/
**Responsabilité**: Configuration app, routing, providers

```
app/
├── providers/
│   └── ThemeProvider.tsx
├── layout/
│   ├── Header.tsx
│   ├── BottomNavigation.tsx
│   └── PageLayout.tsx
└── router/
    └── AppRouter.tsx
```

## 🔄 Limites et Interfaces

### Communication Inter-Modules
- **Services**: Interface standardisée pour les appels API
- **Events**: Système d'événements pour la communication asynchrone
- **Types**: Types partagés dans `shared/types/`

### Règles de Dépendances
- Les modules ne peuvent importer que depuis `shared/`
- Aucune dépendance circulaire entre modules
- Les services communiquent via des interfaces définies

### Points d'Intégration
- **Supabase**: Centralisé dans `shared/services/`
- **Routing**: Géré dans `app/router/`
- **State Management**: Props drilling + Context locaux par module