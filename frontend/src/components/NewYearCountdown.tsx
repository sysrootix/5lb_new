import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const NewYearCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isNewYear, setIsNewYear] = useState(false);

  // Функция для правильного склонения русских слов
  const getWordForm = (number: number, one: string, two: string, five: string): string => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;

    if (n > 10 && n < 20) return five;
    if (n1 > 1 && n1 < 5) return two;
    if (n1 === 1) return one;
    return five;
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Новый год 2026
      const newYear = new Date('2026-01-01T00:00:00').getTime();
      const now = new Date().getTime();
      const difference = newYear - now;

      if (difference <= 0) {
        setIsNewYear(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    // Начальный расчет
    setTimeLeft(calculateTimeLeft());

    // Обновление каждую секунду
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isNewYear) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl mb-4"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-5lb-orange-500 via-5lb-red-500 to-purple-600 opacity-90"></div>
        <div className="relative px-5 py-8 text-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Sparkles className="text-yellow-300" size={48} />
          </motion.div>
          <h3 className="text-2xl font-black text-white mb-2">
            🎉 С Новым 2026 Годом! 🎉
          </h3>
          <p className="text-white/90 text-sm">
            Счастья, здоровья и исполнения желаний!
          </p>
        </div>
      </motion.div>
    );
  }

  const timeBlocks = [
    {
      value: timeLeft.days,
      label: getWordForm(timeLeft.days, 'день', 'дня', 'дней'),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      value: timeLeft.hours,
      label: getWordForm(timeLeft.hours, 'час', 'часа', 'часов'),
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      value: timeLeft.minutes,
      label: getWordForm(timeLeft.minutes, 'минута', 'минуты', 'минут'),
      gradient: 'from-5lb-orange-500 to-5lb-red-500'
    },
    {
      value: timeLeft.seconds,
      label: getWordForm(timeLeft.seconds, 'секунда', 'секунды', 'секунд'),
      gradient: 'from-emerald-500 to-green-500'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl mb-4 group"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>

      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 opacity-50 blur-sm"></div>

      {/* Animated orbs - более яркие и красивые */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="relative px-5 py-6 border border-white/10 rounded-3xl">
        {/* Header with icons */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30"
          >
            <Clock className="text-blue-300" size={20} strokeWidth={2.5} />
          </motion.div>

          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
            До Нового <span className="bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 bg-clip-text text-transparent">2026</span> Года
          </h3>

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
          >
            <Sparkles className="text-yellow-300" size={20} strokeWidth={2.5} />
          </motion.div>
        </div>

        {/* Timer Grid - современные карточки */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5">
          {timeBlocks.map((block, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 20
              }}
              className="relative group/card"
            >
              {/* Glow effect - более яркий и красивый */}
              <div className="absolute -inset-1 bg-gradient-to-br from-white/0 via-white/5 to-white/0 rounded-2xl opacity-0 group-hover/card:opacity-100 blur-md transition-all duration-500"></div>
              <div className={`absolute -inset-0.5 bg-gradient-to-br ${block.gradient} opacity-0 group-hover/card:opacity-30 blur-lg transition-all duration-500 rounded-2xl`}></div>

              {/* Glass card */}
              <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 group-hover/card:border-white/30 transition-all duration-300 group-hover/card:shadow-lg group-hover/card:shadow-white/10">
                {/* Inner glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${block.gradient} opacity-0 group-hover/card:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

                {/* Number with animation */}
                <div className="relative">
                  <motion.div
                    key={block.value}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, type: 'spring' }}
                    className="text-2xl sm:text-3xl font-black text-center mb-1"
                  >
                    <span className={`bg-gradient-to-br ${block.gradient} bg-clip-text text-transparent drop-shadow-lg`}>
                      {String(block.value).padStart(2, '0')}
                    </span>
                  </motion.div>

                  {/* Label */}
                  <div className="text-[10px] sm:text-xs text-white/60 font-bold uppercase tracking-wider text-center">
                    {block.label}
                  </div>
                </div>

                {/* Decorative corner elements */}
                <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${block.gradient} opacity-50 group-hover/card:opacity-100 transition-opacity`}></div>
                <div className={`absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${block.gradient} opacity-50 group-hover/card:opacity-100 transition-opacity`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider with gradient */}
        <div className="relative h-px mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>

        {/* Footer message with icon */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 text-center"
        >
          <div className="text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Готовьтесь к празднику вместе с 5LB!
          </div>
          <span className="text-base">🎄</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
