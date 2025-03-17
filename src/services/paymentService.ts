import { createClient } from '@supabase/supabase-js';
import type { Result } from '../types/database';
import type { PaymentData, PaymentResult } from '../types/payment';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const paymentService = {
  subscribeToOrder(orderId: string, callback: (status: string) => void) {
    return supabase
      .channel('order_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          callback(payload.new.payment_status);
        }
      )
      .subscribe();
  },

  async processPayment(data: PaymentData): Promise<Result<PaymentResult>> {
    try {
      // Validate input data
      if (!data.cardNumber || !data.expiryMonth || !data.expiryYear || !data.cvv || !data.amount || !data.orderId) {
        throw new Error('Missing required payment fields');
      }

      // Format card number by removing spaces
      const cardNumber = data.cardNumber.replace(/\s+/g, '');
      
      // Validate card number format
      if (!/^\d{15,16}$/.test(cardNumber)) {
        throw new Error('Invalid card number format');
      }

      // Validate expiry date
      const month = parseInt(data.expiryMonth);
      if (month < 1 || month > 12) {
        throw new Error('Invalid expiry month');
      }
      
      // Format month to 2 digits
      const expiryMonth = month.toString().padStart(2, '0');

      // Validate CVV
      if (!/^\d{3,4}$/.test(data.cvv)) {
        throw new Error('Invalid CVV format');
      }

      // Format amount to 2 decimal places
      const formattedAmount = Number(data.amount).toFixed(2);

      // Send payment request to Netlify function
      const response = await fetch('/.netlify/functions/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardNumber,
          expiryMonth,
          expiryYear: data.expiryYear.slice(-2), // Convert to 2-digit year
          cvv: data.cvv,
          amount: formattedAmount,
          orderId: data.orderId,
          address: data.address,
          zip: data.zip
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      // Return initial response with orderId
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