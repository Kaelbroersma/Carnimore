import type { Result } from '../types/database';
import type { PaymentData, PaymentResult } from '../types/payment';
import { callNetlifyFunction } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const paymentService = {
  async processPayment(data: PaymentData): Promise<Result<PaymentResult>> {
    const user = useAuthStore.getState().user;

    try {
      // Validate required fields
      if (!data.cardNumber?.trim() || !data.expiryMonth?.trim() || !data.expiryYear?.trim() || 
          !data.cvv?.trim() || !data.amount || !data.orderId || 
          !data.shippingAddress?.address?.trim() || !data.shippingAddress?.zipCode?.trim()) {
        throw new Error('All payment fields are required');
      }

      // Format and validate card number
      const cardNumber = data.cardNumber.replace(/\s+/g, '');
      if (!/^\d{15,16}$/.test(cardNumber)) {
        throw new Error('Invalid card number');
      }
      
      // Validate expiry date
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      const expMonth = parseInt(data.expiryMonth);
      const expYear = parseInt(data.expiryYear);
      
      if (expMonth < 1 || expMonth > 12 || 
          expYear < currentYear || 
          (expYear === currentYear && expMonth < currentMonth)) {
        throw new Error('Invalid expiry date');
      }
      
      // Validate CVV
      if (!/^\d{3,4}$/.test(data.cvv)) {
        throw new Error('Invalid CVV');
      }
      
      // Format expiry month to ensure 2 digits
      const expiryMonth = data.expiryMonth.padStart(2, '0');
      
      // Format amount
      const formattedAmount = data.amount.toFixed(2);
      
      // Validate shipping address
      if (!data.shippingAddress.address.trim() || !data.shippingAddress.zipCode.trim()) {
        throw new Error('Shipping address and ZIP code are required');
      }

      // Prepare payment request data
      const paymentRequest = {
        cardNumber,
        expiryMonth,
        expiryYear: data.expiryYear.slice(-2),
        cvv: data.cvv,
        amount: formattedAmount,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        orderId: data.orderId,
        items: data.items
      };

      // Add authorization header if user is logged in
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      // Send payment request to process-payment function
      const response = await fetch('/.netlify/functions/process-payment', {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment processing failed');
      }

      const result = await response.json();

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
  },

  async subscribeToOrder(orderId: string, callback: (status: string) => void) {
    try {
      // Wait a bit before starting to poll to allow order creation
      await new Promise(resolve => setTimeout(resolve, 5000));

      const checkOrderStatus = async () => {
        try {
          const result = await callNetlifyFunction('subscribe-to-order', { orderId });
          
          // If order not found yet, keep polling
          if (result.error?.message?.includes('order not found')) {
            return; 
          }

          // Call callback with status
          callback(result.data?.status || 'pending');
          
          // If payment is completed or failed, stop polling
          if (['completed', 'failed'].includes(result.data?.status)) {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Failed to check order status:', error);
        }
      };

      // Check immediately
      await checkOrderStatus();

      // Poll every 5 seconds
      const interval = setInterval(checkOrderStatus, 5000);

      // Return cleanup function
      return {
        unsubscribe: () => {
          console.log('Unsubscribing from order updates');
          clearInterval(interval);
        }
      };
    } catch (error) {
      console.error('Failed to subscribe to order:', error);
      throw error;
    }
  }
};