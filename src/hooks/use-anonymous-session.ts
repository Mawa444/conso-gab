import { useState, useEffect, useCallback } from 'react';

interface AnonymousSessionState {
  isAnonymous: boolean;
  timeRemaining: number;
  showLockPopup: boolean;
}

const ANONYMOUS_TIME_LIMIT = 13 * 60 * 1000; // 13 minutes in milliseconds
const STORAGE_KEY = 'anonymous_session_start';

export const useAnonymousSession = () => {
  const [state, setState] = useState<AnonymousSessionState>({
    isAnonymous: false,
    timeRemaining: ANONYMOUS_TIME_LIMIT,
    showLockPopup: false,
  });

  const startAnonymousSession = useCallback(() => {
    const startTime = Date.now();
    localStorage.setItem(STORAGE_KEY, startTime.toString());
    setState(prev => ({ 
      ...prev, 
      isAnonymous: true, 
      timeRemaining: ANONYMOUS_TIME_LIMIT,
      showLockPopup: false 
    }));
  }, []);

  const endAnonymousSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isAnonymous: false,
      timeRemaining: ANONYMOUS_TIME_LIMIT,
      showLockPopup: false,
    });
  }, []);

  const dismissLockPopup = useCallback(() => {
    setState(prev => ({ ...prev, showLockPopup: false }));
  }, []);

  useEffect(() => {
    const checkSession = () => {
      const startTime = localStorage.getItem(STORAGE_KEY);
      if (!startTime) return;

      const elapsed = Date.now() - parseInt(startTime);
      const remaining = Math.max(0, ANONYMOUS_TIME_LIMIT - elapsed);

      setState(prev => ({
        ...prev,
        isAnonymous: true,
        timeRemaining: remaining,
        showLockPopup: remaining === 0 && !prev.showLockPopup,
      }));

      if (remaining === 0) {
        endAnonymousSession();
      }
    };

    // Check immediately
    checkSession();

    // Set up interval to update every second
    const interval = setInterval(checkSession, 1000);

    return () => clearInterval(interval);
  }, [endAnonymousSession]);

  const formatTimeRemaining = () => {
    const minutes = Math.floor(state.timeRemaining / (1000 * 60));
    const seconds = Math.floor((state.timeRemaining % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    ...state,
    startAnonymousSession,
    endAnonymousSession,
    dismissLockPopup,
    formatTimeRemaining,
  };
};