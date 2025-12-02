import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { getAllBrands, getProductsByBrand, Brand, Product, formatPrice, getStockStatus } from '../api/catalog';

const BrandsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedBrandId = searchParams.get('brand');
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (selectedBrandId && brands.length > 0) {
      const brand = brands.find(b => b.id === selectedBrandId);
      if (brand) {
        setSelectedBrand(brand);
        loadBrandProducts(brand.id);
      }
    }
  }, [selectedBrandId, brands]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const brandsData = await getAllBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error('Ошибка загрузки брендов:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBrandProducts = async (brandId: string) => {
    try {
      setLoadingProducts(true);
      const products = await getProductsByBrand(brandId);
      setBrandProducts(products);
    } catch (error) {
      console.error('Ошибка загрузки товаров бренда:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Получаем уникальные первые буквы брендов
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    brands.forEach(brand => {
      const firstLetter = brand.name.charAt(0).toUpperCase();
      if (/[А-ЯA-Z]/.test(firstLetter)) {
        letters.add(firstLetter);
      }
    });
    return Array.from(letters).sort();
  }, [brands]);

  // Фильтруем бренды по поиску и букве
  const filteredBrands = useMemo(() => {
    let filtered = brands;

    // Фильтр по поиску
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(query)
      );
    }

    // Фильтр по букве
    if (selectedLetter) {
      filtered = filtered.filter(brand =>
        brand.name.charAt(0).toUpperCase() === selectedLetter
      );
    }

    return filtered;
  }, [brands, searchQuery, selectedLetter]);

  const handleBrandClick = (brand: Brand) => {
    setSelectedBrand(brand);
    loadBrandProducts(brand.id);
    navigate(`/catalog/brands?brand=${brand.id}`, { replace: true });
  };

  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setBrandProducts([]);
    navigate('/catalog/brands', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-5lb-gray-50 pb-20">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="h-8 bg-5lb-gray-200 rounded-lg w-32 shimmer mb-4"></div>
            <div className="h-10 bg-5lb-gray-200 rounded-xl w-full shimmer"></div>
          </div>
        </div>
        <div className="px-4 py-6">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-16 w-16 bg-5lb-gray-200 rounded-full shimmer mx-auto mb-3"></div>
                <div className="h-4 bg-5lb-gray-200 rounded shimmer mb-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Если выбран бренд, показываем его товары
  if (selectedBrand) {
    return (
      <div className="min-h-screen bg-5lb-gray-50 pb-20">
        {/* Заголовок */}
        <div className="bg-white border-b border-5lb-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToBrands}
                  className="p-2 hover:bg-5lb-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-6 w-6 text-5lb-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-5lb-gray-900">{selectedBrand.name}</h1>
              </div>
            </div>
            {selectedBrand.description && (
              <p className="text-sm text-5lb-gray-600 ml-12">{selectedBrand.description}</p>
            )}
          </div>
        </div>

        {/* Товары бренда */}
        <div className="px-4 py-6">
          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="w-full aspect-square bg-5lb-gray-200 rounded-lg shimmer mb-3"></div>
                  <div className="h-4 bg-5lb-gray-200 rounded shimmer mb-2"></div>
                  <div className="h-3 bg-5lb-gray-200 rounded shimmer w-2/3"></div>
                </div>
              ))}
            </div>
          ) : brandProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5lb-gray-400 mb-4">
                <svg className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-5lb-gray-600 text-lg font-medium">Товары этого бренда пока не добавлены</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-5lb-gray-600 mb-4">
                Найдено: {brandProducts.length} {brandProducts.length === 1 ? 'товар' : 'товаров'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {brandProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/product/${product.id}${product.shopCode ? `?shopCode=${product.shopCode}` : ''}`)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer border border-5lb-gray-100 group flex flex-col"
                  >
                    <div className="w-full aspect-square bg-gradient-to-br from-5lb-orange-50 to-5lb-red-50 flex items-center justify-center flex-shrink-0">
                      <svg className="h-16 w-16 text-5lb-gray-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-sm font-semibold text-5lb-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <div className="mb-2">
                        <p className="text-xl font-bold bg-gradient-to-r from-5lb-orange-600 to-5lb-red-600 bg-clip-text text-transparent">
                          {formatPrice(product.retail_price)}
                        </p>
                      </div>
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
                      </div>
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
            </div>
          )}
        </div>
      </div>
    );
  }

  // Показываем список всех брендов
  return (
    <div className="min-h-screen bg-5lb-gray-50 pb-20">
      {/* Заголовок */}
      <div className="bg-white border-b border-5lb-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/catalog')}
                className="p-2 hover:bg-5lb-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6 text-5lb-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-5lb-gray-900">Все бренды</h1>
            </div>
          </div>
          
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-5lb-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск бренда..."
              className="w-full pl-12 pr-10 py-3 bg-5lb-gray-50 border-2 border-5lb-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-5lb-orange-500/20 focus:border-5lb-orange-500 transition-all text-5lb-gray-900 placeholder-5lb-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-5lb-gray-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-5lb-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Список брендов */}
        <div className="flex-1 px-4 py-6">
          {filteredBrands.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5lb-gray-400 mb-4">
                <svg className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-5lb-gray-600 text-lg font-medium">Бренды не найдены</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-5lb-gray-600 mb-4">
                Найдено: {filteredBrands.length} {filteredBrands.length === 1 ? 'бренд' : 'брендов'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {filteredBrands.map((brand, index) => (
                  <motion.button
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBrandClick(brand)}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all text-left border border-5lb-gray-100 group"
                  >
                    <div className="flex flex-col items-center justify-center mb-3">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="h-16 w-16 mb-2 object-contain group-hover:scale-110 transition-transform" />
                      ) : (
                        <div className="h-16 w-16 bg-gradient-to-br from-5lb-orange-100 to-5lb-red-100 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <span className="text-2xl font-bold text-5lb-gray-700">{brand.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-5lb-gray-900 text-center text-sm leading-tight mb-1">
                      {brand.name}
                    </h3>
                    {brand.productCount !== undefined && (
                      <p className="text-xs text-5lb-gray-500 text-center">
                        {brand.productCount} {brand.productCount === 1 ? 'товар' : 'товаров'}
                      </p>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Боковая панель с алфавитом */}
        {availableLetters.length > 0 && (
          <div className="w-12 bg-white border-l border-5lb-gray-200 sticky top-[180px] h-[calc(100vh-180px)] overflow-y-auto py-4">
            <div className="flex flex-col items-center gap-1">
              {availableLetters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(selectedLetter === letter ? null : letter);
                    setSearchQuery('');
                  }}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-lg transition-all ${
                    selectedLetter === letter
                      ? 'bg-5lb-orange-500 text-white'
                      : 'text-5lb-gray-600 hover:bg-5lb-gray-100'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;

