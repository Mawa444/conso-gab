import React from 'react';
import { Advertisement, advertisements } from '@/data/advertisements';
import { AdCarousel } from '@/components/advertising/AdCarousel';
import { GeolocalizedAdCarousel } from '@/components/advertising/GeolocalizedAdCarousel';

interface AdInjectorProps {
  items: React.ReactNode[];
  userLocation?: string;
  adInterval?: number;
}

const AdInjector: React.FC<AdInjectorProps> = ({ items, userLocation, adInterval = 13 }) => {
  const getRelevantAds = () => {
    if (!userLocation) {
      return advertisements.filter(ad => ad.targeting.country === 'Gabon' && ad.displayContext === 'list');
    }

    // Simple location matching for now. This will be improved.
    const locationParts = userLocation.split(',').map(p => p.trim());
    const city = locationParts[0] || '';

    const filteredAds = advertisements.filter(ad => {
      return (
        ad.displayContext === 'list' &&
        (ad.targeting.city === city || ad.targeting.country === 'Gabon')
      );
    });

    return filteredAds.length > 0 ? filteredAds : advertisements.filter(ad => ad.targeting.country === 'Gabon' && ad.displayContext === 'list');
  };

  const relevantAds = getRelevantAds();
  let adCounter = 0;

  const itemsWithAds: React.ReactNode[] = [];

  items.forEach((item, index) => {
    itemsWithAds.push(item);
    if ((index + 1) % adInterval === 0 && relevantAds.length > 0) {
      const adToDisplay = relevantAds[adCounter % relevantAds.length];
      itemsWithAds.push(
        <div key={`ad-${index}`} className="my-4">
          {adToDisplay.displayFormat === 'carousel' ? (
            <GeolocalizedAdCarousel userLocation={userLocation} />
          ) : (
            // Placeholder for a single ad card component
            <div className="bg-gray-200 p-4 rounded-lg">Single Ad Card for {adToDisplay.title}</div>
          )}
        </div>
      );
      adCounter++;
    }
  });

  return <>{itemsWithAds}</>;
};

export default AdInjector;