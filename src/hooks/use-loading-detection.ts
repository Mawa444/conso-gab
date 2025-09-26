import { useState, useEffect, useRef } from 'react';

interface UseLoadingDetectionOptions {
  threshold?: number; // En millisecondes, défaut 250ms
  onSlowLoading?: () => void;
  onFastLoading?: () => void;
}

export const useLoadingDetection = (
  isLoading: boolean,
  options: UseLoadingDetectionOptions = {}
) => {
  const { threshold = 250, onSlowLoading, onFastLoading } = options;
  const [showSlowLoadingUI, setShowSlowLoadingUI] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Début du chargement
      loadingStartTime.current = Date.now();
      
      // Déclencher l'UI de chargement lent après le seuil
      timeoutRef.current = setTimeout(() => {
        setShowSlowLoadingUI(true);
        onSlowLoading?.();
      }, threshold);
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