import { create } from 'zustand';
import { productService } from '../services/productService';
import type { Product } from '../types/database';

interface DuracoatState {
  services: Product[];
  selectedService: Product | null;
  colors: number;
  isDirty: boolean;
  loading: boolean;
  error: string | null;
  fetchServices: (categorySlug: string) => Promise<void>;
  fetchService: (serviceSlug: string) => Promise<void>;
  setSelectedService: (service: Product | null) => void;
  setColors: (count: number) => void;
  setIsDirty: (isDirty: boolean) => void;
  calculateTotal: () => number;
  clearSelections: () => void;
  clearServices: () => void;
}

export const useDuracoatStore = create<DuracoatState>((set, get) => ({
  services: [],
  selectedService: null,
  colors: 1,
  isDirty: false,
  loading: false,
  error: null,

  fetchServices: async (categorySlug) => {
    set({ loading: true, error: null });
    try {
      const result = await productService.getProductsByCategory(categorySlug);
      if (result.error) throw new Error(result.error.message);
      set({ services: result.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchService: async (serviceSlug) => {
    // Check if we already have this service
    const existingService = get().services.find(s => s.slug === serviceSlug);
    if (existingService) {
      set({ selectedService: existingService });
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const result = await productService.getProductBySlug(serviceSlug);
      if (result.error) throw new Error(result.error.message);
      if (result.data) {
        set({ selectedService: result.data, loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setSelectedService: (service) => set({ 
    selectedService: service,
    colors: 1,
    isDirty: false
  }),
  
  setColors: (count) => {
    const maxColors = get().selectedService?.options?.maxColors || 5;
    set({ colors: Math.min(Math.max(1, count), maxColors) });
  },

  setIsDirty: (isDirty) => set({ isDirty }),

  calculateTotal: () => {
    const { selectedService, colors, isDirty } = get();
    if (!selectedService?.options) return 0;

    const {
      additionalColorCost = 0,
      basePrepCharge = 50,
      additionalPrepCharge = 50
    } = selectedService.options;

    return (
      selectedService.price +
      ((colors - 1) * additionalColorCost) +
      basePrepCharge +
      (isDirty ? additionalPrepCharge : 0)
    );
  },

  clearSelections: () => set({
    selectedService: null,
    colors: 1,
    isDirty: false
  }),

  clearServices: () => set({
    services: [],
    selectedService: null,
    colors: 1,
    isDirty: false
  })
}));