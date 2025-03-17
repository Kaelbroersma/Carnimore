import { create } from 'zustand';
import { productService } from '../services/productService';
import type { Product } from '../types/database';

interface MerchState {
  products: Product[];
  selectedProduct: Product | null;
  selectedSize: string | null;
  selectedColor: string | null;
  loading: boolean;
  error: string | null;
  fetchProducts: (categorySlug: string) => Promise<void>;
  fetchProduct: (productSlug: string) => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedSize: (size: string | null) => void;
  setSelectedColor: (color: string | null) => void;
  clearSelections: () => void;
  clearProducts: () => void;
}

export const useMerchStore = create<MerchState>((set, get) => ({
  products: [],
  selectedProduct: null,
  selectedSize: null,
  selectedColor: null,
  loading: false,
  error: null,

  fetchProducts: async (categorySlug) => {
    set({ loading: true, error: null });
    try {
      const result = await productService.getProductsByCategory(categorySlug);
      if (result.error) throw new Error(result.error.message);
      set({ products: result.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProduct: async (productSlug) => {
    // Check if we already have this product
    const existingProduct = get().products.find(p => p.slug === productSlug);
    if (existingProduct) {
      set({ selectedProduct: existingProduct });
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const result = await productService.getProductBySlug(productSlug);
      if (result.error) throw new Error(result.error.message);
      if (result.data) {
        set({ selectedProduct: result.data, loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedProduct: (product) => set({ 
    selectedProduct: product,
    selectedSize: null,
    selectedColor: null
  }),

  setSelectedSize: (size) => set({ selectedSize: size }),
  setSelectedColor: (color) => set({ selectedColor: color }),

  clearSelections: () => set({
    selectedProduct: null,
    selectedSize: null,
    selectedColor: null
  }),

  clearProducts: () => set({
    products: [],
    selectedProduct: null,
    selectedSize: null,
    selectedColor: null
  })
}));