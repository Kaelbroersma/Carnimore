import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

const CartDrawer: React.FC = () => {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Get total from cart store to ensure it matches database
  const total = useCartStore(state => state.getCartTotal());

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const formatOptionLabel = (key: string, value: any): string => {
    switch (key) {
      case 'caliber':
        return `Caliber: ${value}`;
      case 'colors':
        return `Colors: ${value}`;
      case 'longAction':
        return 'Long Action';
      case 'deluxeVersion':
        return 'Deluxe Version';
      case 'grip':
        return `Grip: ${value}`;
      case 'stock':
        return `Stock: ${value}`;
      case 'handGuard':
        return `Handguard: ${value}`;
      case 'color':
        return `Color: ${value}`;
      case 'size':
        return `Size: ${value}`;
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />

          {/* Cart Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full md:w-96 bg-primary z-50 shadow-luxury"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gunmetal flex justify-between items-center">
              <div className="flex items-center">
                <ShoppingCart className="text-tan mr-2" size={24} />
                <h2 className="font-heading text-xl font-bold">Your Cart</h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto h-[calc(100vh-180px)]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <ShoppingCart className="text-gray-500 mb-4" size={48} />
                  <p className="text-gray-400">Your cart is empty</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gunmetal p-4 rounded-sm flex items-start space-x-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-sm"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{item.name}</h3>
                        {/* Display options as line items */}
                        {item.options && Object.entries(item.options).map(([key, value]) => (
                          value && (
                            <p key={key} className="text-sm text-gray-400">
                              {key === 'isDirty' ? 'Extra Cleaning Required' : formatOptionLabel(key, value)}
                            </p>
                          )
                        ))}
                        <p className="text-tan mt-2">${item.price.toFixed(2)}</p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={async () => {
                              const newQuantity = item.quantity - 1;
                              if (newQuantity > 0) {
                                await updateQuantity(item.id, newQuantity);
                              } else {
                                await removeItem(item.id);
                              }
                            }}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="mx-3">{item.quantity}</span>
                          <button
                            onClick={async () => {
                              await updateQuantity(item.id, item.quantity + 1);
                            }}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={async () => await removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gunmetal p-4 bg-primary">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Total</span>
                <span className="text-xl font-bold text-tan">
                  ${total.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                variant="primary"
                fullWidth
                disabled={items.length === 0}
              >
                Proceed to Checkout
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;