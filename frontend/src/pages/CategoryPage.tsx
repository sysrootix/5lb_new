import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProductsByCategory, Product, formatPrice, getStockStatus, getStockStatusClass } from '../api/catalog';
import { ProductCardSkeleton } from '../components/animations/SkeletonLoader';

// Категории загружаются динамически из API

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Агрегируем остатки для товаров с одинаковым ID
  const aggregateProducts = (productsList: any[]): Product[] => {
    const productMap = new Map<string, any>();
    
    productsList.forEach((product) => {
      // Нормализуем поле количества (может быть quantity или quanty)
      const qty = product.quanty !== undefined ? product.quanty : (product.quantity || 0);
      const price = product.retail_price !== undefined ? product.retail_price : (product.retailPrice || 0);
      
      const existing = productMap.get(product.id);
      if (existing) {
        // Суммируем остатки
        const existingQty = existing.quanty || 0;
        existing.quanty = existingQty + qty;
        // Берем минимальную цену
        if (!existing.retail_price || (price && price < existing.retail_price)) {
          existing.retail_price = price;
        }
        // Объединяем модификации если они есть
        if (product.modifications && Array.isArray(product.modifications)) {
          const existingMods = (existing.modifications as any[]) || [];
          const newMods = product.modifications as any[];
          // Объединяем модификации, суммируя остатки для одинаковых модификаций
          newMods.forEach((newMod) => {
            const existingMod = existingMods.find((m) => m.id === newMod.id || m.name === newMod.name);
            if (existingMod) {
              existingMod.quanty = (existingMod.quanty || 0) + (newMod.quanty || 0);
            } else {
              existingMods.push(newMod);
            }
          });
          existing.modifications = existingMods;
        }
      } else {
        productMap.set(product.id, { 
          ...product,
          quanty: qty,
          retail_price: price
        });
      }
    });
    
    return Array.from(productMap.values());
  };

  useEffect(() => {
    loadProducts();
  }, [categoryId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем товары по категории из всех магазинов
      if (categoryId) {
        const data = await getProductsByCategory(categoryId);
        // Агрегируем остатки для товаров с одинаковым ID
        const aggregated = aggregateProducts(data);
        setProducts(aggregated);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string, shopCode?: string) => {
    navigate(`/product/${productId}${shopCode ? `?shopCode=${shopCode}` : ''}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a0f0a] pb-20">
        <div className="bg-[#1E1E1E]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="h-8 bg-white/5 rounded-lg w-24 shimmer mb-2"></div>
            <div className="h-4 bg-white/5 rounded w-32 shimmer"></div>
          </div>
        </div>
        <div className="px-4 py-6">
          <ProductCardSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a0f0a]">
        <div className="text-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-6 text-lg">{error}</p>
            <button
              onClick={() => navigate('/catalog')}
              className="px-6 py-3 bg-[#FF6B00] text-black rounded-xl font-bold hover:bg-orange-500 transition-all active:scale-95 shadow-lg shadow-orange-900/20"
            >
              Назад к каталогу
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Получаем название категории из первого товара или используем ID
  const categoryName = products.length > 0 && products[0].categoryName 
    ? products[0].categoryName 
    : categoryId || 'Категория';

  return (
    <div className="min-h-screen bg-[#1a0f0a] pb-20">
      {/* Заголовок */}
      <div className="bg-[#1E1E1E]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-10 shadow-lg shadow-black/20">
        <div className="px-4 py-4">
          <div className="flex items-center mb-2">
            <h1 className="text-xl font-bold text-white">{categoryName}</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12 font-medium">
            Найдено: {products.length} {products.length === 1 ? 'товар' : 'товаров'}
          </p>
        </div>
      </div>

      {/* Товары */}
      <div className="px-4 py-6">
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-gray-600 mb-4">
              <svg className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg font-medium">Товары в этой категории пока не добавлены</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={`${product.id}-${product.shopCode}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => handleProductClick(product.id)}
                className="bg-[#1E1E1E] rounded-2xl shadow-sm hover:shadow-lg hover:shadow-orange-900/10 transition-all overflow-hidden cursor-pointer border border-white/5 group flex flex-col hover:border-[#FF6B00]/30"
              >
                {/* Изображение (плейсхолдер) */}
                <div className="w-full aspect-square bg-white/5 flex items-center justify-center flex-shrink-0 border-b border-white/5">
                  <svg className="h-16 w-16 text-gray-600 group-hover:text-[#FF6B00] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  {/* Название товара */}
                  <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-[#FF6B00] transition-colors">
                    {product.name}
                  </h3>

                  {/* Цена */}
                  <div className="mb-2">
                    <p className="text-xl font-black text-[#FF6B00]">
                      {formatPrice(product.retail_price)}
                    </p>
                  </div>

                  {/* Наличие */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      !product.quanty || product.quanty === 0
                        ? 'bg-red-500/20 text-red-400'
                        : product.quanty < 5
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {getStockStatus(product.quanty)}
                    </span>
                    {product.quanty && product.quanty > 0 && (
                      <span className="text-xs text-gray-500 font-medium">
                        {product.quanty} шт.
                      </span>
                    )}
                  </div>

                  {/* Модификации */}
                  {product.modifications && product.modifications.length > 0 && (
                    <div className="mb-3 pb-3 border-b border-white/5">
                      <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">
                        Варианты ({product.modifications.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.modifications.slice(0, 2).map((mod) => (
                          <span
                            key={mod.id}
                            className="text-[10px] px-2 py-1 bg-white/5 text-gray-400 rounded-lg font-medium border border-white/5"
                          >
                            {mod.name}
                          </span>
                        ))}
                        {product.modifications.length > 2 && (
                          <span className="text-[10px] px-2 py-1 bg-[#FF6B00]/10 text-[#FF6B00] rounded-lg font-bold border border-[#FF6B00]/20">
                            +{product.modifications.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Кнопка - всегда внизу */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: добавить в корзину
                    }}
                    disabled={!product.quanty || product.quanty === 0}
                    className="mt-auto w-full px-4 py-3 bg-[#FF6B00] text-black rounded-xl font-bold hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-900/20 transition-all disabled:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none active:scale-95 text-sm"
                  >
                    {product.quanty && product.quanty > 0 ? 'В корзину' : 'Нет в наличии'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

