import { useEffect } from 'react';
import { useAnonymousStore } from '../store/anonymousStore';

export const useAnonymousUser = () => {
  const store = useAnonymousStore();

  useEffect(() => {
    store.init();
  }, []);

  return {
    anonymousUserId: store.anonymousUserId,
    fingerprint: store.fingerprint,
    favorites: store.favorites,
    isLoading: store.isLoading,
    addToFavorites: store.addToFavorites,
    removeFromFavorites: store.removeFromFavorites,
    isFavorite: store.isFavorite,
    refreshFavorites: store.refreshFavorites
  };
};
