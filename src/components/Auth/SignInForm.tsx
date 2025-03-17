import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import Button from '../Button';
import { useMobileDetection } from '../MobileDetection';

interface SignInFormProps {
  onSuccess: () => void;
  onSwitchMode: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSuccess, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMobileDetection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await authService.signIn(formData);
    
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  // Optimized animation variants
  const formVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.2 : 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        duration: isMobile ? 0.15 : 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
      style={{ willChange: 'transform, opacity' }}
    >
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-sm p-3 flex items-start">
          <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>

      <p className="text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-tan hover:underline focus:outline-none"
        >
          Create one
        </button>
      </p>
    </motion.form>
  );
};

export default SignInForm;