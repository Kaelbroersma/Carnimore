import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar as CalendarIcon, Lock, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { paymentService } from '../../services/paymentService';
import type { PaymentData } from '../../types/payment';

interface PaymentFormProps {
  onSubmit: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const { items, getCartTotal } = useCartStore();
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '01',
    expiryYear: '2025',
    cvv: '',
    address: '',
    zip: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Format card number by removing spaces
      const cardNumber = formData.cardNumber.replace(/\s+/g, '');

      const paymentData: PaymentData = {
        cardNumber,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        amount: total,
        address: formData.address,
        zip: formData.zip
      };

      const result = await paymentService.processPayment(paymentData);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data?.success) {
        onSubmit();
      } else {
        throw new Error(result.data?.message || 'Payment failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => {
    const year = (currentYear + i).toString();
    return { value: year, label: year };
  });

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-gunmetal p-6 rounded-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-sm p-4 mb-6 flex items-start">
          <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-dark-gray p-6 rounded-sm mb-6">
        <h3 className="font-heading text-xl font-bold mb-4">Order Summary</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.quantity}x {item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gunmetal-light pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-tan">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-heading text-xl font-bold mb-6">Payment Information</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Billing Address <span className="text-tan">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ZIP Code <span className="text-tan">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.zip}
            onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <CreditCard size={16} className="mr-2 text-tan" />
            Card Number
          </label>
          <input
            type="text"
            required
            maxLength={19}
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              cardNumber: formatCardNumber(e.target.value)
            }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <CalendarIcon size={16} className="mr-2 text-tan" />
              Expiry Date
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={formData.expiryMonth}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expiryMonth: e.target.value
                }))}
                className="bg-dark-gray border border-gunmetal-light rounded-sm px-2 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select
                value={formData.expiryYear}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expiryYear: e.target.value
                }))}
                className="bg-dark-gray border border-gunmetal-light rounded-sm px-2 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <Lock size={16} className="mr-2 text-tan" />
              CVV
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
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-tan text-black hover:bg-opacity-90 font-medium transition-all duration-300 angular-button px-6 py-3"
        >
          {loading ? 'Processing...' : 'Complete Payment'}
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-400 text-center">
        Your payment information is securely processed.<br />
        We do not store your card details.
      </p>
    </motion.form>
  );
};

export default PaymentForm;