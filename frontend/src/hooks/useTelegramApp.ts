import { useEffect, useState } from 'react';

type TelegramViewportData = {
  isStateStable: boolean;
  height: number;
};

type TelegramViewportHandler = (data: TelegramViewportData) => void;

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        initDataUnsafe?: unknown;
        ready?: () => void;
        expand?: () => void;
        requestFullscreen?: () => void;
        BackButton?: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        disableVerticalSwipes?: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        requestContact?: (callback: (result: boolean) => void) => void;
        onEvent?: (event: 'viewportChanged', handler: TelegramViewportHandler) => void;
        offEvent?: (event: 'viewportChanged', handler: TelegramViewportHandler) => void;
        platform?: string;
      };
    };
  }
}

export const useTelegramApp = () => {
  const [initData, setInitData] = useState<string | null>(null);
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [platform, setPlatform] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.platform) {
      return window.Telegram.WebApp.platform;
    }
    return 'unknown';
  });

  // Функция для установки цвета Telegram WebApp
  const setTelegramThemeColor = (backgroundColor: string) => {
    if (typeof window === 'undefined') return;
    
    const tg = window.Telegram?.WebApp;
    if (!tg || !isTelegramApp) return;

    try {
      // Устанавливаем цвет header и background
      tg.setHeaderColor?.(backgroundColor);
      tg.setBackgroundColor?.(backgroundColor);
    } catch (error) {
      console.warn('Failed to set Telegram theme color:', error);
    }
  };
  
  // Проверяем при монтировании и при изменении initData
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsTelegramApp(false);
      return;
    }
    
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setIsTelegramApp(false);
      return;
    }
    
    if (tg.platform) {
      setPlatform(tg.platform);
    }
    
    // Проверяем, есть ли реальные данные от Telegram
    // initData будет непустым только при запуске из Telegram
    const hasInitDataUnsafe = tg.initDataUnsafe && 
      typeof tg.initDataUnsafe === 'object' && 
      'user' in tg.initDataUnsafe;
    const hasTelegramData = Boolean(tg.initData) || Boolean(hasInitDataUnsafe) || Boolean(initData);
    setIsTelegramApp(hasTelegramData);
  }, [initData]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const tg = window.Telegram?.WebApp;
    if (!tg) {
      return;
    }

    const ensureExpanded = () => {
      tg.expand?.();
      tg.disableVerticalSwipes?.();

      // Request fullscreen only on mobile devices
      const isMobile = tg.platform && ['android', 'ios'].includes(tg.platform.toLowerCase());

      if (isMobile) {
        tg.requestFullscreen?.();
      }

      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          tg.expand?.();
          if (isMobile) {
            tg.requestFullscreen?.();
          }
        });
      }
    };

    tg.ready?.();
    ensureExpanded();

    if (tg.initData) {
      setInitData(tg.initData);
    }

    const handleViewportChange: TelegramViewportHandler = (viewport) => {
      if (viewport.isStateStable) {
        ensureExpanded();
      }
    };

    tg.onEvent?.('viewportChanged', handleViewportChange);

    return () => {
      tg.offEvent?.('viewportChanged', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || initData) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const tgWebAppData = params.get('tgWebAppData');
    if (tgWebAppData) {
      setInitData(tgWebAppData);
    }
  }, [initData]);

  const backButton = typeof window !== 'undefined' ? window.Telegram?.WebApp?.BackButton : undefined;

  return { initData, isTelegramApp, setTelegramThemeColor, backButton, platform };
};
