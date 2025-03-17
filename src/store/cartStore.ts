import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '../services/cartService';
import { useAuthStore } from './authStore';
import { debounce } from '../utils/debounce';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: {
    // Carnimore Models options
    caliber?: string;
    longAction?: boolean;
    deluxeVersion?: boolean;
    // Duracoat options
    colors?: number;
    isDirty?: boolean;
    // Merch options
    size?: string;
    color?: string;
  };
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  totalValue: number;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  syncWithDatabase: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  getCartTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      totalValue: 0,
      loading: false,

      // Helper function to sync current cart state with database
      syncCart: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          await cartService.updateCart(user.id, get().items);
        } catch (error) {
          console.error('Failed to sync cart with database:', error);
        }
      },
      
      // Sync cart with database
      syncWithDatabase: async () => {
        const user = useAuthStore.getState().user;
        if (!user) {
          return;
        }

        try {
          set({ loading: true });
          const result = await cartService.getCart(user.id);
          if (result.data) {
            // Validate and transform cart items from database
            const validatedItems = result.data.items.map(item => ({
              id: item.id,
              name: item.name,
              price: parseFloat(item.price),
              quantity: parseInt(item.quantity, 10),
              image: item.image,
              options: item.options ? {
                caliber: item.options.caliber,
                colors: parseInt(item.options.colors, 10) || undefined,
                longAction: Boolean(item.options.longAction),
                deluxeVersion: Boolean(item.options.deluxeVersion),
                isDirty: Boolean(item.options.isDirty),
                size: item.options.size,
                color: item.options.color
              } : undefined
            }));

            set({ 
              items: validatedItems,
              totalValue: parseFloat(result.data.total_value) || 0,
              loading: false
            });
          } else {
            set({ loading: false });
          }
        } catch (error) {
          console.error('Failed to sync cart with database:', error);
          set({ loading: false });
        }
      },

      addItem: async (item) => {
        const user = useAuthStore.getState().user;

        // Update local state and sync with database
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          let newItems;
          
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          } else {
            newItems = [...state.items, item];
          }

          return { 
            items: newItems,
            isOpen: true
          };
        });

        // Sync entire cart state with database
        if (user) {
          await get().syncCart();
        }
      },

      updateQuantity: async (id, quantity) => {
        const user = useAuthStore.getState().user;

        // Update local state
        set((state) => ({
          items: quantity > 0 
            ? state.items.map((item) =>
                item.id === id ? { ...item, quantity } : item
              )
            : state.items.filter((item) => item.id !== id),
        }));

        // Sync entire cart state with database
        if (user) {
          await get().syncCart();
        }
      },

      removeItem: async (id) => {
        const user = useAuthStore.getState().user;

        // Update local state
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));

        // Sync entire cart state with database
        if (user) {
          await get().syncCart();
        }
      },

      clearCart: async () => {
        const user = useAuthStore.getState().user;

        // Clear local state first
        set({ items: [] });

        // Sync empty cart with database
        if (user) {
          await get().syncCart();
        }
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (isOpen) => set({ isOpen }),

      mergeGuestCart: async () => {
        const user = useAuthStore.getState().user;
        if (!user || get().items.length === 0) return;
        
        // Sync current cart state with database
        await get().syncCart();
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
      skipHydration: false,
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
      partialize: (state) => ({ items: state.items }), // Only persist items
      version: 1
    }
  )
);