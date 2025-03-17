import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

interface AgeVerificationProps {
  onAccept: () => void;
  onDecline: () => void;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Check if user has already verified age
  useEffect(() => {
    const hasVerified = localStorage.getItem('ageVerified');
    if (hasVerified === 'true') {
      onAccept();
      setIsVisible(false);
    }
  }, [onAccept]);
  
  const handleAccept = () => {
    localStorage.setItem('ageVerified', 'true');
    setIsVisible(false);
    onAccept();
  };
  
  const handleDecline = () => {
    setIsVisible(false);
    onDecline();
  };

  // Early return if not visible
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4"
    >
      <div
        className="bg-black max-w-lg w-full rounded-sm p-6 md:p-8 border border-tan/20"
      >
        <div className="flex justify-center mb-6">
          <Logo size="small" disableAnimation={true} />
        </div>
        
        <h2 className="font-heading text-xl md:text-2xl font-bold text-center mb-4 text-white">
          Age Verification Required
        </h2>
        
        <div className="h-px bg-tan/30 w-full mb-4 md:mb-6"></div>
        
        <p className="text-white mb-4 md:mb-6 text-center text-sm md:text-base">
          Welcome to Carnimore. You must be at least 21 years old to view our custom craftsmanship. 
          By continuing, you agree to our cookie policy.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDecline}
            className="bg-red-900 text-white hover:bg-red-800 font-medium transition-all duration-200 px-6 py-3 text-base rounded-sm"
          >
            I'll Pass
          </button>
          
          <button
            onClick={handleAccept}
            className="bg-tan text-black hover:bg-tan/90 font-medium transition-all duration-200 px-6 py-3 text-base rounded-sm"
          >
            I'm 21+ & Ready
          </button>
        </div>
        
        <div className="mt-4 md:mt-6 text-center">
          <p className="text-white text-xs md:text-sm">
            By clicking "I'm 21+ & Ready", you confirm that you are of legal age.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;