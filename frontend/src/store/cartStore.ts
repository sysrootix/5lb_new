import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
  getCart,
  addToCart as addToCartAPI,
  updateCartItem as updateCartItemAPI,
  removeFromCart as removeFromCartAPI,
  clearCart as clearCartAPI,
  CartItemWithProduct
} from '../api/cart';
import {
  getUserCart,
  addToUserCart,
  updateUserCartItem,
  removeFromUserCart,
  clearUserCart
} from '../api/userCart';
import { useAuthStore } from './authStore';
import { useAnonymousStore } from './anonymousStore';

interface CartState {
  cart: CartItemWithProduct[];
  isLoading: boolean;
  
  loadCart: () => Promise<void>;
  addToCart: (productId: string, shopCode: string, quantity?: number, modificationIndex?: number) => Promise<boolean>;
  updateCartItem: (productId: string, shopCode: string, quantity: number, modificationIndex?: number) => Promise<boolean>;
  removeFromCart: (productId: string, shopCode: string, modificationIndex?: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  
  // Computed (helper methods)
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getItemQuantity: (productId: string, shopCode: string, modificationIndex?: number) => number;
  isInCart: (productId: string, shopCode: string, modificationIndex?: number) => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  isLoading: false,

  loadCart: async () => {
    if (get().isLoading) return;

    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const { anonymousUserId } = useAnonymousStore.getState();

    // Prevent multiple calls if already loading? 
    // No, sometimes we need to reload. But we can check if isLoading if we want to be strict.
    // For now, let's just set isLoading.
    set({ isLoading: true });

    try {
      if (isAuthenticated) {
        const cartData = await getUserCart();
        set({ cart: cartData });
      } else if (anonymousUserId) {
        const cartData = await getCart();
        set({ cart: cartData });
      } else {
        // Not initialized yet
        set({ cart: [] });
      }
    } catch (error) {
      console.error('[CartStore] Failed to load cart:', error);
      set({ cart: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, shopCode, quantity = 1, modificationIndex) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const { anonymousUserId } = useAnonymousStore.getState();
    const { loadCart } = get();

    if (!isAuthenticated && !anonymousUserId) {
      toast.error('Ошибка идентификации пользователя');
      return false;
    }

    try {
      if (isAuthenticated) {
        await addToUserCart(productId, shopCode, quantity, modificationIndex);
      } else {
        await addToCartAPI(productId, shopCode, quantity, modificationIndex);
      }
      
      await loadCart();
      toast.success('Товар добавлен в корзину', {
        icon: '🛒',
        duration: 2000
      });
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Не удалось добавить товар в корзину';
      toast.error(errorMessage);
      return false;
    }
  },

  updateCartItem: async (productId, shopCode, quantity, modificationIndex) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const { anonymousUserId } = useAnonymousStore.getState();
    const { loadCart } = get();

    if (!isAuthenticated && !anonymousUserId) {
      toast.error('Ошибка идентификации пользователя');
      return false;
    }

    // Optimistic update
    set((state) => {
      const itemIndex = state.cart.findIndex(
        (item) =>
          item.productId === productId &&
          item.shopCode === shopCode &&
          item.modificationIndex === (modificationIndex ?? undefined)
      );
      if (itemIndex >= 0) {
        const updatedCart = [...state.cart];
        updatedCart[itemIndex] = {
          ...updatedCart[itemIndex],
          quantity,
          totalPrice: (updatedCart[itemIndex].product.retailPrice || 0) * quantity
        };
        return { cart: updatedCart };
      }
      return state;
    });

    try {
      if (isAuthenticated) {
        await updateUserCartItem(productId, shopCode, quantity, modificationIndex);
      } else {
        await updateCartItemAPI(productId, shopCode, quantity, modificationIndex);
      }
      return true;
    } catch (error: any) {
      await loadCart(); // Revert
      const errorMessage = error?.response?.data?.error || error?.message || 'Не удалось обновить корзину';
      toast.error(errorMessage);
      return false;
    }
  },

  removeFromCart: async (productId, shopCode, modificationIndex) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const { anonymousUserId } = useAnonymousStore.getState();
    const { loadCart } = get();

    if (!isAuthenticated && !anonymousUserId) {
      toast.error('Ошибка идентификации пользователя');
      return false;
    }

    // Optimistic update
    set((state) => ({
      cart: state.cart.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.shopCode === shopCode &&
            item.modificationIndex === (modificationIndex ?? undefined)
          )
      )
    }));

    try {
      if (isAuthenticated) {
        await removeFromUserCart(productId, shopCode, modificationIndex);
      } else {
        await removeFromCartAPI(productId, shopCode, modificationIndex);
      }
      toast.success('Товар удален из корзины', {
        icon: '🗑️',
        duration: 2000
      });
      return true;
    } catch (error: any) {
      await loadCart(); // Revert
      const errorMessage = error?.response?.data?.error || error?.message || 'Не удалось удалить товар';
      toast.error(errorMessage);
      return false;
    }
  },

  clearCart: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const { anonymousUserId } = useAnonymousStore.getState();
    const { loadCart } = get();

    if (!isAuthenticated && !anonymousUserId) {
      toast.error('Ошибка идентификации пользователя');
      return false;
    }

    try {
      if (isAuthenticated) {
        await clearUserCart();
      } else {
        await clearCartAPI();
      }
      await loadCart();
      toast.success('Корзина очищена', {
        icon: '🗑️',
        duration: 2000
      });
      return true;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Не удалось очистить корзину';
      toast.error(errorMessage);
      return false;
    }
  },

  getTotalPrice: () => {
    return get().cart.reduce((sum, item) => sum + item.totalPrice, 0);
  },

  getTotalItems: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  getItemQuantity: (productId, shopCode, modificationIndex) => {
    const item = get().cart.find(
      (item) =>
        item.productId === productId &&
        item.shopCode === shopCode &&
        item.modificationIndex === (modificationIndex ?? undefined)
    );
    return item?.quantity || 0;
  },

  isInCart: (productId, shopCode, modificationIndex) => {
    return get().getItemQuantity(productId, shopCode, modificationIndex) > 0;
  }
}));
