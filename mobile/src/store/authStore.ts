import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  phone: string | null;
  setPhone: (phone: string | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  phone: null,
  setPhone: (phone) => set({ phone }),
  setToken: (token) =>
    set(() => ({
      token,
      isAuthenticated: Boolean(token)
    })),
  logout: () => set({ token: null, isAuthenticated: false, phone: null })
}));
