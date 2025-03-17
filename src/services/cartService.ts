import { callNetlifyFunction } from '../lib/supabase';
import type { CartItem } from '../store/cartStore';
import type { Result } from '../types/database';

interface CartData {
  items: CartItem[];
  total_value: number;
}

export const cartService = {
  async getCart(userId: string): Promise<Result<CartData>> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await callNetlifyFunction('getCart', { userId });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch cart');
      }

      // Return raw cart data - let store handle validation
      const cartData = {
        items: result.data?.items || [],
        total_value: parseFloat(result.data?.total_value) || 0
      };

      return { data: cartData, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Failed to fetch cart',
          details: error.message
        }
      };
    }
  },

  async updateCart(userId: string, items: CartItem[]): Promise<Result<void>> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!Array.isArray(items)) {
        throw new Error('Items must be an array');
      }

      const result = await callNetlifyFunction('updateCart', {
        userId,
        items // Send entire cart state as-is
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to update cart');
      }

      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Failed to update cart',
          details: error.message
        }
      };
    }
  }
};