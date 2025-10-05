import { Suspense, lazy } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useServiceWorker } from '@/hooks/use-service-worker';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';

// Lazy load main components for better performance
const AppRouter = lazy(() => import('@/components/routing/AppRouter'));

// Loading fallback component
const AppSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Service Worker Update Prompt
const ServiceWorkerUpdatePrompt = ({
  onUpdate,
  onDismiss
}: {
  onUpdate: () => void;
  onDismiss: () => void;
}) => (
  <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-card border rounded-lg shadow-lg p-4">
    <h3 className="font-semibold mb-2">Mise à jour disponible</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Une nouvelle version de l'application est disponible.
    </p>
    <div className="flex gap-2">
      <Button onClick={onUpdate} size="sm" className="gap-2">
        <Download className="w-4 h-4" />
        Mettre à jour
      </Button>
      <Button onClick={onDismiss} variant="outline" size="sm">
        Plus tard
      </Button>
    </div>
  </div>
);

// Main App Component
const AppContent = () => {
  const {
    isSupported: swSupported,
    isRegistered: swRegistered,
    updateAvailable,
    updateServiceWorker
  } = useServiceWorker();

  // Show PWA install prompt if supported but not installed
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('Application installée avec succès !');
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  return (
    <>
      <Suspense fallback={<AppSkeleton />}>
        <AppRouter />
      </Suspense>

      {/* Service Worker Update Prompt */}
      {updateAvailable && (
        <ServiceWorkerUpdatePrompt
          onUpdate={updateServiceWorker}
          onDismiss={() => setShowInstallPrompt(false)}
        />
      )}

      {/* PWA Install Prompt */}
      {showInstallPrompt && !updateAvailable && (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm bg-card border rounded-lg shadow-lg p-4">
          <h3 className="font-semibold mb-2">Installer l'application</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Installez ConsoGab pour une expérience optimale.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleInstallPWA} size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Installer
            </Button>
            <Button onClick={() => setShowInstallPrompt(false)} variant="outline" size="sm">
              Plus tard
            </Button>
          </div>
        </div>
      )}

      {/* Development indicators */}
      {import.meta.env.DEV && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          {swSupported && (
            <div className={`px-2 py-1 rounded text-xs font-mono ${
              swRegistered
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              SW: {swRegistered ? 'OK' : 'Loading'}
            </div>
          )}
          <div className="px-2 py-1 rounded text-xs font-mono bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            DEV
          </div>
        </div>
      )}
    </>
  );
};

// Root App Component with all providers
export const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="consogab-theme">
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};