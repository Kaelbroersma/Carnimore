import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { useMobileDetection } from '../MobileDetection';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const isMobile = useMobileDetection();

  // Optimized animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.2 : 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: isMobile ? 0.15 : 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: isMobile ? 0.2 : 0.3 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-[440px] bg-gunmetal rounded-sm shadow-luxury"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gunmetal-light">
                <h2 className="font-heading text-2xl font-bold">
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {mode === 'signin' ? (
                    <SignInForm
                      key="signin"
                      onSuccess={onClose}
                      onSwitchMode={() => setMode('signup')}
                    />
                  ) : (
                    <SignUpForm
                      key="signup"
                      onSuccess={onClose}
                      onSwitchMode={() => setMode('signin')}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;