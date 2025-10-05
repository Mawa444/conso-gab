import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdating: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdating: false,
    updateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    if (!state.isSupported) return;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[SW] Registered successfully:', registration.scope);

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Écouter les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            setState(prev => ({ ...prev, isUpdating: true }));

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({
                  ...prev,
                  isUpdating: false,
                  updateAvailable: true,
                }));
              }
            });
          }
        });

        // Écouter les messages du SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type, payload } = event.data;

          switch (type) {
            case 'CACHE_CLEARED':
              console.log('[SW] Cache cleared');
              break;
            case 'OFFLINE_READY':
              console.log('[SW] App ready for offline use');
              break;
            default:
              console.log('[SW] Message from SW:', type, payload);
          }
        });

        // Vérifier si une mise à jour est disponible au démarrage
        if (registration.waiting) {
          setState(prev => ({ ...prev, updateAvailable: true }));
        }

      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    };

    registerServiceWorker();
  }, [state.isSupported]);

  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const clearCache = async () => {
    if (state.registration?.active) {
      state.registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  };

  const getVersion = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (state.registration?.active) {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          resolve(event.data.version || null);
        };
        state.registration.active.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
      } else {
        resolve(null);
      }
    });
  };

  return {
    ...state,
    updateServiceWorker,
    clearCache,
    getVersion,
  };
};