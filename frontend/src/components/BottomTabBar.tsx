import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Percent } from 'lucide-react';
import { HomeNavIcon, CartNavIcon, ProfileNavIcon } from './NavigationIcons';

const tabs = [
  { to: '/', label: 'Главная', icon: HomeNavIcon },
  { to: '/catalog', label: 'Поиск', icon: Search },
  { to: '/promotions', label: 'Акции', icon: Percent },
  { to: '/cart', label: 'Корзина', icon: CartNavIcon },
  { to: '/profile', label: 'Профиль', icon: ProfileNavIcon }
];

export const BottomTabBar = () => {
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/catalog') {
      return pathname.startsWith('/catalog') || pathname.startsWith('/product');
    }
    if (path === '/profile') return pathname.startsWith('/profile');
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] pb-safe" style={{ position: 'fixed' }}>
      <nav className="flex justify-center px-4 pb-6">
        <div className="w-full max-w-[360px] rounded-full bg-[#1E1E1E]/80 backdrop-blur-xl shadow-2xl border border-white/5 p-1.5">
        <ul className="grid grid-cols-5 items-center">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = isActive(t.to);
            const isPromotions = t.to === '/promotions';

            // Определяем, некликабельна ли кнопка (Поиск и Корзина)
            const isDisabled = t.to === '/catalog' || t.to === '/cart';

            return (
              <li key={t.to} className="flex justify-center">
                {isDisabled ? (
                  // Некликабельная кнопка
                  <div
                    className="relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 opacity-50 cursor-not-allowed"
                  >
                    <motion.div
                      className="relative z-10"
                    >
                      <Icon
                        // @ts-ignore
                        size={24}
                        className={active ? 'text-black' : (isPromotions ? 'text-[#FF6B00]' : 'text-white')}
                        strokeWidth={1.5}
                      />
                    </motion.div>
                  </div>
                ) : (
                  // Обычная кликабельная кнопка
                  <Link
                    to={t.to}
                    className="relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300"
                  >
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-full bg-[#FF6B00] shadow-lg shadow-orange-500/30"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <motion.div
                      className="relative z-10"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon
                        // @ts-ignore
                        size={24}
                        className={active ? 'text-black' : (isPromotions ? 'text-[#FF6B00]' : 'text-white')}
                        strokeWidth={1.5}
                      />
                    </motion.div>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        </div>
      </nav>
    </div>
  );
};
