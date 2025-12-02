import { useEffect, useState, lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { refreshToken } from './api/auth';
import { PageLoader } from './components/PageLoader';

// Lazy load secondary pages
// Core pages are imported directly to avoid Suspense errors on main navigation
import { HomePage } from './pages/Home';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { CompleteRegistration } from './pages/CompleteRegistration';
import { ProfilePage } from './pages/Profile';
import { CartPage } from './pages/Cart';
import ShopsPage from './pages/ShopsPage';
import CatalogPage from './pages/CatalogPage';
import CatalogMainPage from './pages/CatalogMainPage';

// Lazy load less critical / heavy pages
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SubcategoryPage = lazy(() => import('./pages/SubcategoryPage'));
const BrandsPage = lazy(() => import('./pages/BrandsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const SettingsPage = lazy(() => import('./pages/Settings').then(module => ({ default: module.SettingsPage })));
const ProfilePurchasesPage = lazy(() => import('./pages/ProfilePurchases').then(module => ({ default: module.ProfilePurchasesPage })));
const ProfileReviewsPage = lazy(() => import('./pages/ProfileReviews').then(module => ({ default: module.ProfileReviewsPage })));
const ProfileQuestionsPage = lazy(() => import('./pages/ProfileQuestions').then(module => ({ default: module.ProfileQuestionsPage })));
const ProfilePurchasedProductsPage = lazy(() => import('./pages/ProfilePurchasedProducts').then(module => ({ default: module.ProfilePurchasedProductsPage })));
const ProfileContactsPage = lazy(() => import('./pages/ProfileContacts').then(module => ({ default: module.ProfileContactsPage })));
const ProfileStoresPage = lazy(() => import('./pages/ProfileStores').then(module => ({ default: module.ProfileStoresPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(module => ({ default: module.FavoritesPage })));
const FounderCardDetailsPage = lazy(() => import('./pages/FounderCardDetails').then(module => ({ default: module.FounderCardDetailsPage })));
const ReferralPage = lazy(() => import('./pages/ReferralPage').then(module => ({ default: module.ReferralPage })));
const ReferralStatsPage = lazy(() => import('./pages/ReferralStatsPage').then(module => ({ default: module.ReferralStatsPage })));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage').then(module => ({ default: module.PromotionsPage })));
const CardRulesPage = lazy(() => import('./pages/CardRulesPage').then(module => ({ default: module.CardRulesPage })));
const PartnerCardRulesPage = lazy(() => import('./pages/PartnerCardRulesPage').then(module => ({ default: module.PartnerCardRulesPage })));
const FounderCardRulesPage = lazy(() => import('./pages/FounderCardRulesPage').then(module => ({ default: module.FounderCardRulesPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const RoulettePage = lazy(() => import('./pages/RoulettePage').then(module => ({ default: module.RoulettePage })));

import { BottomTabBar } from './components/BottomTabBar';
import { MobileContainer } from './components/MobileContainer';
import { SplashScreen } from './components/SplashScreen';
import { InstallPWAPrompt } from './components/InstallPWAPrompt';
import { VPNDetectionPrompt } from './components/VPNDetectionPrompt';
import { useTelegramApp } from './hooks/useTelegramApp';

import { useUIStore } from './store/uiStore';
import { GlobalBackground } from './components/GlobalBackground';
import { TelegramBackButton } from './components/TelegramBackButton';
import { recordReferralClick } from './api/referrals';

const WithChrome = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isTabBarVisible = useUIStore((state) => state.isTabBarVisible);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const hideTabs = pathname.startsWith('/login')
    || pathname.startsWith('/register')
    || pathname.startsWith('/complete-registration')
    || pathname.startsWith('/settings')
    || pathname.startsWith('/product/')
    || pathname.startsWith('/founder-card')
    || pathname.startsWith('/referral')
    || pathname.startsWith('/profile/card-rules')
    || pathname.startsWith('/profile/partner-card-rules')
    || pathname.startsWith('/profile/founder-card-rules')
    || pathname.startsWith('/roulette')
    || !isTabBarVisible;

  return (
    <>
      <MobileContainer>
        {children}
      </MobileContainer>
      {!hideTabs && <BottomTabBar />}
    </>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const { isTelegramApp, setTelegramThemeColor, platform } = useTelegramApp();
  const { pathname, search } = useLocation();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  // Отслеживание реферальных переходов
  useEffect(() => {
    const trackReferral = async () => {
      // Проверяем параметр start из Telegram (для deep links)
      // Делаем это в первую очередь, так как это приоритетнее
      if (window.Telegram?.WebApp?.initDataUnsafe) {
        const startParam = (window.Telegram.WebApp.initDataUnsafe as any).start_param;
        const telegramUser = (window.Telegram.WebApp.initDataUnsafe as any).user;

        if (startParam && telegramUser?.id) {
          const upperCode = startParam.toUpperCase();
          const telegramId = telegramUser.id.toString();

          // Сохраняем в localStorage для fallback
          localStorage.setItem('referral_code', upperCode);
          console.log('✅ Сохранен реферальный код из Telegram start_param:', startParam, '→', upperCode);

          // Записываем клик в базу данных
          try {
            const result = await recordReferralClick(telegramId, upperCode);
            if (result.success) {
              console.log('✅ Реферальный клик записан в базу данных');
              if (result.referrerName) {
                console.log('👤 Вас пригласил:', result.referrerName);
              }
            } else {
              console.warn('⚠️ Не удалось записать клик:', result.error);
            }
          } catch (error) {
            console.error('❌ Ошибка при записи реферального клика:', error);
          }
        }
      }

      // Затем проверяем URL параметры (менее приоритетно)
      const params = new URLSearchParams(search);
      const refCode = params.get('ref');

      if (refCode) {
        // Сохраняем реферальный код в localStorage только если его еще нет
        const existing = localStorage.getItem('referral_code');
        if (!existing) {
          localStorage.setItem('referral_code', refCode.toUpperCase());
          console.log('✅ Сохранен реферальный код из URL:', refCode);
        }
      }
    };

    trackReferral();
  }, [search]);

  // Обновляем сессию (и lastLoginAt) при входе в приложение
  useEffect(() => {
    const initSession = async () => {
      if (isAuthenticated) {
        try {
          // refreshToken обновит токены и lastLoginAt в базе данных
          const data = await refreshToken();
          if (data.user) {
            setUser(data.user);
          }
        } catch (error) {
          console.error('Session refresh failed:', error);
          // Если токен невалиден - разлогиниваем пользователя
          logout();
        }
      }
    };

    initSession();
  }, [isAuthenticated, setUser, logout]);

  // Logic to determine top padding for notifications, matching MobileContainer
  const noPaddingPages = [
    '/founder-card',
    '/referral',
    '/profile/card-rules',
    '/profile/partner-card-rules',
    '/profile/founder-card-rules'
  ];
  const shouldHavePadding = !noPaddingPages.some(path => pathname.startsWith(path));

  // Платформы, которые считаем десктопными (из MobileContainer)
  const isDesktop = ['macos', 'tdesktop', 'weba', 'webk'].includes(platform);

  // Определяем отступ для уведомлений по той же логике что и в MobileContainer
  const getToastTopPadding = () => {
    if (!shouldHavePadding) return '12px';

    // Если определена десктопная платформа Telegram - убираем отступ
    if (isDesktop) return '12px';

    // Если это мобильная платформа Telegram - форсируем отступ
    if (isTelegramApp || ['android', 'android_x', 'ios'].includes(platform)) {
      return 'min(25vw, 144px)';
    }

    // Fallback для обычного браузера - используем CSS media query
    return 'min(25vw, 144px)';
  };

  // Устанавливаем цвет Telegram WebApp при загрузке приложения
  useEffect(() => {
    if (isTelegramApp) {
      setTelegramThemeColor('#4A2511'); // Базовый цвет фона приложения
    }
  }, [isTelegramApp, setTelegramThemeColor]);

  // Обработка OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('oauth') === 'success') {
      // После успешного OAuth редиректа нужно обновить информацию о пользователе
      // Проверяем токены через refresh
      const refreshUser = async () => {
        try {
          const data = await refreshToken();
          if (data.user) {
            setUser(data.user);
            toast.success('Вход выполнен успешно!');
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error('Failed to refresh user after OAuth:', error);
          navigate('/login', { replace: true });
        }
      };
      refreshUser();
    }
  }, [setUser, navigate]);

  // Добавляем глобальную функцию hard_reset для полной очистки и перезагрузки
  useEffect(() => {
    (window as any).hard_reset = async () => {
      console.log('Выполняется полный сброс приложения...');

      // Очистка хранилищ
      localStorage.clear();
      sessionStorage.clear();

      // Удаление Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Service Worker unregistered');
        }
      }

      // Очистка кэша
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        console.log('Cache cleared');
      }

      console.log('Перезагрузка страницы...');
      window.location.reload();
    };

    console.log('Команда hard_reset() доступна в консоли');

    return () => {
      delete (window as any).hard_reset;
    };
  }, []);

  // Показываем splash screen при первой загрузке
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} isTelegramApp={isTelegramApp} />;
  }

  return (
    <>
      <GlobalBackground />
      <TelegramBackButton />
      <Toaster
        position="top-center"
        containerClassName="toast-container"
        containerStyle={{
          top: getToastTopPadding(),
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#180C06',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: '#FF6B00',
              secondary: '#fff',
            },
            style: {
              background: 'linear-gradient(to bottom right, #2A1205, #180C06)',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
            style: {
              background: 'linear-gradient(to bottom right, #2A1205, #180C06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            },
          },
        }}
      />
      <InstallPWAPrompt />
      <VPNDetectionPrompt />
      <WithChrome>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/complete-registration" element={<CompleteRegistration />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/purchases" element={<ProfilePurchasesPage />} />
            <Route path="/profile/reviews" element={<ProfileReviewsPage />} />
            <Route path="/profile/questions" element={<ProfileQuestionsPage />} />
            <Route path="/profile/products" element={<ProfilePurchasedProductsPage />} />
            <Route path="/profile/contacts" element={<ProfileContactsPage />} />
            <Route path="/profile/stores" element={<ProfileStoresPage />} />
            <Route path="/profile/favorites" element={<FavoritesPage />} />
            <Route path="/profile/card-rules/:cardId" element={<CardRulesPage />} />
            <Route path="/profile/partner-card-rules/:cardId" element={<PartnerCardRulesPage />} />
            <Route path="/profile/partner-card-rules" element={<PartnerCardRulesPage />} />
            <Route path="/profile/founder-card-rules/:cardId" element={<FounderCardRulesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            {/* Catalog and Cart pages */}
            <Route path="/catalog/search" element={<SearchPage />} />
            <Route path="/catalog/brands" element={<BrandsPage />} />
            <Route path="/catalog/category/:categoryId" element={<CategoryPage />} />
            <Route path="/catalog/subcategory/:subcategoryId" element={<SubcategoryPage />} />
            <Route path="/catalog/:shopCode" element={<CatalogPage />} />
            <Route path="/catalog" element={<CatalogMainPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/shops" element={<ShopsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/founder-card" element={<FounderCardDetailsPage />} />
            <Route path="/referral" element={<ReferralPage />} />
            <Route path="/referral/stats" element={<ReferralStatsPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/roulette" element={<RoulettePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </WithChrome>
    </>
  );
};

export default App;
