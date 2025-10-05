import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { queryClient } from '@/lib/query-client';
import { App } from './App';
import './index.css';

// Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[SW] Registered successfully:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('[SW] New version available');
              // Could show a toast notification here
            }
          });
        }
      });

      // Listen for messages from SW
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

    } catch (error) {
      console.error('[SW] Registration failed:', error);
    }
  }
};

// Initialize app
const initApp = async () => {
  // Register Service Worker
  await registerServiceWorker();

  // Create root
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // Send to error reporting service in production
          if (import.meta.env.PROD) {
            // reportError(error, errorInfo);
            console.error('Application Error:', error, errorInfo);
          }
        }}
      >
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
          />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

// Start the app
initApp().catch((error) => {
  console.error('Failed to initialize app:', error);
  // Fallback error display
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: system-ui, sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <h1 style="color: #ef4444; margin-bottom: 1rem;">Erreur de chargement</h1>
        <p style="color: #6b7280; margin-bottom: 2rem;">
          Une erreur inattendue s'est produite lors du chargement de l'application.
        </p>
        <button
          onclick="window.location.reload()"
          style="
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
          "
        >
          Recharger la page
        </button>
      </div>
    `;
  }
});