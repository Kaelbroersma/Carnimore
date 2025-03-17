import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { paymentService } from '../services/paymentService';
import PaymentProcessingModal from '../components/PaymentProcessingModal';
import Button from '../components/Button';
import type { PaymentData } from '../types/payment';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, clearCart } = useCartStore();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to order status updates
    let subscription: any;
    
    if (orderId) {
      subscription = paymentService.subscribeToOrder(orderId, (status) => {
        setPaymentStatus(status as 'pending' | 'completed' | 'failed');
        
        // Handle status changes
        switch (status) {
          case 'completed':
            clearCart();
            setTimeout(() => {
              navigate('/payment/success', { 
                state: { orderId } 
              });
            }, 2000);
            break;
            
          case 'failed':
            setTimeout(() => {
              navigate('/payment/error', { 
                state: { orderId } 
              });
            }, 2000);
            break;
        }
      });
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [orderId, navigate, clearCart]);

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
    expiryMonth: '',
    expiryYear: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate new order ID
    const newOrderId = crypto.randomUUID();
    setOrderId(newOrderId);
    setShowProcessingModal(true);

    try {
      const result = await paymentService.processPayment({
        cardNumber: formData.cardNumber,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        amount: total,
        address: billingInfo.sameAsShipping ? formData.address : billingInfo.address,
        zip: billingInfo.sameAsShipping ? formData.zipCode : billingInfo.zipCode,
        orderId: newOrderId
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setError(error.message);
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
        orderId={orderId || ''}
        status={paymentStatus}
        message={error}
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
                            checked={billingInfo.sameAsShipping}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setBillingInfo(prev => ({
                                ...prev,
                                sameAsShipping: isChecked,
                                ...(isChecked ? {
                                  address: formData.address,
                                  city: formData.city,
                                  state: formData.state,
                                  zipCode: formData.zipCode
                                } : {})
                              }));
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
                          maxLength={19}
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            cardNumber: e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim()
                          }))}
                          className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Expiry Date <span className="text-tan">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              maxLength={2}
                              placeholder="MM"
                              value={formData.expiryMonth}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                expiryMonth: e.target.value.replace(/\D/g, '')
                              }))}
                              className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                            />
                            <input
                              type="text"
                              required
                              maxLength={2}
                              placeholder="YY"
                              value={formData.expiryYear}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                expiryYear: e.target.value.replace(/\D/g, '')
                              }))}
                              className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                            />
                          </div>
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
                          <h3 className="font-medium">{item.name}</h3>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;