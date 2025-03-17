import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader, XCircle } from 'lucide-react';

interface PaymentProcessingModalProps {
  isOpen: boolean;
  orderId: string;
  status: 'pending' | 'paid' | 'failed';
  message?: string;
  onRetry?: () => void;
}

const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  isOpen,
  orderId,
  status,
  message,
  onRetry
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-gunmetal p-8 rounded-sm shadow-luxury max-w-md w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center text-center">
              {status === 'pending' ? (
                <>
                  <Loader className="w-16 h-16 text-tan animate-spin mb-4" />
                  <h2 className="text-xl font-bold mb-2">Processing Payment</h2>
                  <div className="space-y-2">
                    <p className="text-gray-400">Please wait while we process your payment...</p>
                    <p className="text-sm text-gray-400">This may take a moment to complete.</p>
                    <p className="text-sm text-gray-400">Do not refresh or close this page.</p>
                    <p className="text-sm text-gray-400">Order ID: {orderId}</p>
                  </div>
                </>
              ) : status === 'paid' ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h2 className="text-xl font-bold mb-2">Payment Successful</h2>
                  <div className="space-y-2">
                    <p className="text-gray-400">{message || 'Your payment has been processed successfully.'}</p>
                    <p className="text-sm text-gray-400">Order ID: {orderId}</p>
                    <p className="text-sm text-gray-400">Redirecting to confirmation page...</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-500 mb-4" />
                  <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
                  <div className="space-y-2">
                    <p className="text-gray-400">{message || 'There was an error processing your payment. Please try again.'}</p>
                    <p className="text-sm text-gray-400">Order ID: {orderId}</p>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="mt-4 bg-tan text-black hover:bg-opacity-90 font-medium transition-all duration-300 px-6 py-2 text-sm rounded-sm"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentProcessingModal;