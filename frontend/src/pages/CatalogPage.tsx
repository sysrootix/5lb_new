import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShopCatalog,
  Product,
  Category,
  getShopCatalog,
  formatPrice,
  getStockStatus,
  getStockStatusClass,
} from '../api/catalog';
import { PageLoader } from '../components/PageLoader';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CatalogPage = () => {
  const { shopCode } = useParams<{ shopCode: string }>();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<ShopCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (shopCode) {
      loadCatalog();
    }
  }, [shopCode]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Проверяем кэш в localStorage
      const cacheKey = `catalog_${shopCode}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const CACHE_DURATION = 10 * 60 * 1000; // 10 минут
      
      if (cachedData && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp, 10);
        if (cacheAge < CACHE_DURATION) {
          // Используем кэшированные данные
          const parsedData = JSON.parse(cachedData);
          setCatalog(parsedData);
          if (parsedData.categories.length > 0) {
            setSelectedCategory(parsedData.categories[0].id);
          }
          setLoading(false);
          
          // Загружаем свежие данные в фоне
          try {
            const freshData = await getShopCatalog(shopCode!);
            if (freshData) {
              setCatalog(freshData);
              localStorage.setItem(cacheKey, JSON.stringify(freshData));
              localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
              if (freshData.categories.length > 0) {
                setSelectedCategory(freshData.categories[0].id);
              }
            }
          } catch (backgroundError) {
            // Игнорируем ошибки фоновой загрузки
            console.warn('Ошибка фонового обновления каталога:', backgroundError);
          }
          return;
        }
      }
      
      // Загружаем свежие данные
      const data = await getShopCatalog(shopCode!);
      if (data) {
        setCatalog(data);
        // Сохраняем в кэш
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        // Автоматически выбираем первую категорию
        if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0].id);
        }
      } else {
        setError('Каталог не найден');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке каталога');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!catalog) return [];

    let products: Product[] = [];
    const category = catalog.categories.find((c) => c.id === selectedCategory);
    
    if (category) {
      products = category.products;
    }

    if (debouncedSearchQuery) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    return products;
  }, [catalog, selectedCategory, debouncedSearchQuery]);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !catalog) {
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
            <p className="text-gray-400 mb-6 text-lg">{error || 'Каталог не найден'}</p>
            <button
              onClick={() => navigate('/shops')}
              className="px-6 py-3 bg-[#FF6B00] text-black rounded-xl font-bold hover:bg-orange-500 transition-all active:scale-95 shadow-lg shadow-orange-900/20"
            >
              Вернуться к магазинам
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const products = filteredProducts;

  return (
    <div className="min-h-screen bg-[#1a0f0a] pb-20">
      {/* Заголовок */}
      <div className="bg-[#1E1E1E]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">{catalog.shopname}</h1>
          
          {/* Поиск */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск товаров..."
              className="w-full px-4 py-3 pl-12 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all text-white placeholder-gray-500"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Категории */}
      <div className="bg-[#1E1E1E] border-b border-white/5 sticky top-[160px] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {catalog.categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all font-bold text-sm ${
                  selectedCategory === category.id
                    ? 'bg-[#FF6B00] text-black shadow-lg shadow-orange-900/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {category.name} ({category.products.length})
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Товары */}
      <div className="max-w-7xl mx-auto px-4 py-6">
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
            <p className="text-gray-400 text-lg font-medium">
              {searchQuery ? 'Товары не найдены' : 'В этой категории пока нет товаров'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-[#1E1E1E] rounded-2xl shadow-sm hover:shadow-lg hover:shadow-orange-900/10 transition-all overflow-hidden cursor-pointer border border-white/5 group flex flex-col hover:border-[#FF6B00]/30"
                onClick={() => navigate(`/product/${product.id}${shopCode ? `?shopCode=${shopCode}` : ''}`)}
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

export default CatalogPage;

