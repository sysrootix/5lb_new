import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../api/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  pendingPhone: string | null;
  needsRegistration: boolean;

  setUser: (user: User | null) => void;
  setNeedsRegistration: (needs: boolean) => void;
  setPendingPhone: (phone: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      pendingPhone: null,
      needsRegistration: false,

      setUser: (user) =>
        set(() => ({
          user,
          isAuthenticated: Boolean(user),
          needsRegistration: user ? !user.isRegistrationComplete : false
        })),

      setNeedsRegistration: (needs) =>
        set({ needsRegistration: needs }),

      setPendingPhone: (phone) => set({ pendingPhone: phone }),

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          pendingPhone: null,
          needsRegistration: false
        });
      }
    }),
    {
      name: 'auth-storage',
      // Сохраняем только user в localStorage для персистентности
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        needsRegistration: state.needsRegistration
      })
    }
  )
);
