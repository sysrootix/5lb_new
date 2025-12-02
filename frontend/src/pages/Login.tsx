import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { GlobalBackground } from '@/components/GlobalBackground';
import {
  loginWithTelegram,
  getTelegramConfig
} from '@/api/auth';
import type { TelegramAuthResult, TelegramGlobal } from '@/types/telegram';
import { useTelegramApp } from '@/hooks/useTelegramApp';

interface TelegramConfig {
  botId: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { isTelegramApp, setTelegramThemeColor, initData } = useTelegramApp();

  const [telegramReady, setTelegramReady] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig | null>(null);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);

  // Скролл наверх при монтировании
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Устанавливаем цвет Telegram WebApp
  useEffect(() => {
    if (isTelegramApp) {
      setTelegramThemeColor('#0F0501');
    }
  }, [isTelegramApp, setTelegramThemeColor]);

  const getTelegramLogin = () => {
    const telegram = (window as typeof window & { Telegram?: TelegramGlobal }).Telegram;
    return telegram?.Login;
  };

  // Загружаем конфигурацию Telegram
  useEffect(() => {
    let isActive = true;

    getTelegramConfig()
      .then((config) => {
        if (isActive) {
          setTelegramConfig(config);
        }
      })
      .catch(() => {
        if (isActive) {
          console.error('Failed to load Telegram config');
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Загружаем виджет Telegram Login
  useEffect(() => {
    if (!telegramConfig?.botId || isTelegramApp) return;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.onload = () => {
      setTelegramReady(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [telegramConfig, isTelegramApp]);

  const handleTelegramLogin = async () => {
    if (isTelegramLoading) {
      return;
    }

    setIsTelegramLoading(true);

    try {
      // Если это Telegram WebApp - используем initData напрямую
      if (isTelegramApp && initData) {
        try {
          const response = await loginWithTelegram(initData);
          setUser(response.user);
          toast.success('Вход через Telegram выполнен!');

          if (response.needsRegistration && !response.user.isRegistrationComplete) {
            navigate('/complete-registration');
          } else {
            const returnUrl = sessionStorage.getItem('returnUrl');
            if (returnUrl) {
              sessionStorage.removeItem('returnUrl');
              navigate(returnUrl);
            } else {
              navigate('/profile');
            }
          }
          return;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message;
          
          if (errorMessage === 'TELEGRAM_USER_NOT_FOUND') {
            toast('Завершите регистрацию', { icon: '✍️', duration: 3000 });
            
            if (initData) {
              localStorage.setItem('telegram_init_data', initData);
            }
            
            setIsTelegramLoading(false);
            navigate('/complete-registration');
            return;
          }
          
          throw error;
        }
      }

      // Иначе используем OAuth виджет для браузера
      if (!telegramReady) {
        toast.error('Подождите, Telegram еще загружается');
        setIsTelegramLoading(false);
        return;
      }

      if (!telegramConfig?.botId) {
        toast.error('Telegram авторизация временно недоступна');
        setIsTelegramLoading(false);
        return;
      }

      const telegramAuth = getTelegramLogin();

      if (!telegramAuth?.auth) {
        toast.error('Не удалось инициализировать Telegram виджет');
        setIsTelegramLoading(false);
        return;
      }

      telegramAuth.auth(
        {
          bot_id: telegramConfig.botId,
          request_access: 'write',
          lang: 'ru',
          origin: window.location.origin
        },
        async (authData: TelegramAuthResult) => {
          if (!authData || !authData.hash) {
            toast.error('Не удалось авторизоваться через Telegram');
            setIsTelegramLoading(false);
            return;
          }

          try {
            const queryParams = new URLSearchParams();
            Object.entries(authData).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                queryParams.append(key, String(value));
              }
            });

            const response = await loginWithTelegram(queryParams.toString());
            setUser(response.user);
            toast.success('Вход через Telegram выполнен!');

            if (response.needsRegistration && !response.user.isRegistrationComplete) {
              navigate('/complete-registration');
            } else {
              const returnUrl = sessionStorage.getItem('returnUrl');
              if (returnUrl) {
                sessionStorage.removeItem('returnUrl');
                navigate(returnUrl);
              } else {
                navigate('/profile');
              }
            }
          } catch (error: any) {
            console.error('Telegram login error:', error);
            const errorMessage = error?.response?.data?.message || error?.message;
            
            if (errorMessage === 'TELEGRAM_USER_NOT_FOUND') {
              toast('Завершите регистрацию', { icon: '✍️', duration: 3000 });
              
              const queryParams = new URLSearchParams();
              Object.entries(authData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                  queryParams.append(key, String(value));
                }
              });
              
              localStorage.setItem('telegram_init_data', queryParams.toString());
              navigate('/complete-registration');
            } else {
              toast.error(error?.response?.data?.error || 'Ошибка входа через Telegram');
            }
          } finally {
            setIsTelegramLoading(false);
          }
        }
      );
    } catch (error: any) {
      console.error('Telegram login error:', error);
      toast.error(error?.response?.data?.error || 'Ошибка входа через Telegram');
      setIsTelegramLoading(false);
    }
  };

  const isTelegramButtonDisabled = isTelegramLoading || (!isTelegramApp && (!telegramReady || !telegramConfig));

  return (
    <main className="relative min-h-screen">
      <GlobalBackground />
      
      <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-md"
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {/* Основная карточка */}
          <motion.div
            className="overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md p-8 shadow-2xl border border-white/10"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Заголовок */}
            <div className="mb-8 text-center">
              <motion.div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center"
                animate={{ 
                  y: [0, -4, 0],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="/logo.svg" alt="5LB" className="h-full w-full drop-shadow-2xl" />
              </motion.div>
              <motion.h1 
                className="text-3xl font-black tracking-tight text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Добро пожаловать
              </motion.h1>
              <motion.p 
                className="mt-3 text-base font-medium text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Войдите через Telegram,<br />чтобы начать покупки
              </motion.p>
            </div>

            {/* Telegram блок */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={handleTelegramLogin}
                disabled={isTelegramButtonDisabled}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#2AABEE] to-[#229ED9] px-6 py-4 text-base font-bold text-white shadow-xl shadow-[#2AABEE]/30 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                whileHover={isTelegramButtonDisabled ? {} : { scale: 1.02, y: -2 }}
                whileTap={isTelegramButtonDisabled ? {} : { scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="relative flex items-center gap-3">
                  {isTelegramLoading ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      <span>Авторизуем...</span>
                    </>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                      </svg>
                      <span>Войти через Telegram</span>
                      <Send size={18} className="ml-1 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </motion.button>

              {/* Преимущества */}
              <motion.div 
                className="mt-6 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#2AABEE]/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2AABEE" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="font-medium">Мгновенный вход без кодов</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#2AABEE]/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2AABEE" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span className="font-medium">Защищённо и безопасно</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#2AABEE]/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2AABEE" strokeWidth="2.5">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <span className="font-medium">Никаких звонков и СМС</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Подсказка */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-gray-500 leading-relaxed">
              Нажимая кнопку входа, вы соглашаетесь с{' '}
              <a href="/terms" className="font-medium text-gray-400 underline hover:text-white transition-colors">
                условиями использования
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};
