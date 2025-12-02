import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getProductsBySubcategory, 
  getBrandsBySubcategory,
  Product, 
  Brand,
  formatPrice, 
  getStockStatus 
} from '../api/catalog';
import { ProductCardSkeleton } from '../components/animations/SkeletonLoader';

interface Filters {
  brandIds: string[];
  characteristics: Record<string, any>;
}

const SubcategoryPage = () => {
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    brandIds: [],
    characteristics: {},
  });
  const [characteristicsOptions, setCharacteristicsOptions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (subcategoryId) {
      loadData();
    }
  }, [subcategoryId]);

  useEffect(() => {
    if (subcategoryId) {
      loadProducts();
    }
  }, [subcategoryId, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!subcategoryId) return;

      const [brandsData, productsData] = await Promise.all([
        getBrandsBySubcategory(subcategoryId),
        getProductsBySubcategory(subcategoryId),
      ]);

      setBrands(brandsData);
      setProducts(productsData);

      // Извлекаем уникальные характеристики из товаров
      const charMap: Record<string, Set<any>> = {};
      productsData.forEach((product) => {
        if (product.characteristics && typeof product.characteristics === 'object') {
          Object.entries(product.characteristics).forEach(([key, value]) => {
            if (!charMap[key]) {
              charMap[key] = new Set();
            }
            if (Array.isArray(value)) {
              value.forEach((v) => charMap[key].add(v));
            } else {
              charMap[key].add(value);
            }
          });
        }
      });

      const charOptions: Record<string, any[]> = {};
      Object.entries(charMap).forEach(([key, values]) => {
        charOptions[key] = Array.from(values).filter(v => v !== null && v !== undefined && v !== '');
      });

      setCharacteristicsOptions(charOptions);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      if (!subcategoryId) return;

      const productsData = await getProductsBySubcategory(subcategoryId, filters);
      setProducts(productsData);
    } catch (err: any) {
      console.error('Ошибка загрузки товаров:', err);
    }
  };

  const handleFilterChange = (type: 'brand' | 'characteristic', key: string, value: any) => {
    if (type === 'brand') {
      setFilters((prev) => {
        const newBrandIds = prev.brandIds.includes(value)
          ? prev.brandIds.filter((id) => id !== value)
          : [...prev.brandIds, value];
        return { ...prev, brandIds: newBrandIds };
      });
    } else {
      setFilters((prev) => {
        const newCharacteristics = { ...prev.characteristics };
        if (newCharacteristics[key] === value) {
          delete newCharacteristics[key];
        } else {
          newCharacteristics[key] = value;
        }
        return { ...prev, characteristics: newCharacteristics };
      });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      brandIds: [],
      characteristics: {},
    });
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    loadProducts();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Подкатегория товаров',
        text: 'Посмотрите товары в этой подкатегории',
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Ссылка скопирована в буфер обмена');
      });
    }
  };

  const handleProductClick = (productId: string, shopCode?: string) => {
    navigate(`/product/${productId}${shopCode ? `?shopCode=${shopCode}` : ''}`);
  };

  const activeFiltersCount = filters.brandIds.length + Object.keys(filters.characteristics).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-5lb-gray-50 pb-20">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="h-8 bg-5lb-gray-200 rounded-lg w-24 shimmer mb-2"></div>
            <div className="h-4 bg-5lb-gray-200 rounded w-32 shimmer"></div>
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
      <div className="flex items-center justify-center min-h-screen bg-5lb-gray-50">
        <div className="text-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <div className="text-5lb-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-5lb-gray-700 mb-6 text-lg">{error}</p>
            <button
              onClick={() => navigate('/catalog')}
              className="px-6 py-3 bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
            >
              Назад к каталогу
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const subcategoryName = products.length > 0 && products[0].categoryName
    ? products[0].categoryName
    : 'Подкатегория';

  return (
    <div className="min-h-screen bg-5lb-gray-50 pb-20">
      {/* Заголовок */}
      <div className="bg-white border-b border-5lb-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center flex-1 min-w-0">
              <h1 className="text-xl font-bold text-5lb-gray-900 truncate">{subcategoryName}</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <button
                onClick={handleShare}
                className="p-2 text-5lb-gray-400 hover:text-5lb-orange-600 transition-colors"
                title="Поделиться"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm-16.5-1.314a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186z" />
                </svg>
              </button>
              <button
                onClick={() => setShowFilters(true)}
                className="relative px-4 py-2 bg-5lb-gray-100 hover:bg-5lb-gray-200 rounded-lg transition-colors text-sm font-medium text-5lb-gray-700"
              >
                Фильтр
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-5lb-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <p className="text-sm text-5lb-gray-600 ml-12">
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
            <div className="text-5lb-gray-400 mb-4">
              <svg className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-5lb-gray-600 text-lg font-medium">
              {activeFiltersCount > 0 ? 'Товары не найдены по выбранным фильтрам' : 'Товары в этой подкатегории пока не добавлены'}
            </p>
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
                onClick={() => handleProductClick(product.id, product.shopCode)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer border border-5lb-gray-100 group flex flex-col"
              >
                {/* Изображение */}
                <div className="w-full aspect-square bg-gradient-to-br from-5lb-orange-50 to-5lb-red-50 flex items-center justify-center flex-shrink-0">
                  <svg className="h-16 w-16 text-5lb-gray-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  {/* Название товара */}
                  <h3 className="text-sm font-semibold text-5lb-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  {/* Бренд */}
                  {product.brand && (
                    <p className="text-xs text-5lb-gray-500 mb-2">{product.brand.name}</p>
                  )}

                  {/* Цена */}
                  <div className="mb-2">
                    <p className="text-xl font-bold bg-gradient-to-r from-5lb-orange-600 to-5lb-red-600 bg-clip-text text-transparent">
                      {formatPrice(product.retail_price)}
                    </p>
                  </div>

                  {/* Наличие */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      !product.quanty || product.quanty === 0
                        ? 'bg-red-100 text-red-700'
                        : product.quanty < 5
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {getStockStatus(product.quanty)}
                    </span>
                    {product.quanty && product.quanty > 0 && (
                      <span className="text-xs text-5lb-gray-500">
                        {product.quanty} шт.
                      </span>
                    )}
                  </div>

                  {/* Кнопка */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: добавить в корзину
                    }}
                    disabled={!product.quanty || product.quanty === 0}
                    className="mt-auto w-full px-4 py-2.5 bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:bg-5lb-gray-300 disabled:cursor-not-allowed active:scale-95 text-sm"
                  >
                    {product.quanty && product.quanty > 0 ? 'В корзину' : 'Нет в наличии'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно фильтров */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-5lb-gray-900">Фильтры</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-5lb-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="h-6 w-6 text-5lb-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Бренды */}
                {brands.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-5lb-gray-900 mb-3">Бренды</h3>
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <label
                          key={brand.id}
                          className="flex items-center gap-3 p-3 hover:bg-5lb-gray-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.brandIds.includes(brand.id)}
                            onChange={() => handleFilterChange('brand', '', brand.id)}
                            className="w-5 h-5 text-5lb-orange-600 rounded focus:ring-5lb-orange-500"
                          />
                          <span className="text-sm text-5lb-gray-700">{brand.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Характеристики */}
                {Object.keys(characteristicsOptions).length > 0 && (
                  <div className="space-y-6">
                    {Object.entries(characteristicsOptions).map(([key, values]) => (
                      <div key={key}>
                        <h3 className="text-lg font-semibold text-5lb-gray-900 mb-3 capitalize">{key}</h3>
                        <div className="space-y-2">
                          {values.map((value, idx) => {
                            const isSelected = filters.characteristics[key] === value;
                            return (
                              <label
                                key={idx}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-5lb-orange-50 border-2 border-5lb-orange-500'
                                    : 'hover:bg-5lb-gray-50 border-2 border-transparent'
                                }`}
                              >
                                <div className="relative flex items-center justify-center">
                                  <input
                                    type="radio"
                                    name={key}
                                    checked={isSelected}
                                    onChange={() => handleFilterChange('characteristic', key, value)}
                                    className="sr-only"
                                  />
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'border-5lb-orange-500 bg-5lb-orange-500'
                                      : 'border-5lb-gray-300 bg-white'
                                  }`}>
                                    {isSelected && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                </div>
                                <span className={`text-sm font-medium ${
                                  isSelected ? 'text-5lb-orange-700' : 'text-5lb-gray-700'
                                }`}>{String(value)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Кнопки */}
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 px-4 py-3 bg-5lb-gray-100 hover:bg-5lb-gray-200 text-5lb-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Сбросить
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubcategoryPage;

