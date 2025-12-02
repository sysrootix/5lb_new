import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, ShoppingCart, Star, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { GradientModal } from '@/components/GradientModal';

interface PurchasedProduct {
  id: string;
  name: string;
  image?: string;
  price: number;
  lastPurchased: string;
  description?: string;
  rating?: number;
  purchaseCount?: number;
}

const MOCK_PRODUCTS: PurchasedProduct[] = [
  {
    id: 'P-100',
    name: 'Протеин 5LB Ultra Whey 908 г',
    image: 'https://images.unsplash.com/photo-1585238341986-37b1f2b88f04?auto=format&w=300&q=80',
    price: 3290,
    lastPurchased: '27 октября 2025',
    description: 'Высококачественный сывороточный протеин с отличным вкусом. Отлично растворяется и подходит для послетренировочного приёма.',
    rating: 5,
    purchaseCount: 3
  },
  {
    id: 'P-101',
    name: 'Омега-3 Premium 120 капсул',
    image: 'https://images.unsplash.com/photo-1558640472-9d2a7deb7f62?auto=format&w=300&q=80',
    price: 1490,
    lastPurchased: '15 октября 2025',
    description: 'Премиальная добавка с высоким содержанием Омега-3 жирных кислот для поддержания здоровья сердца и сосудов.',
    rating: 4,
    purchaseCount: 2
  },
  {
    id: 'P-102',
    name: 'Витамин D3 2000 IU',
    price: 590,
    lastPurchased: '2 октября 2025',
    description: 'Незаменимый витамин для поддержания иммунитета и здоровья костей. Особенно важен в осенне-зимний период.',
    rating: 5,
    purchaseCount: 1
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 }
  }
};

export const ProfilePurchasedProductsPage = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<PurchasedProduct | null>(null);

  useLockBodyScroll(!!selectedProduct);

  const handleBuyAgain = (product: PurchasedProduct) => {
    toast.success(`Товар "${product.name}" добавлен в корзину`);
    setSelectedProduct(null);
    navigate('/catalog');
  };

  return (
    <motion.main
      className="min-h-screen bg-5lb-gray-50 pb-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Улучшенный Header с градиентом */}
      <motion.header 
        className="sticky top-0 z-20 relative overflow-hidden bg-gradient-to-br from-white via-white to-5lb-orange-50/40 px-4 pb-5 pt-4 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90 sm:pb-6"
        variants={itemVariants}
      >
        {/* Декоративные элементы */}
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-5lb-orange-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-5lb-red-100/30 blur-3xl" />
        
        <div className="relative mx-auto flex max-w-2xl items-center gap-3 sm:gap-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-5lb-gray-200 transition-all hover:shadow-xl sm:h-11 sm:w-11"
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} className="text-5lb-gray-700 sm:w-5" />
          </motion.button>
          
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-5lb-orange-500 sm:text-sm">
              История покупок
            </p>
            <h1 className="text-xl font-black tracking-tight text-5lb-gray-900 sm:text-2xl">Купленные товары</h1>
          </div>
        </div>
      </motion.header>

      <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-5 px-4 pb-20 sm:mt-6 sm:gap-6">
        {MOCK_PRODUCTS.length === 0 ? (
          <motion.div
            className="group relative overflow-hidden rounded-3xl bg-white p-6 text-center shadow-lg ring-1 ring-5lb-gray-100 sm:p-8"
            variants={itemVariants}
            whileHover={{ y: -2 }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-5lb-orange-100/30 blur-3xl" />
            <div className="relative">
              <ShoppingBag className="mx-auto h-12 w-12 text-5lb-gray-300 sm:h-16 sm:w-16" />
              <p className="mt-3 text-sm font-medium text-5lb-gray-600 sm:text-base">
                Здесь появятся товары, которые вы покупали. Оформите заказ, чтобы добавить первые позиции.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {MOCK_PRODUCTS.map((product) => (
              <motion.div
                key={product.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-5lb-gray-100 transition-shadow hover:shadow-xl"
                variants={itemVariants}
                whileHover={{ y: -2 }}
              >
                {/* Декоративный градиент */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-5lb-orange-100/20 blur-3xl" />
                
                <div className="relative h-36 bg-5lb-gray-100 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-5lb-gray-400">
                      5LB
                    </div>
                  )}
                </div>
                <div className="relative flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h2 className="text-sm font-black text-5lb-gray-900 sm:text-base">{product.name}</h2>
                    <p className="mt-1 text-xs font-medium text-5lb-gray-500 sm:text-sm">
                      Последняя покупка: {product.lastPurchased}
                    </p>
                    {product.purchaseCount && product.purchaseCount > 1 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Package size={12} className="text-5lb-orange-500" />
                        <span className="text-[10px] font-bold text-5lb-orange-600">
                          Куплено {product.purchaseCount} раз
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <p className="text-base font-black text-5lb-orange-500 sm:text-lg">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </p>
                    <motion.button
                      type="button"
                      className="rounded-2xl bg-gradient-to-r from-5lb-orange-500 via-5lb-orange-600 to-5lb-red-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-5lb-orange-500/30 transition-all hover:shadow-xl hover:shadow-5lb-red-500/40 sm:px-4 sm:py-2 sm:text-xs"
                      onClick={() => setSelectedProduct(product)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Подробнее
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Мобильное модальное окно деталей товара */}
      {selectedProduct && (
        <GradientModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title="Купленный товар"
          subtitle={selectedProduct.name}
          icon={Package}
          maxWidth="2xl"
        >
          <div className="p-6">
                <div className="space-y-6">
                  {/* Изображение товара */}
                  {selectedProduct.image && (
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-5lb-gray-100 sm:h-64">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Цена и рейтинг */}
                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-5lb-orange-50 via-5lb-orange-100 to-5lb-red-50 px-4 py-3.5 ring-2 ring-5lb-orange-100/50">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-5lb-orange-700">Цена</p>
                      <p className="mt-1 text-2xl font-black text-5lb-gray-900 sm:text-3xl">
                        {selectedProduct.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    {selectedProduct.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={18}
                              className={index < selectedProduct.rating! ? 'fill-current text-5lb-orange-500' : 'text-5lb-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-black text-5lb-gray-900">{selectedProduct.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Описание */}
                  {selectedProduct.description && (
                    <div className="rounded-2xl bg-5lb-gray-50 px-4 py-3.5 ring-1 ring-5lb-gray-200">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-5lb-gray-700">Описание</p>
                      <p className="text-sm font-medium leading-relaxed text-5lb-gray-700 sm:text-base">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}

                  {/* Информация о покупках */}
                  <div className="rounded-2xl bg-5lb-orange-50 px-4 py-3.5 ring-2 ring-5lb-orange-100/50">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-5lb-orange-600" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-5lb-orange-700">Последняя покупка</p>
                        <p className="mt-1 text-sm font-medium text-5lb-gray-900">{selectedProduct.lastPurchased}</p>
                        {selectedProduct.purchaseCount && selectedProduct.purchaseCount > 1 && (
                          <p className="mt-1 text-xs font-medium text-5lb-orange-600">
                            Всего куплено: {selectedProduct.purchaseCount} раз
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Кнопка покупки */}
                  <motion.button
                    type="button"
                    onClick={() => handleBuyAgain(selectedProduct)}
                    className="w-full rounded-2xl bg-gradient-to-r from-5lb-orange-500 via-5lb-orange-600 to-5lb-red-500 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-5lb-orange-500/40 transition-all hover:shadow-2xl hover:shadow-5lb-red-500/50 sm:px-6 sm:py-4 sm:text-base"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Купить снова
                    </div>
                  </motion.button>
                </div>
          </div>
        </GradientModal>
      )}
    </motion.main>
  );
};
