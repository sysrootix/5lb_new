import { motion } from 'framer-motion';
import { Package, Filter, Sparkles, ArrowLeft } from 'lucide-react';
import { SearchIcon } from '../components/Icons';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

export const CatalogPage = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Back Button - Fixed relative to viewport */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-4 sm:left-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[#1E1E1E]/80 backdrop-blur-sm text-white hover:bg-zinc-700 transition-colors border border-white/5 shadow-lg"
      >
        <ArrowLeft size={20} />
      </button>

      <motion.main
        className="flex min-h-screen flex-col items-center justify-center px-4 pb-32 pt-20 bg-[#1a0f0a]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Animated icon */}
        <motion.div
          className="relative mb-8"
          variants={itemVariants}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-orange-500/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <motion.div
            className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl shadow-orange-900/40"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Package size={64} className="text-white" strokeWidth={1.5} />

            {/* Floating sparkles */}
            <motion.div
              className="absolute -right-2 -top-2"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles size={24} className="text-yellow-300" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="mb-3 text-center text-3xl font-black tracking-tight text-white"
          variants={itemVariants}
        >
          Каталог в разработке
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mb-8 max-w-sm text-center text-base leading-relaxed text-gray-400"
          variants={itemVariants}
        >
          Мы работаем над созданием удобного каталога с тысячами товаров спортивного питания
        </motion.p>

        {/* Feature cards */}
        <motion.div
          className="grid w-full max-w-md gap-3"
          variants={containerVariants}
        >
          <motion.div
            className="flex items-center gap-4 rounded-2xl bg-[#1E1E1E] p-4 shadow-lg border border-white/5"
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 5 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 shadow-lg border border-blue-500/20">
              <SearchIcon size={24} />
            </div>
            <div>
              <div className="font-bold text-white">Умный поиск</div>
              <div className="text-xs text-gray-500">Найдите товар за секунды</div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-4 rounded-2xl bg-[#1E1E1E] p-4 shadow-lg border border-white/5"
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 5 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 shadow-lg border border-purple-500/20">
              <Filter size={24} />
            </div>
            <div>
              <div className="font-bold text-white">Фильтры</div>
              <div className="text-xs text-gray-500">Подбор по категориям</div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-4 rounded-2xl bg-[#1E1E1E] p-4 shadow-lg border border-white/5"
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 5 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 shadow-lg border border-orange-500/20">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="font-bold text-white">Рекомендации</div>
              <div className="text-xs text-gray-500">Персональные подборки</div>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          className="mt-8 rounded-2xl bg-[#FF6B00] px-8 py-4 font-bold text-black shadow-xl shadow-orange-900/20 hover:bg-orange-500 transition-colors"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Узнать о запуске
        </motion.button>
      </motion.main>
    </>
  );
};
