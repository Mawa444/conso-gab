/**
 * Configuration Sentry pour monitoring production
 * Capture automatique des erreurs, performance monitoring, et session replay
 */

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  sampleRate: number;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

/**
 * Initialise Sentry pour le monitoring
 * À appeler au démarrage de l'application
 */
export const initSentry = async () => {
  // Ne charger Sentry qu'en production
  if (import.meta.env.DEV) {
    console.log('[Sentry] Skipped in development mode');
    return;
  }

  try {
    // Charger Sentry dynamiquement pour réduire le bundle en dev
    const Sentry = await import('@sentry/react');
    
    const config: SentryConfig = {
      // TODO: Remplacer par votre DSN Sentry réel
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      
      // Environnement
      environment: import.meta.env.MODE,
      
      // Version de l'app (à synchroniser avec package.json)
      release: `consogab@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      
      // Échantillonnage des erreurs (100% en production)
      sampleRate: 1.0,
      
      // Échantillonnage des traces de performance (10% en production pour limiter les coûts)
      tracesSampleRate: 0.1,
      
      // Session replay
      replaysSessionSampleRate: 0.1, // 10% des sessions normales
      replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreur
    };

    // Ne pas initialiser si pas de DSN
    if (!config.dsn) {
      console.warn('[Sentry] No DSN configured, monitoring disabled');
      return;
    }

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      
      // Intégrations
      integrations: [
        // Capture automatique des erreurs React
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect: React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        }),
        
        // Session replay pour debug visuel
        Sentry.replayIntegration({
          maskAllText: false, // Masquer le texte sensible
          blockAllMedia: false, // Bloquer les médias
        }),
        
        // Capture des erreurs console
        Sentry.captureConsoleIntegration({
          levels: ['error', 'assert']
        }),
        
        // Suivi des interactions HTTP
        Sentry.httpClientIntegration(),
      ],
      
      // Échantillonnage
      sampleRate: config.sampleRate,
      tracesSampleRate: config.tracesSampleRate,
      replaysSessionSampleRate: config.replaysSessionSampleRate,
      replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
      
      // Filtrer les erreurs non pertinentes
      beforeSend(event, hint) {
        // Ignorer les erreurs réseau temporaires
        if (event.exception?.values?.[0]?.type === 'NetworkError') {
          return null;
        }
        
        // Ignorer les erreurs d'extensions navigateur
        if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
          frame => frame.filename?.includes('chrome-extension://')
        )) {
          return null;
        }
        
        // Ajouter des contextes supplémentaires
        event.contexts = {
          ...event.contexts,
          app: {
            name: 'ConsoGab',
            version: config.release,
          }
        };
        
        return event;
      },
      
      // Filtrer les breadcrumbs
      beforeBreadcrumb(breadcrumb) {
        // Ignorer les breadcrumbs de debug en production
        if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
          return null;
        }
        return breadcrumb;
      },
      
      // Configuration des tags par défaut
      initialScope: {
        tags: {
          platform: 'mobile',
          country: 'GA', // Gabon
        }
      }
    });

    console.log('[Sentry] Initialized successfully');
    
    // Exposer Sentry globalement pour le logger
    (window as any).Sentry = Sentry;
    
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
};

/**
 * Définir le contexte utilisateur pour Sentry
 */
export const setSentryUser = (user: { id: string; email?: string; pseudo?: string }) => {
  if (import.meta.env.DEV) return;
  
  try {
    const Sentry = (window as any).Sentry;
    if (Sentry) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.pseudo,
      });
    }
  } catch (error) {
    console.error('[Sentry] Failed to set user:', error);
  }
};

/**
 * Effacer le contexte utilisateur (lors de la déconnexion)
 */
export const clearSentryUser = () => {
  if (import.meta.env.DEV) return;
  
  try {
    const Sentry = (window as any).Sentry;
    if (Sentry) {
      Sentry.setUser(null);
    }
  } catch (error) {
    console.error('[Sentry] Failed to clear user:', error);
  }
};

/**
 * Capturer une erreur manuellement
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (import.meta.env.DEV) {
    console.error('[Sentry] Error captured:', error, context);
    return;
  }
  
  try {
    const Sentry = (window as any).Sentry;
    if (Sentry) {
      Sentry.captureException(error, {
        contexts: { extra: context }
      });
    }
  } catch (err) {
    console.error('[Sentry] Failed to capture error:', err);
  }
};

/**
 * Ajouter un breadcrumb manuel
 */
export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
  if (import.meta.env.DEV) return;
  
  try {
    const Sentry = (window as any).Sentry;
    if (Sentry) {
      Sentry.addBreadcrumb({
        message,
        data,
        level: 'info',
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('[Sentry] Failed to add breadcrumb:', error);
  }
};

// Imports nécessaires pour Sentry React Router integration
import React from 'react';
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router-dom';
