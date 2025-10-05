/**
 * ============================================
 * BUNDLE OPTIMIZATION UTILITIES
 * ============================================
 * Helpers pour optimiser la taille du bundle
 */

/**
 * ============================================
 * DYNAMIC IMPORTS
 * ============================================
 */

/**
 * Import conditionnel (seulement si nécessaire)
 */
export async function importIfNeeded<T>(
  condition: boolean,
  importFn: () => Promise<T>
): Promise<T | null> {
  if (!condition) return null;
  return await importFn();
}

/**
 * Import avec timeout (évite les imports bloquants)
 */
export async function importWithTimeout<T>(
  importFn: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  return Promise.race([
    importFn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Import timeout')), timeoutMs)
    )
  ]);
}

/**
 * ============================================
 * CHUNK SPLITTING
 * ============================================
 */

/**
 * Suggère des chunks pour les grosses librairies
 */
export const CHUNK_GROUPS = {
  // UI Components (shadcn, radix)
  ui: [
    '@radix-ui',
    '@/components/ui'
  ],
  
  // Charts & Visualizations
  charts: [
    'recharts',
    'd3'
  ],
  
  // Forms & Validation
  forms: [
    'react-hook-form',
    'zod',
    '@hookform/resolvers'
  ],
  
  // Maps
  maps: [
    'leaflet',
    'react-leaflet'
  ],
  
  // Rich Text Editors
  editors: [
    'slate',
    'draft-js',
    'quill'
  ]
} as const;

/**
 * ============================================
 * TREE SHAKING
 * ============================================
 */

/**
 * Import uniquement les icônes nécessaires de lucide-react
 * ❌ MAUVAIS: import * as Icons from 'lucide-react'
 * ✅ BON: import { Home, Settings } from 'lucide-react'
 */
export function importIconsSelectively() {
  console.warn(
    'Utilisez des imports nommés pour lucide-react:\n' +
    'import { Home, Settings } from "lucide-react"'
  );
}

/**
 * ============================================
 * BUNDLE ANALYSIS HELPERS
 * ============================================
 */

/**
 * Log la taille approximative d'un module en dev
 */
export function logModuleSize(moduleName: string, size: number) {
  if (process.env.NODE_ENV === 'development') {
    const sizeKB = (size / 1024).toFixed(2);
    console.log(`[Bundle] ${moduleName}: ${sizeKB} KB`);
    
    if (size > 100 * 1024) {
      console.warn(`⚠️ ${moduleName} est lourd (>${sizeKB}KB). Considérez le code splitting.`);
    }
  }
}

/**
 * ============================================
 * WEBPACK/VITE MAGIC COMMENTS
 * ============================================
 */

/**
 * Exemples d'utilisation des magic comments pour le chunking
 */
export const MAGIC_COMMENT_EXAMPLES = {
  // Prefetch (chargé en arrière-plan)
  prefetch: `
    const Component = lazy(() => 
      import(/* webpackPrefetch: true */ './HeavyComponent')
    );
  `,
  
  // Preload (chargé immédiatement en parallèle)
  preload: `
    const Component = lazy(() => 
      import(/* webpackPreload: true */ './CriticalComponent')
    );
  `,
  
  // Chunk name personnalisé
  chunkName: `
    const Component = lazy(() => 
      import(/* webpackChunkName: "admin" */ './AdminPanel')
    );
  `,
  
  // Combinaison
  combined: `
    const Component = lazy(() => 
      import(
        /* webpackChunkName: "charts" */
        /* webpackPrefetch: true */
        './ChartsPage'
      )
    );
  `
};

/**
 * ============================================
 * COMPRESSION RECOMMENDATIONS
 * ============================================
 */

export const COMPRESSION_TIPS = {
  images: [
    '✅ Utiliser WebP au lieu de PNG/JPG',
    '✅ Compresser avec tinypng.com ou squoosh.app',
    '✅ Utiliser des images responsive (srcset)',
    '✅ Lazy load les images below-the-fold'
  ],
  
  fonts: [
    '✅ Utiliser woff2 (meilleure compression)',
    '✅ Précharger les fonts critiques',
    '✅ Utiliser font-display: swap',
    '✅ Sous-setter les fonts (Latin uniquement si possible)'
  ],
  
  code: [
    '✅ Activer la minification (Terser/esbuild)',
    '✅ Activer Brotli/Gzip sur le serveur',
    '✅ Tree shaking via ESM imports',
    '✅ Supprimer les console.log en production'
  ]
};

/**
 * ============================================
 * PERFORMANCE BUDGETS
 * ============================================
 */

export const PERFORMANCE_BUDGETS = {
  // Tailles maximales recommandées
  maxBundleSize: {
    initial: 200, // KB
    total: 500    // KB
  },
  
  // Métriques Core Web Vitals
  coreWebVitals: {
    LCP: 2500,  // Largest Contentful Paint (ms)
    FID: 100,   // First Input Delay (ms)
    CLS: 0.1    // Cumulative Layout Shift
  },
  
  // Autres métriques
  metrics: {
    TTI: 3500,  // Time to Interactive (ms)
    FCP: 1800,  // First Contentful Paint (ms)
    SI: 3000    // Speed Index (ms)
  }
};

/**
 * Vérifier si on respecte les budgets
 */
export function checkPerformanceBudget(
  metric: keyof typeof PERFORMANCE_BUDGETS.coreWebVitals,
  value: number
): boolean {
  const budget = PERFORMANCE_BUDGETS.coreWebVitals[metric];
  const isGood = value <= budget;
  
  if (!isGood && process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️ Performance Budget dépassé!\n` +
      `${metric}: ${value} (budget: ${budget})`
    );
  }
  
  return isGood;
}
