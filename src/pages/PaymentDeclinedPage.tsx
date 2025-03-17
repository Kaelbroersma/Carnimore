import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Button from '../components/Button';

const PaymentDeclinedPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as {
    message?: string;
  } | null;

  // Redirect if accessed directly
  if (!state) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Payment Declined</h1>
          <p className="text-xl text-gray-300 mb-8">
            {state.message || 'Your payment was declined. Please check your card details and try again.'}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button to="/checkout" variant="primary">
              Try Again
            </Button>
            <Button to="/shop" variant="outline">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentDeclinedPage;