import { create } from 'zustand';

interface UIStore {
  isTabBarVisible: boolean;
  showTabBar: () => void;
  hideTabBar: () => void;
  setTabBarVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isTabBarVisible: true,
  showTabBar: () => set({ isTabBarVisible: true }),
  hideTabBar: () => set({ isTabBarVisible: false }),
  setTabBarVisible: (visible) => set({ isTabBarVisible: visible }),
}));
