import { FormEvent, useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { verifySmsCode } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Loader2, Sparkles } from 'lucide-react';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { GlobalBackground } from '@/components/GlobalBackground';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 }
};

export const RegisterPage = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { pendingPhone, setUser } = useAuthStore();
  const { isTelegramApp, setTelegramThemeColor } = useTelegramApp();
  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);

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

  const formatPhoneDisplay = (phone?: string | null) => {
    if (!phone) return '';
    
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 11) return phone;

    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
      7,
      9
    )}-${digits.slice(9, 11)}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Автофокус на следующее поле
    if (value && index < 3) {
      codeInputs.current[index + 1]?.focus();
    }

    // Автоматическая отправка когда все поля заполнены
    if (newCode.every((digit) => digit !== '') && index === 3) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (codeString?: string) => {
    const finalCode = codeString || code.join('');
    
    if (!pendingPhone) {
      toast.error('Сначала запросите код подтверждения.');
      return;
    }

    if (finalCode.length !== 4) {
      toast.error('Введите 4-значный код');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifySmsCode(pendingPhone, finalCode);
      setUser(response.user);
      toast.success('Авторизация успешна! 🎉');

      if (response.needsRegistration) {
        navigate('/complete-registration');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('Неверный код. Попробуйте еще раз.');
      setCode(['', '', '', '']);
      codeInputs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <main className="relative min-h-screen">
      <GlobalBackground />
      
      <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-md"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Основная карточка */}
          <motion.div
            className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#4A2511]/95 to-[#180C06]/95 backdrop-blur-md p-8 shadow-2xl border border-white/10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <form onSubmit={handleManualSubmit}>
              {/* Заголовок */}
              <div className="mb-8 text-center">
                <motion.div
                  className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center"
                  animate={{ 
                    scale: [1, 1.08, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-5lb-orange-500 to-5lb-red-500 blur-xl opacity-50" />
                  <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-5lb-orange-500 to-5lb-red-500 shadow-2xl">
                    <Phone size={32} className="text-white" />
                  </div>
                </motion.div>
                
                <motion.h1 
                  className="text-3xl font-black tracking-tight text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Подтверждение кода
                </motion.h1>
                
                <motion.div
                  className="mt-4 space-y-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {pendingPhone && (
                    <p className="text-base font-medium text-gray-300">
                      Код отправлен на{' '}
                      <span className="font-black text-orange-500">
                        {formatPhoneDisplay(pendingPhone)}
                      </span>
                    </p>
                  )}
                  <p className="text-sm font-medium text-gray-400">
                    Возьмите трубку — робот продиктует вам код
                  </p>
                </motion.div>
              </div>

              {/* Поля для кода */}
              <div className="mb-8 flex justify-center gap-3">
                {code.map((digit, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ 
                      delay: 0.4 + index * 0.08, 
                      type: 'spring', 
                      stiffness: 400 
                    }}
                  >
                    <input
                      ref={(el) => (codeInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      autoFocus={index === 0}
                      disabled={isLoading}
                      className={`h-20 w-20 rounded-2xl border-2 bg-black/30 text-center text-4xl font-black shadow-lg transition-all focus:outline-none focus:ring-4 disabled:opacity-50 ${
                        digit
                          ? 'border-orange-500 text-white ring-4 ring-orange-500/30 shadow-orange-500/20'
                          : 'border-white/20 text-white focus:border-orange-500 focus:ring-orange-500/30'
                      }`}
                    />
                    {digit && (
                      <motion.div
                        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Кнопка подтверждения */}
              <motion.button
                type="submit"
                disabled={isLoading || code.some(d => !d)}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 px-6 py-5 font-black text-white shadow-2xl shadow-orange-500/40 transition-all disabled:opacity-50 disabled:shadow-none"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="relative flex items-center justify-center gap-3 text-lg">
                  {isLoading ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      <span>Проверяем...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      <span>Подтвердить код</span>
                    </>
                  )}
                </div>
              </motion.button>

              {/* Подсказка */}
              <motion.div
                className="mt-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 p-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-sm font-medium leading-relaxed text-gray-300">
                  <Sparkles size={16} className="mb-0.5 mr-1 inline text-orange-500" />
                  Звонок придёт в течение минуты. Возьмите трубку — робот продиктует код.
                </p>
              </motion.div>
            </form>
          </motion.div>

          {/* Дополнительная информация */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-sm text-gray-400">
              Не пришёл код?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-bold text-orange-500 underline decoration-2 underline-offset-2 transition hover:text-orange-400"
              >
                Запросить повторно
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};
