import { create } from 'zustand';
import { productService } from '../services/productService';
import type { Product, Category } from '../types/database';

interface ProductState {
  products: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  selectedCaliber: string | null;
  selectedOptions: Record<string, any>;
  colors: number;
  loading: boolean;
  error: string | null;
  fetchProducts: (categorySlug: string) => Promise<void>;
  fetchProduct: (productSlug: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedCaliber: (caliber: string | null) => void;
  setSelectedOption: (key: string, value: any) => void;
  setColors: (count: number) => void;
  calculateTotalPrice: () => number;
  clearSelections: () => void;
  clearProducts: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  selectedProduct: null,
  selectedCaliber: null,
  selectedOptions: {},
  colors: 1,
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
    // Check if we already have this product in the store
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

  fetchCategories: async () => {
    // Don't fetch if we already have categories
    if (get().categories.length > 0) return;
    
    set({ loading: true, error: null });
    try {
      const result = await productService.getCategories();
      if (result.error) throw new Error(result.error.message);
      set({ categories: result.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedProduct: (product) => set({ 
    selectedProduct: product,
    selectedCaliber: null,
    selectedOptions: {},
    colors: 1
  }),

  setSelectedCaliber: (caliber) => set({ selectedCaliber: caliber }),

  setSelectedOption: (key, value) => set((state) => ({
    selectedOptions: {
      ...state.selectedOptions,
      [key]: value
    }
  })),

  setColors: (count) => set({ colors: Math.min(Math.max(1, count), 5) }),

  calculateTotalPrice: () => {
    const { selectedProduct, selectedOptions } = get();
    if (!selectedProduct) return 0;

    let total = selectedProduct.price;

    // Add option prices
    if (selectedOptions.longAction) total += 150;
    if (selectedOptions.deluxeVersion) total += 300;

    return total;
  },

  clearSelections: () => set({
    selectedProduct: null,
    selectedCaliber: null,
    selectedOptions: {},
    colors: 1
  }),

  clearProducts: () => set({
    products: [],
    selectedProduct: null,
    selectedCaliber: null,
    selectedOptions: {},
    colors: 1
  })
}));