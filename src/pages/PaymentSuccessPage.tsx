import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../components/Button';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { 
    transactionId?: string;
    authCode?: string;
    orderTotal?: number;
  } | null;

  // Redirect if accessed directly without state
  if (!state) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Payment Successful</h1>
          <p className="text-xl text-gray-300 mb-8">
            Thank you for your order! We'll begin processing it right away.
          </p>
          
          <div className="bg-gunmetal p-6 rounded-sm mb-8">
            <div className="space-y-3 text-left">
              {state.transactionId && (
                <p className="text-gray-400">
                  Transaction ID: <span className="text-white">{state.transactionId}</span>
                </p>
              )}
              {state.authCode && (
                <p className="text-gray-400">
                  Authorization Code: <span className="text-white">{state.authCode}</span>
                </p>
              )}
              {state.orderTotal && (
                <p className="text-gray-400">
                  Total Amount: <span className="text-white">${state.orderTotal.toFixed(2)}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button to="/account/orders" variant="primary">
              View Order Status
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

export default PaymentSuccessPage;