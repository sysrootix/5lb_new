import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  isTelegramApp?: boolean;
}

export const SplashScreen = ({ onFinish, isTelegramApp = false }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Имитация загрузки с прогрессом
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Задержка перед скрытием splash screen
          setTimeout(() => onFinish(), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Gradient Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: '#141414',
            backgroundImage: `url('/images/background-pattern.svg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Logo container */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo with pulse animation */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
          >
            {/* Glow effect behind logo */}
            <motion.div
              className="absolute inset-0 rounded-full bg-orange-500/20 blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Logo */}
            <motion.img
              src="/logo.svg"
              alt="5LB Logo"
              className="relative z-10 h-32 w-32 drop-shadow-2xl"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="mb-12 text-center text-sm font-medium uppercase tracking-widest text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Спорт | Здоровье | Красота
          </motion.p>

          {/* Loading bar */}
          <motion.div
            className="relative w-64 overflow-hidden rounded-full bg-white/5 border border-white/10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            <div className="h-1.5 w-full">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8534] shadow-[0_0_10px_rgba(255,107,0,0.5)]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Loading text */}
          <motion.div
            className="mt-4 text-center text-xs font-medium text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Загрузка...
            </motion.span>
          </motion.div>
        </div>

        {/* Bottom decoration */}
        <motion.div
          className="absolute bottom-8 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 text-white/20">
            <motion.div
              className="h-px w-8 bg-white/10"
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {isTelegramApp ? 'Telegram Mini App' : 'Приложение'}
            </span>
            <motion.div
              className="h-px w-8 bg-white/10"
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

