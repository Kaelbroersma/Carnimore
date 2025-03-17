import { callNetlifyFunction } from '../lib/supabase';
import type { Option, OptionValue, ProductOption, Result } from '../types';

export const optionService = {
  async getProductOptions(productId: string): Promise<Result<ProductOption[]>> {
    try {
      const result = await callNetlifyFunction('getProductOptions', { productId });

      if (result.error) {
        throw new Error(result.error);
      }

      return { data: result.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Failed to fetch product options',
          details: error.message
        }
      };
    }
  },

  async getCategoryOptions(categoryId: string): Promise<Result<Option[]>> {
    try {
      const result = await callNetlifyFunction('getCategoryOptions', { categoryId });

      if (result.error) {
        throw new Error(result.error);
      }

      return { data: result.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Failed to fetch category options',
          details: error.message
        }
      };
    }
  },

  async getOptionValues(optionId: string): Promise<Result<OptionValue[]>> {
    try {
      const result = await callNetlifyFunction('getOptionValues', { optionId });

      if (result.error) {
        throw new Error(result.error);
      }

      return { data: result.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Failed to fetch option values',
          details: error.message
        }
      };
    }
  }
};