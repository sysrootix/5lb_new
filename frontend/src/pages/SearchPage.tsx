import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { searchProducts, Product, formatPrice, getStockStatus } from '../api/catalog';
import { ProductCardSkeleton } from '../components/animations/SkeletonLoader';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setProducts([]);
    }
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const results = await searchProducts(query);
      setProducts(results);
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Агрегируем товары с одинаковым ID
  const aggregatedProducts = products.reduce((acc, product) => {
    const existing = acc.find(p => p.id === product.id);
    if (existing) {
      existing.quanty = (existing.quanty || 0) + (product.quanty || 0);
      if (!existing.retail_price || (product.retail_price && product.retail_price < existing.retail_price)) {
        existing.retail_price = product.retail_price;
      }
    } else {
      acc.push({ ...product });
    }
    return acc;
  }, [] as Product[]);

  return (
    <div className="min-h-screen bg-5lb-gray-50 pb-20">
      {/* Заголовок */}
      <div className="bg-white border-b border-5lb-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/catalog')}
            className="p-2 -ml-2 hover:bg-5lb-gray-100 rounded-lg transition-colors"
          >
            <svg className="h-6 w-6 text-5lb-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-5lb-gray-900">Поиск</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Результаты */}
      <div className="px-4 py-6">
        {loading ? (
          <ProductCardSkeleton count={6} />
        ) : query.trim() ? (
          aggregatedProducts.length > 0 ? (
            <>
              <p className="text-sm text-5lb-gray-500 mb-4">
                Найдено: {aggregatedProducts.length} {aggregatedProducts.length === 1 ? 'товар' : 'товаров'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {aggregatedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer border border-5lb-gray-100 group flex flex-col"
                    onClick={() => navigate(`/product/${product.id}`)}
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

                      {/* Кнопка - всегда внизу */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`);
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
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-5lb-gray-400 mb-4">
                <svg className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-5lb-gray-600 text-lg font-medium">Товары не найдены</p>
              <p className="text-sm text-5lb-gray-500 mt-2">Попробуйте изменить запрос</p>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="text-5lb-gray-400 mb-4">
              <svg className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-5lb-gray-600 text-lg font-medium">Введите поисковый запрос</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

