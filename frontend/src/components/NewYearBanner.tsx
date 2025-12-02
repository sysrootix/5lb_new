import { motion } from 'framer-motion';
import { Sparkles, Gift } from 'lucide-react';

export const NewYearBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl mb-4"
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm"></div>

      {/* Animated orbs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-75"></div>

      {/* Content */}
      <div className="relative px-5 py-4 border border-white/10">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex-shrink-0"
          >
            <Sparkles className="text-blue-300" size={22} strokeWidth={2.5} />
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white mb-0.5 flex items-center gap-2">
              С Наступающим Новым Годом! ✨
            </h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Пусть 2026 год принесет счастье и исполнение желаний
            </p>
          </div>

          {/* Gift icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="flex-shrink-0"
          >
            <Gift className="text-5lb-orange-400" size={24} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
