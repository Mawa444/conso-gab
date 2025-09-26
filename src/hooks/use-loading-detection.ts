import { useState, useEffect, useRef } from 'react';

interface UseLoadingDetectionOptions {
  threshold?: number; // En millisecondes, défaut 0ms (immédiat)
  onSlowLoading?: () => void;
  onFastLoading?: () => void;
}

export const useLoadingDetection = (
  isLoading: boolean,
  options: UseLoadingDetectionOptions = {}
) => {
  const { threshold = 0, onSlowLoading, onFastLoading } = options;
  const [showSlowLoadingUI, setShowSlowLoadingUI] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Début du chargement - déclencher immédiatement
      loadingStartTime.current = Date.now();
      
      // Déclencher l'UI de chargement immédiatement
      if (threshold === 0) {
        setShowSlowLoadingUI(true);
        onSlowLoading?.();
      } else {
        timeoutRef.current = setTimeout(() => {
          setShowSlowLoadingUI(true);
          onSlowLoading?.();
        }, threshold);
      }
    } else {
      // Fin du chargement
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      const loadingDuration = loadingStartTime.current 
        ? Date.now() - loadingStartTime.current 
        : 0;
      
      if (loadingDuration < threshold) {
        onFastLoading?.();
      }
      
      setShowSlowLoadingUI(false);
      loadingStartTime.current = null;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, threshold, onSlowLoading, onFastLoading]);

  return {
    showSlowLoadingUI,
    isSlowLoading: showSlowLoadingUI && isLoading
  };
};