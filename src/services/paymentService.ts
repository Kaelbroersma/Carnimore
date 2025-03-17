import type { Result } from '../types/database';
import type { PaymentData, PaymentResult } from '../types/payment';
import { callNetlifyFunction } from '../lib/supabase';

const formatAmount = (amount: number): string => {
  return Number(amount).toFixed(2).replace(/^(\d)\./, '0$1.');
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
      // Validate input data
      if (!data.cardNumber || !data.expiryMonth || !data.expiryYear || !data.cvv || !data.amount || !data.orderId) {
        throw new Error('Missing required payment fields');
      }

      // Format card number
      const cardNumber = data.cardNumber.replace(/\s+/g, '');
      
      // Validate card number
      if (!/^\d{15,16}$/.test(cardNumber)) {
        throw new Error('Invalid card number format');
      }

      // Validate expiry date
      const month = parseInt(data.expiryMonth);
      if (month < 1 || month > 12) {
        throw new Error('Invalid expiry month');
      }
      
      const expiryMonth = month.toString().padStart(2, '0');

      // Validate CVV
      if (!/^\d{3,4}$/.test(data.cvv)) {
        throw new Error('Invalid CVV format');
      }

      // Format amount
      const formattedAmount = formatAmount(Number(data.amount));

      // Send payment request
      const result = await callNetlifyFunction('process-payment', {
        cardNumber,
        expiryMonth,
        expiryYear: data.expiryYear.slice(-2),
        cvv: data.cvv,
        amount: formattedAmount,
        orderId: data.orderId,
        address: data.address,
        zip: data.zip
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