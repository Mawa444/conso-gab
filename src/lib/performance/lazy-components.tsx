/**
 * ============================================
 * LAZY LOADED COMPONENTS
 * ============================================
 * Code splitting pour réduire le bundle initial
 * Chargement différé des pages lourdes
 */

import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Wrapper pour lazy loading avec fallback automatique
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  return (props: any) => (
    <Suspense fallback={fallback || <PageSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Skeleton loader par défaut pour les pages
 */
function PageSkeleton() {
  return (
    <div className="min-h-screen p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * ============================================
 * LAZY LOADED PAGES
 * ============================================
 */

// Pages Business (lourdes)
export const LazyBusinessSettings = lazyLoad(
  () => import('@/pages/BusinessSettingsPage')
);

export const LazyBusinessProfile = lazyLoad(
  () => import('@/pages/BusinessProfilePage')
);

export const LazyBusinessCreation = lazyLoad(
  () => import('@/pages/BusinessCreationPage')
);

// Pages Messagerie (très lourdes)
export const LazyMessagingPage = lazyLoad(
  () => import('@/pages/MessagingPage')
);

export const LazyConversationPage = lazyLoad(
  () => import('@/pages/MessagingPage')
);

// Pages Catalogues
export const LazyCreateCatalog = lazyLoad(
  () => import('@/pages/CreateCatalogPage')
);

export const LazyPublicCatalogs = lazyLoad(
  () => import('@/pages/PublicCatalogsPage')
);

// Pages Entreprises
export const LazyEntreprisesPage = lazyLoad(
  () => import('@/pages/EntreprisesPage')
);

// Pages Catégories
export const LazyCategoryPage = lazyLoad(
  () => import('@/pages/CategoryPage')
);

/**
 * ============================================
 * PREFETCH STRATEGIES
 * ============================================
 */

/**
 * Prefetch une page au hover du lien
 */
export function prefetchOnHover(importFn: () => Promise<any>) {
  let prefetched = false;
  
  return () => {
    if (!prefetched) {
      prefetched = true;
      importFn();
    }
  };
}

/**
 * Prefetch après un délai (pour pages probables)
 */
export function prefetchAfterDelay(
  importFn: () => Promise<any>,
  delayMs: number = 2000
) {
  setTimeout(() => {
    importFn();
  }, delayMs);
}

/**
 * Prefetch sur idle (quand le navigateur est inactif)
 */
export function prefetchOnIdle(importFn: () => Promise<any>) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn();
    });
  } else {
    // Fallback pour navigateurs sans requestIdleCallback
    setTimeout(() => {
      importFn();
    }, 1000);
  }
}
