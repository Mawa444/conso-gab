// src/main.tsx
import { createRoot } from 'react-dom/client';
import { StrictMode, Suspense } from 'react';
import App from '@/App';
import '@/integrations/supabase/client';
import { PageWithSkeleton } from '@/components/layout/PageWithSkeleton';
import { AppSkeleton } from '@/components/ui/skeleton-screens';

// Précharge la police Roboto (Google Fonts)
const preloadFonts = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
  document.head.appendChild(link);

  // Applique la police immédiatement pour éviter le FOIT
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: 'Roboto', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  `;
  document.head.appendChild(style);
};

// Précharge les icônes critiques (Lucide)
const preloadIcons = () => {
  const icons = ['user', 'building2', 'qr-code', 'settings', 'mail', 'phone', 'map-pin'];
  icons.forEach(name => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = https://unpkg.com/lucide-static@latest/icons/${name}.svg;
    document.head.appendChild(link);
  });
};

// Mesure du temps de chargement (prod uniquement)
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData?.loadEventEnd) {
      console.log('App loaded in:', Math.round(perfData.loadEventEnd - perfData.loadEventStart), 'ms');
    }
  });
}

// Préchargement stratégique
preloadFonts();
preloadIcons();

// Démarrage de l'app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<PageWithSkeleton isLoading skeleton={<AppSkeleton />} />}>
      <App />
    </Suspense>
  </StrictMode>
);