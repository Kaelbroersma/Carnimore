import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

const AuthButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, loading } = useAuthStore();

  // Don't show anything while loading
  if (loading) return null;

  // If user is logged in, show user menu
  if (user) {
    return <UserMenu />;
  }

  // Otherwise show login button
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-white hover:text-tan transition-colors"
      >
        <User size={20} />
      </button>

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default AuthButton;