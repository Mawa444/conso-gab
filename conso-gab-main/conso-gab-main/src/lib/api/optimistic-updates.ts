/**
 * ============================================
 * OPTIMISTIC UPDATES
 * ============================================
 * Mise à jour optimiste pour une UX ultra-réactive
 * L'UI se met à jour immédiatement, puis rollback en cas d'erreur
 */

import { QueryClient } from '@tanstack/react-query';
import { createDomainLogger } from '@/lib/logger';

const logger = createDomainLogger('optimistic-updates');

export interface OptimisticUpdateOptions<T> {
  queryKey: string[];
  mutationFn: () => Promise<T>;
  optimisticData: T | ((oldData: T) => T);
  onSuccess?: (data: T) => void;
  onError?: (error: any, rollbackFn: () => void) => void;
  queryClient: QueryClient;
}

/**
 * Exécute une mutation avec mise à jour optimiste
 */
export async function withOptimisticUpdate<T>({
  queryKey,
  mutationFn,
  optimisticData,
  onSuccess,
  onError,
  queryClient
}: OptimisticUpdateOptions<T>): Promise<T> {
  
  // 1. Sauvegarder les données actuelles
  const previousData = queryClient.getQueryData<T>(queryKey);
  
  logger.debug('Starting optimistic update', { action: 'optimistic_update' }, { queryKey });
  
  // 2. Mettre à jour l'UI immédiatement (optimiste)
  queryClient.setQueryData<T>(queryKey, (old) => {
    if (typeof optimisticData === 'function') {
      const updater = optimisticData as (oldData: T) => T;
      return updater(old as T);
    }
    return optimisticData as T;
  });
  
  try {
    // 3. Exécuter la mutation réelle
    const result = await mutationFn();
    
    logger.info('Optimistic update succeeded', { action: 'optimistic_update', status: 'success' }, { queryKey });
    
    // 4. Confirmer avec les données du serveur
    queryClient.setQueryData(queryKey, result);
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    return result;
    
  } catch (error: any) {
    logger.error('Optimistic update failed, rolling back', { action: 'optimistic_update', status: 'error' }, { queryKey, error });
    
    // 5. Rollback en cas d'erreur
    const rollbackFn = () => {
      queryClient.setQueryData(queryKey, previousData);
    };
    
    rollbackFn();
    
    if (onError) {
      onError(error, rollbackFn);
    }
    
    throw error;
  }
}

/**
 * Helper pour créer des updaters optimistes
 */
export function createOptimisticUpdater<T>(
  updateFn: (item: T, updates: Partial<T>) => T
) {
  return (updates: Partial<T>) => (oldData: T) => {
    return updateFn(oldData, updates);
  };
}

/**
 * Updaters pré-définis pour cas communs
 */
export const OptimisticUpdaters = {
  /**
   * Ajouter un élément à une liste
   */
  addToList: <T extends { id: string }>(newItem: T) => (oldList: T[] = []) => {
    return [...oldList, newItem];
  },

  /**
   * Retirer un élément d'une liste
   */
  removeFromList: <T extends { id: string }>(itemId: string) => (oldList: T[] = []) => {
    return oldList.filter(item => item.id !== itemId);
  },

  /**
   * Mettre à jour un élément dans une liste
   */
  updateInList: <T extends { id: string }>(itemId: string, updates: Partial<T>) => (oldList: T[] = []) => {
    return oldList.map(item => 
      item.id === itemId 
        ? { ...item, ...updates }
        : item
    );
  },

  /**
   * Mettre à jour un objet
   */
  updateObject: <T extends Record<string, any>>(updates: Partial<T>) => (oldData: T) => {
    return { ...oldData, ...updates };
  }
};
