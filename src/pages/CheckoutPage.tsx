import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Truck, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import PaymentProcessingModal from '../components/PaymentProcessingModal';
import { paymentService } from '../services/paymentService';
import type { PaymentData } from '../types/payment';
import Button from '../components/Button';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, clearCart } = useCartStore();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup subscriptions and timeouts
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePaymentUpdate = async (data: any) => {
    // Clear timeout since we got a response
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (data.success) {
      setPaymentStatus('success');
      setResult(data);
      
      // Show success state for 5 seconds then redirect
      await new Promise(resolve => setTimeout(resolve, 5000));
      clearCart();
      navigate('/payment/success', { 
        state: { 
          transactionId: data.transactionId,
          authCode: data.authCode,
          orderTotal: total,
          orderId: data.orderId
        }
      });
    } else if (data.status === 'declined') {
      setPaymentStatus('error');
      setError(data.message || 'Payment was declined. Please check your card details and try again.');
      setResult(data);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      navigate('/payment/declined', {
        state: { message: data.message }
      });
    } else {
      setPaymentStatus('error');
      setError(data.message || 'Unable to process payment at this time. Please try again in a few moments.');
      setResult(data);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      navigate('/payment/error', {
        state: { message: data.message }
      });
    }
  };
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [billingInfo, setBillingInfo] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    email: '',
    phone: '',
    sameAsShipping: true
  });

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
        return `Colors: ${value}`;
      case 'size':
        return `Size: ${value}`;
      default:
        return '';
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    // Split into groups of 4
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setShowProcessingModal(true);
    setPaymentStatus('processing');
    setLoading(true);
    setError(null);
    
    const orderId = crypto.randomUUID(); 

    try {
      // Format card number by removing spaces
      const cardNumber = formData.cardNumber.replace(/\s+/g, '');
      
      // Extract month and year from expiry date
      const [expiryMonth, expiryYear] = formData.expiryDate?.split('/') || [];
      
      if (!expiryMonth || !expiryYear) {
        throw new Error('Invalid expiry date format');
      }
      
      const paymentData: PaymentData = {
        cardNumber,
        expiryMonth: expiryMonth.trim(),
        expiryYear: `20${expiryYear.trim()}`, // Convert to full year
        cvv: formData.cvv,
        orderId: orderId, // Use the generated orderId
        amount: total,
        address: billingInfo.sameAsShipping ? formData.address : billingInfo.address,
        zip: billingInfo.sameAsShipping ? formData.zipCode : billingInfo.zipCode
      };

      const result = await paymentService.processPayment(paymentData);

      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Set initial state with orderId
      setResult({ orderId: result.data.orderId });

      // Subscribe to payment updates
      unsubscribeRef.current = paymentService.subscribeToPaymentUpdates(
        result.data.orderId,
        handlePaymentUpdate
      );

      // Set a timeout to show error if no postback received
      timeoutRef.current = setTimeout(() => {
        setPaymentStatus('error');
        setError('Payment processing timeout. Please check your email for confirmation or contact support if the charge appears on your card.');
        navigate('/payment/error', {
          state: { message: 'Payment processing timeout' }
        });
      }, 120000); // 2 minute timeout

    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentStatus('error');
      setError(err.message || 'An unexpected error occurred. Please try again.');
      await new Promise(resolve => setTimeout(resolve, 5000));
      navigate('/payment/error', {
        state: { message: err.message }
      });
    } finally {  
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-8">Add some items to your cart before proceeding to checkout.</p>
            <Button to="/shop" variant="primary">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <PaymentProcessingModal 
        isOpen={showProcessingModal}
        status={paymentStatus}
        orderId={result?.orderId}
        message={error || result?.message}
        transactionId={result?.transactionId}
        authCode={result?.authCode}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-sm p-4 mb-6 flex items-start">
              <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-tan transition-colors mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-gunmetal p-6 rounded-sm shadow-luxury mb-8">
                <h1 className="font-heading text-2xl font-bold mb-6">Checkout</h1>
                
                {/* Progress Steps */}
                <div className="flex items-center mb-8">
                  <div className={`flex-1 h-1 ${step === 'details' ? 'bg-tan' : 'bg-gunmetal-light'}`}></div>
                  <div className={`flex-1 h-1 ${step === 'payment' ? 'bg-tan' : 'bg-gunmetal-light'}`}></div>
                </div>

                <form onSubmit={handleSubmit}>
                  {step === 'details' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            First Name <span className="text-tan">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Last Name <span className="text-tan">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Email Address <span className="text-tan">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={billingInfo.email}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Shipping Address <span className="text-tan">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            City <span className="text-tan">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            State <span className="text-tan">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            ZIP <span className="text-tan">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.zipCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Phone Number <span className="text-tan">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          onClick={() => {
                            // Auto-fill billing info and name on card when moving to payment step
                            if (billingInfo.sameAsShipping) {
                              setBillingInfo(prev => ({
                                ...prev,
                                address: formData.address,
                                city: formData.city,
                                state: formData.state,
                                zipCode: formData.zipCode
                              }));
                            }
                            setFormData(prev => ({
                              ...prev,
                              nameOnCard: `${prev.firstName} ${prev.lastName}`
                            }));
                            setStep('payment');
                          }}
                          type="button"
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-4 mb-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={billingInfo.sameAsShipping || false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setBillingInfo(prev => ({
                                ...prev,
                                sameAsShipping: isChecked,
                                // If checked, copy shipping address
                                ...(isChecked ? {
                                  address: formData.address,
                                  city: formData.city,
                                  state: formData.state,
                                  zipCode: formData.zipCode
                                } : {})
                              }));
                              // If checked, also set name on card
                              if (isChecked) {
                                setFormData(prev => ({
                                  ...prev,
                                  nameOnCard: `${prev.firstName} ${prev.lastName}`
                                }));
                              }
                            }}
                            className="form-checkbox text-tan rounded-sm"
                          />
                          <span className="text-gray-300">Billing address same as shipping</span>
                        </label>

                        {!billingInfo.sameAsShipping && (
                          <div className="space-y-4 pt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Billing Address <span className="text-tan">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={billingInfo.address}
                                onChange={(e) => setBillingInfo(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                              />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  City <span className="text-tan">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={billingInfo.city}
                                  onChange={(e) => setBillingInfo(prev => ({ ...prev, city: e.target.value }))}
                                  className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  State <span className="text-tan">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={billingInfo.state}
                                  onChange={(e) => setBillingInfo(prev => ({ ...prev, state: e.target.value }))}
                                  className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  ZIP <span className="text-tan">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={billingInfo.zipCode}
                                  onChange={(e) => setBillingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                                  className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Name on Card <span className="text-tan">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nameOnCard}
                          onChange={(e) => setFormData(prev => ({ ...prev, nameOnCard: e.target.value }))}
                          className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Card Number <span className="text-tan">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={19} // Allows for spaces in 16-digit cards
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            cardNumber: formatCardNumber(e.target.value)
                          }))}
                          className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Expiry Date <span className="text-tan">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              expiryDate: formatExpiryDate(e.target.value)
                            }))}
                            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            CVV <span className="text-tan">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={4}
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              cvv: e.target.value.replace(/\D/g, '')
                            }))}
                            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setStep('details')}
                          type="button"
                        >
                          Back to Details
                        </Button>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? 'Processing Payment...' : 'Complete Order'}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gunmetal p-6 rounded-sm shadow-luxury sticky top-24">
                <h2 className="font-heading text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-start">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-sm"
                        />
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium">{item.name.split(' - ')[0]}</h3>
                          {/* Display options as line items */}
                          {item.options && Object.entries(item.options).map(([key, value]) => (
                            value && (
                              <p key={key} className="text-sm text-gray-400">
                                {formatOptionLabel(key, value)}
                              </p>
                            )
                          ))}
                          <p className="text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-tan">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gunmetal-light pt-4 space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gunmetal-light">
                    <span>Total</span>
                    <span className="text-tan">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Shield size={16} className="mr-2 text-tan" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center">
                    <Truck size={16} className="mr-2 text-tan" />
                    <span>Free shipping on all orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage