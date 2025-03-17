import type { Result } from '../types/database';
import type { PaymentData, PaymentResult, EPNResponse } from '../types/payment';

const formatAmount = (amount: number): string => {
  // Ensure amount has 2 decimal places and leading 0 if under $1
  return Number(amount).toFixed(2).replace(/^(\d)\./, '0$1.');
};

export const paymentService = {
  subscribeToPaymentUpdates(orderId: string, callback: (data: any) => void) {
    // Create Supabase realtime subscription
    const supabase = createClient(
      import.meta.env.SUPABASE_URL,
      import.meta.env.SUPABASE_ANON_KEY
    );

    // Subscribe to payment_logs table for this order
    const subscription = supabase
      .channel('payment_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_logs',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          // Extract payment status from payload
          const status = payload.new.payment_status;
          const response = payload.new.processor_response;
          
          callback({
            success: status === 'completed',
            status: status === 'completed' ? 'approved' :
                    status === 'failed' ? 'declined' : 'pending',
            message: response?.RespText || response?.Response,
            transactionId: response?.XactID || response?.TransactionID,
            authCode: response?.AuthCode,
            orderId: payload.new.order_id
          });
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  },

  async processPayment(data: PaymentData): Promise<Result<PaymentResult>> {
    try {
      // Validate input data
      if (!data.cardNumber || !data.expiryMonth || !data.expiryYear || !data.cvv || !data.amount || !data.orderId) {
        throw new Error('Missing required payment fields');
      }

      // Format expiry year to 2 digits
      const expiryYear = data.expiryYear.slice(-2);
      
      // Format card number by removing spaces
      const cardNumber = data.cardNumber.replace(/\s+/g, '');
      
      // Validate card number using Luhn algorithm
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

      // Format amount according to EPN requirements
      const formattedAmount = formatAmount(Number(data.amount));

      // Send payment request - don't wait for response
      await fetch('/.netlify/functions/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          cardNumber,
          expiryMonth,
          expiryYear,
          amount: formattedAmount
        })
      });

      // Return initial response with orderId
      return {
        data: {
          orderId: data.orderId
        },
        error: null
      };

    } catch (error: any) {
      console.error('Payment error:', error.message);

      return {
        data: null,
        error: { message: 'Failed to send payment request. Please try again.' }
      };
    }
  }
};
