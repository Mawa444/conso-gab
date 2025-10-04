/**
 * ============================================
 * RETRY LOGIC
 * ============================================
 * Gestion intelligente des erreurs réseau avec retry automatique
 */

import { createDomainLogger } from "@/lib/logger";

const logger = createDomainLogger('retry-handler');

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  exponentialBackoff?: boolean;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attemptNumber: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  delayMs: 1000,
  exponentialBackoff: true,
  shouldRetry: (error: any) => {
    // Retry sur erreurs réseau ou 5xx
    if (!error) return false;
    
    // Erreur réseau
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return true;
    }
    
    // Code HTTP 5xx (erreur serveur)
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    
    // Timeout
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return true;
    }
    
    return false;
  },
  onRetry: () => {}
};

/**
 * Exécute une fonction avec retry automatique en cas d'erreur
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      logger.debug('Executing function', { action: 'retry_attempt' }, { attempt, maxRetries: opts.maxRetries });
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Ne pas retry si c'est la dernière tentative
      if (attempt === opts.maxRetries) {
        logger.error('All retry attempts failed', { 
          action: 'retry_exhausted',
          status: 'error'
        }, { attempts: attempt + 1, maxRetries: opts.maxRetries, error });
        break;
      }
      
      // Vérifier si on doit retry
      if (!opts.shouldRetry(error)) {
        logger.warn('Error not retryable', { action: 'skip_retry' }, { attempt, error });
        throw error;
      }
      
      // Calculer le délai avec backoff exponentiel
      const delay = opts.exponentialBackoff
        ? opts.delayMs * Math.pow(2, attempt)
        : opts.delayMs;
      
      logger.warn('Retrying after delay', { 
        action: 'retry_scheduled',
        status: 'warning'
      }, { attempt: attempt + 1, delay, maxRetries: opts.maxRetries, error });
      
      opts.onRetry(attempt + 1, error);
      
      // Attendre avant de retry
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Wrapper pour requêtes Supabase avec retry automatique
 */
export async function supabaseWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
) {
  return withRetry(async () => {
    const { data, error } = await queryFn();
    
    if (error) {
      throw error;
    }
    
    return data;
  }, {
    ...options,
    shouldRetry: (error) => {
      // Ne pas retry sur erreurs de permission (403, 401)
      if (error?.code === 'PGRST116' || error?.status === 403 || error?.status === 401) {
        return false;
      }
      
      // Retry sur erreurs réseau et serveur
      return DEFAULT_OPTIONS.shouldRetry(error);
    }
  });
}

/**
 * Helper pour créer un délai
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry conditionnel basé sur le type d'erreur
 */
export function createRetryStrategy(customLogic: (error: any) => boolean): RetryOptions {
  return {
    shouldRetry: customLogic,
    maxRetries: 3,
    exponentialBackoff: true
  };
}

/**
 * Stratégies pré-définies
 */
export const RetryStrategies = {
  /**
   * Retry uniquement sur erreurs réseau
   */
  networkOnly: createRetryStrategy((error) => {
    return error.message?.includes('fetch') || 
           error.message?.includes('network') ||
           error.code === 'ETIMEDOUT';
  }),

  /**
   * Retry sur erreurs réseau et serveur (5xx)
   */
  networkAndServer: createRetryStrategy((error) => {
    return RetryStrategies.networkOnly.shouldRetry!(error) ||
           (error.status >= 500 && error.status < 600);
  }),

  /**
   * Ne jamais retry (pour opérations critiques)
   */
  never: createRetryStrategy(() => false),

  /**
   * Toujours retry (attention : peut causer des boucles)
   */
  always: createRetryStrategy(() => true)
};
