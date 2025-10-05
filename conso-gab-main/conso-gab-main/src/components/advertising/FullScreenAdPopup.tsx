import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAd } from '@/context/AdContext';

const FullScreenAdPopup: React.FC = () => {
  const { showFullScreenAd, setShowFullScreenAd, currentAd } = useAd();

  if (!showFullScreenAd || !currentAd) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white z-10"
          onClick={() => setShowFullScreenAd(false)}
        >
          <X className="h-6 w-6" />
        </Button>
        <img src={currentAd.image} alt={currentAd.title} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <h2 className="text-white text-2xl font-bold">{currentAd.title}</h2>
          <p className="text-white">{currentAd.subtitle}</p>
          <Button className="mt-4">{currentAd.cta}</Button>
        </div>
      </div>
    </div>
  );
};

export default FullScreenAdPopup;