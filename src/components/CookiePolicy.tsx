import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CookiePolicyProps {
  onAccept: () => void;
  onDecline: () => void;
}

const CookiePolicy: React.FC<CookiePolicyProps> = ({ onAccept, onDecline }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOpen = () => setIsOpen(!isOpen);
  
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-gunmetal z-50 p-4 shadow-luxury"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-heading text-lg font-bold mb-2">Cookie Policy</h3>
            <p className="text-gray-300 text-sm">
              This website uses cookies to enhance your browsing experience. 
              <button 
                onClick={toggleOpen} 
                className="text-tan underline ml-1 focus:outline-none"
              >
                Learn more
              </button>
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="bg-gunmetal-light text-white hover:bg-opacity-90 font-medium transition-all duration-300 px-4 py-2 text-sm rounded-sm"
            >
              Decline
            </button>
            
            <button
              onClick={onAccept}
              className="bg-tan text-black hover:bg-opacity-90 font-medium transition-all duration-300 px-4 py-2 text-sm rounded-sm"
            >
              Accept All Cookies
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="mt-4 bg-gunmetal-dark p-4 rounded-sm relative"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                onClick={toggleOpen}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
              
              <h4 className="font-heading font-bold mb-2">About Our Cookies</h4>
              <p className="text-gray-300 text-sm mb-2">
                We use different types of cookies for the following purposes:
              </p>
              
              <ul className="text-gray-300 text-sm list-disc pl-5 space-y-1 mb-3">
                <li>Essential cookies: Necessary for the website to function properly</li>
                <li>Analytical cookies: Help us understand how visitors interact with our website</li>
                <li>Marketing cookies: Allow us to deliver personalized content and advertisements</li>
                <li>Preference cookies: Enable the website to remember your preferences</li>
              </ul>
              
              <p className="text-gray-300 text-sm">
                For more information, please visit our <a href="/legal" className="text-tan underline">Privacy Policy</a>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CookiePolicy;