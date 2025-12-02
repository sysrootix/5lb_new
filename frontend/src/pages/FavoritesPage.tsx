import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { formatPrice, getStockStatus } from '../api/catalog';
import { SkeletonLoader } from '../components/animations/SkeletonLoader';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const { favorites, isLoading, refreshFavorites } = useAnonymousUser();

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24">
        <div className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
          <div className="px-4 py-3">
            <SkeletonLoader type="text" className="w-32 h-6 bg-white/10" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonLoader key={i} type="card" className="w-full h-32 bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <motion.main
        className="flex min-h-screen flex-col items-center justify-center px-4 pb-32 pt-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Animated heart icon */}
        <motion.div className="relative mb-8" variants={itemVariants}>
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-100 shadow-xl"
            animate={{
              rotate: [0, -5, 5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart size={64} className="text-pink-500" strokeWidth={1.5} fill="currentColor" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="mb-3 text-center text-3xl font-black tracking-tight text-5lb-gray-900"
          variants={itemVariants}
        >
          Избранное пусто
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mb-8 max-w-sm text-center text-base leading-relaxed text-5lb-gray-600"
          variants={itemVariants}
        >
          Добавьте товары в избранное, чтобы не потерять их и быстро вернуться к покупкам
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={() => navigate('/catalog')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 px-8 py-4 font-bold text-white shadow-2xl shadow-pink-500/40"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span>Перейти в каталог</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight size={20} />
          </motion.div>
        </motion.button>
      </motion.main>
    );
  }

  return (
    <div className="min-h-screen bg-5lb-gray-50 pb-24">
      {/* Заголовок */}
      <div className="bg-white border-b border-5lb-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-5lb-gray-900">Избранное</h1>
          <span className="text-sm text-5lb-gray-500">{favorites.length} товаров</span>
        </div>
      </div>

      {/* Список товаров */}
      <motion.div
        className="p-4 space-y-3"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {favorites.map((product: any, index: number) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            className="bg-white rounded-xl p-4 shadow-sm border border-5lb-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/product/${product.id}?shopCode=${product.shopCode || ''}`)}
          >
            <div className="flex gap-4">
              {/* Изображение товара */}
              <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center overflow-hidden">
                <svg className="h-10 w-10 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              
              {/* Информация о товаре */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-5lb-gray-900 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                {product.categoryName && (
                  <span className="inline-block px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full font-medium mb-2">
                    {product.categoryName}
                  </span>
                )}
                {product.shopName && (
                  <p className="text-xs text-5lb-gray-500 mb-2">{product.shopName}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      {formatPrice(product.retailPrice || product.retail_price || 0)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        !product.quantity || product.quantity === 0 || product.quanty === 0
                          ? 'bg-red-100 text-red-700'
                          : (product.quantity || product.quanty) < 5
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {getStockStatus(product.quantity || product.quanty || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

