import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Advertisement, advertisements } from '../data/advertisements';
import { ActivityTrackerService } from '../services/ActivityTrackerService';

interface AdContextType {
  showFullScreenAd: boolean;
  setShowFullScreenAd: (show: boolean) => void;
  currentAd: Advertisement | null;
  triggerAd: () => void;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showFullScreenAd, setShowFullScreenAd] = useState(false);
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);

  const getRandomAd = () => {
    const fullscreenAds = advertisements.filter(
      (ad) => ad.displayFormat === 'fullscreen'
    );
    if (fullscreenAds.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * fullscreenAds.length);
    return fullscreenAds[randomIndex];
  };

  const triggerAd = () => {
    if (showFullScreenAd) return; // Don't show ad if one is already shown
    const randomAd = getRandomAd();
    if (randomAd) {
      setCurrentAd(randomAd);
      setShowFullScreenAd(true);
    }
  };

  useEffect(() => {
    ActivityTrackerService.start(triggerAd, 40000); // 40 seconds

    return () => {
      ActivityTrackerService.stop();
    };
  }, []);

  const value = {
    showFullScreenAd,
    setShowFullScreenAd,
    currentAd,
    triggerAd,
  };

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
};

export const useAd = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAd must be used within an AdProvider');
  }
  return context;
};