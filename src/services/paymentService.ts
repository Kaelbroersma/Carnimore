import type { Result } from '../types/database';
import type { PaymentData, PaymentResult } from '../types/payment';
import { callNetlifyFunction } from '../lib/supabase';

const formatCardNumber = (cardNumber: string): string => {
  return cardNumber.replace(/\s+/g, '');
};

const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  return /^\d{15,16}$/.test(digits);
};

const validateExpiryDate = (month: string, year: string): boolean => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
};

const validateCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv);
};

const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};

export const paymentService = {
  async subscribeToOrder(orderId: string, callback: (status: string) => void) {
    try {
      // Subscribe to order status changes via Netlify function
      const result = await callNetlifyFunction('subscribe-to-order', { orderId });
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      // Return unsubscribe function
      return {
        unsubscribe: () => {
          // Cleanup subscription
          callNetlifyFunction('unsubscribe-from-order', { orderId });
        }
      };
    } catch (error) {
      console.error('Failed to subscribe to order:', error);
      throw error;
    }
  },

  async processPayment(data: PaymentData): Promise<Result<PaymentResult>> {
    try {
      // Validate required fields
      if (!data.cardNumber || !data.expiryMonth || !data.expiryYear || !data.cvv || !data.amount || !data.orderId || !data.shippingAddress) {
        throw new Error('All payment fields are required');
      }

      // Format and validate card number
      const cardNumber = formatCardNumber(data.cardNumber);
      if (!validateCardNumber(cardNumber)) {
        throw new Error('Invalid card number');
      }
      
      // Validate expiry date
      if (!validateExpiryDate(data.expiryMonth, data.expiryYear)) {
        throw new Error('Invalid expiry date');
      }
      
      // Validate CVV
      if (!validateCVV(data.cvv)) {
        throw new Error('Invalid CVV');
      }
      
      // Format expiry month to ensure 2 digits
      const expiryMonth = data.expiryMonth.padStart(2, '0');
      
      // Format amount
      const formattedAmount = formatAmount(data.amount);
      
      // Validate shipping address
      if (!data.shippingAddress.address.trim() || !data.shippingAddress.zipCode.trim()) {
        throw new Error('Shipping address and ZIP code are required');
      }

      // Send payment request
      const result = await callNetlifyFunction('process-payment', {
        cardNumber,
        expiryMonth,
        expiryYear: data.expiryYear.slice(-2),
        cvv: data.cvv,
        amount: formattedAmount,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        orderId: data.orderId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        data: {
          orderId: data.orderId,
          status: 'pending',
          message: 'Payment processing initiated'
        },
        error: null
      };

    } catch (error: any) {
      console.error('Payment error:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Failed to process payment',
          details: error.stack
        }
      };
    }
  }
};