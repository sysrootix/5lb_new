import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useTelegramApp } from '../hooks/useTelegramApp';

export const MobileContainer = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { isTelegramApp, platform } = useTelegramApp();

  const noPaddingPages = [
    '/founder-card',
    '/referral',
    '/login',
    '/register',
    '/complete-registration',
    '/home',
    '/roulette'
  ];

  const shouldHavePadding = !noPaddingPages.some(path => pathname.startsWith(path));

  // Платформы, которые считаем десктопными
  const isDesktop = ['macos', 'tdesktop', 'weba', 'webk'].includes(platform);

  // Логика отступа:
  // 1. Если это Telegram:
  //    - Если десктоп -> нет отступа
  //    - Если мобилка -> есть отступ (если страница требует)
  // 2. Если не Telegram (браузер):
  //    - Используем адаптивный класс (pt-[25%] на мобилках, md:pt-0 на ПК)

  const paddingClass = (() => {
    if (!shouldHavePadding) return '';

    // Если определена десктопная платформа Telegram - убираем отступ
    if (isDesktop) return '';

    // Если это мобильная платформа Telegram (явно или через isTelegramApp) - форсируем отступ
    if (isTelegramApp || ['android', 'android_x', 'ios'].includes(platform)) {
      return 'pt-[25%]';
    }

    // Fallback для обычного браузера
    return 'pt-[25%] md:pt-0';
  })();

  return (
    <div className={`relative mx-auto flex min-h-screen w-full max-w-xl flex-col ${paddingClass}`}>
      {/* Main content - полная ширина на всех устройствах с поддержкой PWA */}
      <div className="flex-1 pb-20 text-5lb-text">{children}</div>
    </div>
  );
};

