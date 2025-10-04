/**
 * ============================================
 * MEMOIZATION UTILITIES
 * ============================================
 * Helpers pour optimiser les re-renders avec React.memo
 */

import { memo, useMemo, useCallback } from 'react';

/**
 * ============================================
 * SMART MEMO
 * ============================================
 * Wrapper React.memo avec comparaison personnalisée
 */

export function smartMemo<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  propsToCompare?: (keyof P)[]
) {
  return memo(Component, (prevProps, nextProps) => {
    // Si on spécifie des props, comparer uniquement celles-là
    if (propsToCompare) {
      return propsToCompare.every(
        key => prevProps[key] === nextProps[key]
      );
    }
    
    // Sinon, comparaison shallow par défaut
    return shallowEqual(prevProps, nextProps);
  });
}

/**
 * Comparaison shallow des objets
 */
function shallowEqual(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => obj1[key] === obj2[key]);
}

/**
 * ============================================
 * STABLE CALLBACKS
 * ============================================
 */

/**
 * Crée un callback stable qui ne change pas entre renders
 * même si les dépendances changent
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * ============================================
 * MEMOIZED COMPUTATIONS
 * ============================================
 */

/**
 * useMemo avec dépendances deep comparison
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: any[]
): T {
  const depsRef = useRef<any[]>(deps);
  const valueRef = useRef<T>();

  const hasChanged = !deepEqual(depsRef.current, deps);

  if (hasChanged || valueRef.current === undefined) {
    valueRef.current = factory();
    depsRef.current = deps;
  }

  return valueRef.current;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => deepEqual(a[key], b[key]));
}

/**
 * ============================================
 * COMMON PATTERNS
 * ============================================
 */

/**
 * Memoize une liste triée
 */
export function useSortedList<T>(
  items: T[],
  compareFn: (a: T, b: T) => number
): T[] {
  return useMemo(
    () => [...items].sort(compareFn),
    [items, compareFn]
  );
}

/**
 * Memoize une liste filtrée
 */
export function useFilteredList<T>(
  items: T[],
  filterFn: (item: T) => boolean
): T[] {
  return useMemo(
    () => items.filter(filterFn),
    [items, filterFn]
  );
}

/**
 * Memoize un objet groupé
 */
export function useGroupedItems<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return useMemo(() => {
    const grouped = {} as Record<K, T[]>;
    
    items.forEach(item => {
      const key = keyFn(item);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    return grouped;
  }, [items, keyFn]);
}

/**
 * ============================================
 * PERFORMANCE MONITORING
 * ============================================
 */

/**
 * Hook pour mesurer le temps de render
 */
export function useRenderCount(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const duration = performance.now() - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${componentName} rendered ${renderCount.current} times (${duration.toFixed(2)}ms)`
      );
    }
    
    startTime.current = performance.now();
  });
}

/**
 * Hook pour détecter les renders inutiles
 */
export function useWhyDidYouUpdate(componentName: string, props: Record<string, any>) {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current && process.env.NODE_ENV === 'development') {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log(`[WhyDidYouUpdate] ${componentName}:`, changedProps);
      }
    }

    previousProps.current = props;
  });
}

import { useRef, useEffect } from 'react';
