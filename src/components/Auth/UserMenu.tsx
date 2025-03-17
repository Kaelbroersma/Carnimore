import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogOut, User, Package, Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  if (!user) return null;

  const handleSignOut = async () => {
    await authService.signOut();
    setIsOpen(false);
    // The auth store will automatically update via polling
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-tan transition-colors flex items-center space-x-2"
      >
        <User size={20} />
        <span className="hidden md:inline text-sm">
          {user.user_metadata.first_name}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              className="absolute right-0 mt-2 w-48 bg-gunmetal rounded-sm shadow-luxury z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="p-3 border-b border-gunmetal-light">
                <p className="text-sm text-gray-400">Signed in as</p>
                <p className="font-medium truncate">
                  {user.user_metadata.first_name} {user.user_metadata.last_name}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/account"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gunmetal-light hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} className="mr-2" />
                  Account Settings
                </Link>

                <Link
                  to="/account/orders"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gunmetal-light hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Package size={16} className="mr-2" />
                  Orders
                </Link>

                <Link
                  to="/account/wishlist"
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gunmetal-light hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Heart size={16} className="mr-2" />
                  Wishlist
                </Link>
              </div>

              <div className="border-t border-gunmetal-light py-1">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gunmetal-light hover:text-white transition-colors"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;