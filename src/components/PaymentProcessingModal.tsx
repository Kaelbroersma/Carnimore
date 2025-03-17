import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface PaymentProcessingModalProps {
  isOpen: boolean;
  status: 'processing' | 'success' | 'error';
  message?: string | null;
  transactionId?: string;
  orderId?: string;
  authCode?: string;
  redirectDelay?: number; // Default is now 5000ms (5 seconds) for success/error states
}

const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  isOpen,
  status,
  message,
  transactionId,
  orderId,
  authCode,
  redirectDelay = 5000
}) => {
  // Determine message based on status if none provided
  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'processing':
        return 'Please wait while we process your payment...';
      case 'success':
        return 'Your payment has been processed successfully.';
      case 'error':
        return 'An error occurred while processing your payment. Please try again.';
    }
  };

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
              {status === 'processing' && (
                <>
                  <Loader className="w-16 h-16 text-tan animate-spin mb-4" />
                  <h2 className="text-xl font-bold mb-2">Processing Payment</h2>
                  <div className="space-y-2">
                    <p className="text-gray-400">Please wait while we process your payment...</p>
                    <p className="text-sm text-gray-400">This may take a couple of minutes to complete.</p>
                    <p className="text-sm text-gray-400">Do not refresh or close this page.</p>
                    <p className="text-sm text-gray-400">Your order ID: {orderId}</p>
                  </div>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h2 className="text-xl font-bold mb-2">Payment Approved</h2>
                  <div className="space-y-2">
                    <p className="text-gray-400">{getStatusMessage()}</p>
                    {orderId && (
                      <p className="text-sm text-gray-400">Order ID: {orderId}</p>
                    )}
                    {transactionId && (
                      <p className="text-sm text-gray-400">Transaction ID: {transactionId}</p>
                    )}
                    {authCode && (
                      <p className="text-sm text-gray-400">Auth Code: {authCode}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-4">
                      Redirecting to confirmation page in {Math.ceil(redirectDelay/1000)} seconds...
                    </p>
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                  <h2 className="text-xl font-bold mb-2">
                    {message?.toLowerCase().includes('declined') ? 'Payment Declined' : 
                     message?.toLowerCase().includes('unable') ? 'Payment Unprocessed' : 
                     'Payment Failed'}
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-400">{getStatusMessage()}</p>
                    {orderId && (
                      <p className="text-sm text-gray-400">Order ID: {orderId}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-4">
                      {message?.toLowerCase().includes('unable') ?
                        'Please try your payment again in a few moments.' :
                        'Please check your payment details and try again.'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Redirecting in {Math.ceil(redirectDelay/1000)} seconds...
                    </p>
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