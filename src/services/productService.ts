import { callNetlifyFunction } from '../lib/supabase';
import type { Product, Result, Category } from '../types/database';

export const productService = {
  async getProductsByCategory(categorySlug: string): Promise<Result<Product[]>> {
    try {
      const result = await callNetlifyFunction('getProducts', { categorySlug });

      if (result.error) {
        throw new Error(result.error);
      }

      // Sort images by order for each product
      const productsWithSortedImages = result.data?.map(product => ({
        ...product,
        images: product.images
          ?.sort((a, b) => a.image_order - b.image_order)
      }));

      return { data: productsWithSortedImages || [], error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Failed to fetch products',
          details: error.message
        }
      };
    }
  },

  async getProductBySlug(productSlug: string): Promise<Result<Product>> {
    try {
      const result = await callNetlifyFunction('getProduct', { productSlug });

      if (result.error) {
        throw new Error(result.error);
      }

      // Sort images by order
      const productWithSortedImages = result.data ? {
        ...result.data,
        images: result.data.images?.sort((a, b) => a.image_order - b.image_order)
      } : null;

      return { data: productWithSortedImages, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Failed to fetch product',
          details: error.message
        }
      };
    }
  },

  async getCategories(): Promise<Result<Category[]>> {
    try {
      const result = await callNetlifyFunction('getCategories');

      if (result.error) {
        throw new Error(result.error);
      }

      return { data: result.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: 'Failed to fetch categories',
          details: error.message
        }
      };
    }
  }
};