import { create } from 'zustand';
import { getOrCreateFingerprint } from '../utils/fingerprint';
import { initAnonymousUser, getAnonymousFavorites, addAnonymousFavorite, removeAnonymousFavorite } from '../api/anonymous';
import { getUserFavorites, addUserFavorite, removeUserFavorite } from '../api/userFavorites';
import { useAuthStore } from './authStore';

interface AnonymousState {
  anonymousUserId: string | null;
  fingerprint: string | null;
  favorites: any[];
  isLoading: boolean;
  initialized: boolean;

  init: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  addToFavorites: (productId: string) => Promise<boolean>;
  removeFromFavorites: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
}

export const useAnonymousStore = create<AnonymousState>((set, get) => ({
  anonymousUserId: null,
  fingerprint: null,
  favorites: [],
  isLoading: false,
  initialized: false,

  init: async () => {
    const { initialized, isLoading } = get();
    if (initialized || isLoading) return;

    set({ isLoading: true });
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    try {
      if (isAuthenticated) {
        const data = await getUserFavorites();
        set({ favorites: data || [], anonymousUserId: null, initialized: true });
        return;
      }

      const fp = await getOrCreateFingerprint();
      set({ fingerprint: fp });

      const response = await initAnonymousUser(fp);
      set({
        anonymousUserId: response.anonymousUserId,
        favorites: response.favorites || [],
        initialized: true
      });
    } catch (error) {
      console.error('[AnonymousStore] Failed to initialize:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshFavorites: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const { anonymousUserId, fingerprint } = get();

    if (isAuthenticated) {
      try {
        const data = await getUserFavorites();
        set({ favorites: data || [] });
      } catch (error) {
        console.error('[UserFavorites] Failed to get favorites:', error);
      }
      return;
    }

    if (!anonymousUserId || !fingerprint) return;

    try {
      const data = await getAnonymousFavorites(fingerprint);
      set({ favorites: data.favorites || [] });
    } catch (error) {
      console.error('[AnonymousUser] Failed to get favorites:', error);
    }
  },

  addToFavorites: async (productId: string) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const { anonymousUserId, fingerprint, refreshFavorites } = get();

    if (isAuthenticated) {
      try {
        await addUserFavorite(productId);
        await refreshFavorites();
        return true;
      } catch (error) {
        console.error('[UserFavorites] Failed to add favorite:', error);
        return false;
      }
    }

    if (!anonymousUserId || !fingerprint) return false;

    try {
      await addAnonymousFavorite(fingerprint, productId);
      await refreshFavorites();
      return true;
    } catch (error) {
      console.error('[AnonymousUser] Failed to add favorite:', error);
      return false;
    }
  },

  removeFromFavorites: async (productId: string) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const { anonymousUserId, fingerprint, refreshFavorites } = get();

    if (isAuthenticated) {
      try {
        await removeUserFavorite(productId);
        await refreshFavorites();
        return true;
      } catch (error) {
        console.error('[UserFavorites] Failed to remove favorite:', error);
        return false;
      }
    }

    if (!anonymousUserId || !fingerprint) return false;

    try {
      await removeAnonymousFavorite(fingerprint, productId);
      await refreshFavorites();
      return true;
    } catch (error) {
      console.error('[AnonymousUser] Failed to remove favorite:', error);
      return false;
    }
  },

  isFavorite: (productId: string) => {
    return get().favorites.some(fav => fav.id === productId);
  }
}));
