import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Minus, Trash2, X } from 'lucide-react';
import { CartIcon } from '../components/Icons';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../api/catalog';
import { PageLoader } from '../components/PageLoader';
import { GradientModal } from '../components/GradientModal';
import toast from 'react-hot-toast';

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

export const CartPage = () => {
  const { cart, isLoading, updateCartItem, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();
  const [showClearModal, setShowClearModal] = useState(false);

  const handleQuantityChange = async (
    productId: string,
    shopCode: string,
    currentQuantity: number,
    delta: number,
    modificationIndex?: number
  ) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) {
      await removeFromCart(productId, shopCode, modificationIndex);
    } else {
      await updateCartItem(productId, shopCode, newQuantity, modificationIndex);
    }
  };

  const handleRemove = async (productId: string, shopCode: string, modificationIndex?: number) => {
    await removeFromCart(productId, shopCode, modificationIndex);
  };

  const handleClearCart = async () => {
    setShowClearModal(false);
    await clearCart();
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="px-4 py-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Корзина</h1>
          </div>
        </div>

        <motion.main
          className="flex-1 flex flex-col items-center justify-center px-4 pb-32 pt-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Animated cart icon */}
          <motion.div className="relative mb-8" variants={itemVariants}>
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-5lb-orange-500/20 to-5lb-red-500/20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-xl backdrop-blur-sm"
              animate={{
                rotate: [0, -5, 5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CartIcon size={64} className="text-white/40" strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="mb-3 text-center text-3xl font-black tracking-tight text-white"
            variants={itemVariants}
          >
            Корзина пуста
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mb-8 max-w-sm text-center text-base leading-relaxed text-gray-400"
            variants={itemVariants}
          >
            Добавьте товары из каталога, чтобы начать покупки с выгодой
          </motion.p>
        </motion.main>

        {/* Bottom Floating Button */}
        <div className="fixed bottom-24 left-0 right-0 max-w-xl mx-auto px-4 pb-4 safe-bottom z-50">
          <Link to="/catalog" className="w-full">
            <motion.button
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-5lb-orange-500 to-5lb-red-500 px-8 py-4 font-bold text-white shadow-lg shadow-5lb-orange-500/40"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Перейти в каталог</span>
              <ArrowRight size={20} />
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-48">
      {/* Заголовок */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Корзина</h1>
          {cart.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="text-sm text-gray-400 hover:text-5lb-red-500 transition-colors"
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {/* Список товаров */}
      <motion.div
        className="p-4 space-y-3 pb-48"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {cart.map((item, index) => {
          const modificationName =
            item.modificationIndex !== undefined &&
            item.product.modifications &&
            Array.isArray(item.product.modifications)
              ? (item.product.modifications[item.modificationIndex] as any)?.name
              : null;

          return (
            <motion.div
              key={`${item.productId}-${item.shopCode}-${item.modificationIndex ?? 'default'}-${index}`}
              variants={itemVariants}
              className="bg-white/5 rounded-xl p-4 shadow-sm border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => navigate(`/product/${item.productId}?shopCode=${item.shopCode}`)}
            >
              <div className="flex gap-4">
                {/* Изображение товара */}
                <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                  <svg className="h-10 w-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                
                {/* Информация о товаре */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2">
                    {item.product.name}
                  </h3>
                  {modificationName && (
                    <p className="text-sm text-gray-400 mb-2">{modificationName}</p>
                  )}
                  {item.product.categoryName && (
                    <span className="inline-block px-2 py-0.5 bg-white/10 text-white/80 text-xs rounded-full font-medium mb-2">
                      {item.product.categoryName}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-lg font-bold text-[#FF6B00]">
                        {formatPrice(item.product.retailPrice || 0)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Итого: {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Управление количеством */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      handleQuantityChange(
                        item.productId,
                        item.shopCode,
                        item.quantity,
                        -1,
                        item.modificationIndex
                      )
                    }
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Minus size={16} className="text-white" />
                  </motion.button>
                  <span className="text-lg font-semibold text-white w-8 text-center">
                    {item.quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      handleQuantityChange(
                        item.productId,
                        item.shopCode,
                        item.quantity,
                        1,
                        item.modificationIndex
                      )
                    }
                    disabled={
                      (item.product.quantity || 0) < item.quantity + 1 ||
                      (item.product.quantity || 0) === 0
                    }
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} className="text-white" />
                  </motion.button>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    handleRemove(item.productId, item.shopCode, item.modificationIndex)
                  }
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={18} className="text-red-500" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Итого - размещен над нижним меню */}
      <div className="fixed bottom-24 left-0 right-0 max-w-xl mx-auto bg-[#180C06]/95 backdrop-blur-lg border-t border-white/10 px-4 pt-4 pb-4 safe-bottom shadow-lg z-50">
        <div className="mb-[3%] flex items-center justify-between">
          <span className="text-lg font-semibold text-white">
            Товаров: {totalItems}
          </span>
          <div className="text-right">
            <p className="text-sm text-gray-400">Итого</p>
            <p className="text-2xl font-bold text-[#FF6B00]">
              {formatPrice(totalPrice)}
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            toast.success('Функция оформления заказа будет добавлена');
            // TODO: Navigate to checkout
          }}
          className="w-full px-4 py-3 bg-[#FF6B00] text-white text-base font-semibold rounded-xl hover:shadow-lg shadow-orange-900/20 transition-all"
        >
          Оформить заказ
        </motion.button>
      </div>

      {/* Модальное окно очистки корзины */}
      <GradientModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Очистить корзину?"
        subtitle="Все товары будут удалены из корзины"
        gradientType="red"
        maxWidth="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-center text-gray-300">
            Вы уверены, что хотите очистить корзину? Это действие нельзя отменить.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowClearModal(false)}
              className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              Отмена
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClearCart}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Очистить
            </motion.button>
          </div>
        </div>
      </GradientModal>
    </div>
  );
};
