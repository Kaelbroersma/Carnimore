import React, { useEffect, useState } from 'react';

interface AssetPreloaderProps {
  onComplete: () => void;
}

// List of critical assets to preload
const assetsToPreload = [
  '/img/Logo-Main.webp',
  '/img/Hero-Main.jpg',
  '/img/AboutUs-Joel.png'
];

const AssetPreloader: React.FC<AssetPreloaderProps> = ({ onComplete }) => {
  const [loadedCount, setLoadedCount] = useState(0);
  
  useEffect(() => {
    // Skip preloading if all assets are already cached
    const cachedAssets = sessionStorage.getItem('preloadedAssets');
    if (cachedAssets === 'true') {
      onComplete();
      return;
    }
    
    // Function to preload an image
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setLoadedCount(prev => prev + 1);
          resolve();
        };
        img.onerror = () => {
          setLoadedCount(prev => prev + 1);
          console.warn(`Failed to preload image: ${src}`);
          resolve();
        };
      });
    };
    
    // Preload all assets in parallel
    Promise.all(assetsToPreload.map(preloadImage))
      .then(() => {
        sessionStorage.setItem('preloadedAssets', 'true');
        onComplete();
      });
  }, [onComplete]);
  
  return null;
};

export default AssetPreloader;