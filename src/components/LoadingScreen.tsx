import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import AssetPreloader from './AssetPreloader';

interface LoadingScreenProps {
  isLoading: boolean;
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, onLoadingComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Steps for the loading process
  const steps = [
    "Initializing Scan",
    "Verifying Identity",
    "Access Verification"
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle scan animation completion
  const handleScanComplete = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 2 && !animationComplete) {
      setAnimationComplete(true);
      // Add a delay before signaling completion to allow for exit animation
      setTimeout(() => {
        // Only complete loading if assets are also loaded
        if (assetsLoaded) {
          onLoadingComplete();
        }
      }, 1000);
    }
  };

  // Handle asset preloading completion
  const handleAssetsLoaded = () => {
    setAssetsLoaded(true);
    // If animation is already complete, signal loading completion
    if (animationComplete) {
      setTimeout(() => {
        onLoadingComplete();
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { 
              duration: 0.8,
              ease: "easeInOut",
              delay: 0.2
            }
          }}
        >
          {/* Preload assets in the background */}
          <AssetPreloader onComplete={handleAssetsLoaded} />
          
          <motion.div
            className="relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: 1,
              opacity: 1
            }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut"
            }}
            exit={{ 
              scale: 1.1,
              opacity: 0,
              transition: { duration: 0.5 }
            }}
          >
            {/* Logo container with scan effect */}
            <div className="relative overflow-hidden">
              <Logo size={isMobile ? "medium" : "large"} disableAnimation={true} />
              
              {/* Scanning line effect - one scan per step */}
              {!animationComplete && (
                <motion.div 
                  key={`scan-${currentStep}`}
                  className="absolute top-0 left-0 w-full h-1 bg-tan opacity-70"
                  initial={{ top: "-5%" }}
                  animate={{ top: "105%" }}
                  transition={{ 
                    duration: isMobile ? 1.2 : 1.5, 
                    ease: "linear",
                  }}
                  onAnimationComplete={handleScanComplete}
                />
              )}
              
              {/* Final pulse effect that triggers when all scans are complete */}
              {animationComplete && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-tan/20"
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.5],
                    opacity: [0, 0.6, 0]
                  }}
                  transition={{ 
                    duration: 0.8,
                    times: [0, 0.5, 1]
                  }}
                />
              )}
              
              {/* Subtle glow effect throughout the animation */}
              <motion.div 
                className="absolute inset-0 bg-tan/10 blur-md"
                animate={{ 
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
            
            {/* Status text that changes based on scan progress */}
            <motion.div className="text-center mt-6">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={`step-${currentStep}`}
                  className={`text-tan ${isMobile ? 'text-xs' : 'text-sm'} tracking-[0.3em] uppercase h-5`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {animationComplete ? "Access Granted" : steps[currentStep]}
                </motion.p>
              </AnimatePresence>
              
              {/* Progress indicator */}
              <div className="flex justify-center mt-3 space-x-2">
                {[0, 1, 2].map((index) => (
                  <motion.div 
                    key={index}
                    className={`h-1 ${isMobile ? 'w-3' : 'w-4'} bg-tan/30`}
                    animate={{ 
                      backgroundColor: currentStep >= index ? 'rgb(190, 169, 135)' : 'rgba(190, 169, 135, 0.3)'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;