import type { Result } from '../types/database';
import type { PaymentData, PaymentResult } from '../types/payment';
import { callNetlifyFunction } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const paymentService = {
  async processPayment(data: PaymentData): Promise<Result<PaymentResult>> {
    const user = useAuthStore.getState().user;
    let subscription: any;
    let timeout: NodeJS.Timeout;

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
      
      // Parse initial response
      const result = await response.json();

      // Log any initial errors but don't throw yet
      if (!response.ok || result.error) {
        console.warn('Initial payment response indicates potential issue:', {
          ok: response.ok,
          error: result.error
        });
      }

      // Set up subscription to wait for final status
      const finalStatus = await new Promise<string>((resolve, reject) => {
        let timeout: NodeJS.Timeout;
        
        subscription = this.subscribeToOrder(data.orderId, (status) => {
          if (status === 'paid' || status === 'failed') {
            clearTimeout(timeout);
            resolve(status);
          }
        });

        // Set a timeout of 3 minutes
        timeout = setTimeout(() => {
          reject(new Error('Payment processing timeout'));
        }, 180000);
      });

      if (finalStatus === 'failed') {
        throw new Error('Payment was declined');
      }
      
      // Now we can determine the final outcome
      if (finalStatus === 'paid') {
        return {
          data: {
            orderId: data.orderId,
            status: 'paid',
            message: 'Payment successful'
          },
          error: null
        };
      } else {
        throw new Error('Payment was declined');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Failed to process payment',
          details: error.stack
        }
      };
    } finally {
      // Cleanup subscription if it exists
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  },

  async subscribeToOrder(orderId: string, callback: (status: string) => void) {
    try {
      // Initial delay to allow order creation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const checkOrderStatus = async () => {
        try {
          const result = await callNetlifyFunction('subscribe-to-order', { orderId });
          
          // Call callback with status
          callback(result.data?.status || 'pending');
          
          // If payment is completed or failed, stop polling
          if (['paid', 'failed'].includes(result.data?.status)) {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Failed to check order status:', error);
        }
      };

      // Check immediately
      await checkOrderStatus();

      // Poll every 3 seconds
      const interval = setInterval(checkOrderStatus, 3000);

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