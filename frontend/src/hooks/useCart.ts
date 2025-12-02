import { useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAnonymousUser } from './useAnonymousUser';
import { useAuthStore } from '../store/authStore';

export const useCart = () => {
  const store = useCartStore();
  const { anonymousUserId } = useAnonymousUser();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated || anonymousUserId) {
      store.loadCart();
    }
  }, [isAuthenticated, anonymousUserId]);

  return {
    cart: store.cart,
    isLoading: store.isLoading,
    addToCart: store.addToCart,
    updateCartItem: store.updateCartItem,
    removeFromCart: store.removeFromCart,
    clearCart: store.clearCart,
    loadCart: store.loadCart,
    totalPrice: store.getTotalPrice(),
    totalItems: store.getTotalItems(),
    getItemQuantity: store.getItemQuantity,
    isInCart: store.isInCart
  };
};
