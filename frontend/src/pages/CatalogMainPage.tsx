import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  searchProducts, 
  getAllBrands, 
  getCategoriesWithSubcategories,
  getShops,
  Product,
  Brand,
  CategoryWithSubcategories,
  Shop,
  formatPrice, 
  getStockStatus 
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

const CatalogMainPage = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showCitySelector, setShowCitySelector] = useState(false);
  const navigate = useNavigate();
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shopsData, brandsData, categoriesData] = await Promise.all([
        getShops(),
        getAllBrands(),
        getCategoriesWithSubcategories(),
      ]);

      setShops(shopsData);
      setBrands(brandsData.slice(0, 10)); // Показываем только первые 10 брендов
      
      // Автоматически выбираем первый город из списка магазинов
      const cities = [...new Set(shopsData.map(shop => shop.city))];
      if (cities.length > 0 && !selectedCity) {
        setSelectedCity(cities[0]);
      }

      setCategories(categoriesData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  // Поиск в реальном времени
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length >= 2) {
        setIsSearching(true);
        setHasSearched(true);
        try {
          const results = await searchProducts(debouncedSearchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Ошибка поиска:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/catalog/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    navigate(`/catalog/subcategory/${subcategoryId}`);
  };

  const handleBrandClick = (brandId: string) => {
    navigate(`/catalog/search?brand=${brandId}`);
  };

  const handleAllBrandsClick = () => {
    navigate('/catalog/brands');
  };

  const cities = [...new Set(shops.map(shop => shop.city))];
  const filteredShops = selectedCity ? shops.filter(shop => shop.city === selectedCity) : shops;

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen pb-24 pt-8">
      {/* Header Area */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Каталог</h1>
          {/* Выбор города */}
          <div className="relative">
            <button
              onClick={() => setShowCitySelector(!showCitySelector)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-300 hover:text-white border border-white/10 backdrop-blur-md"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">{selectedCity || 'Выберите город'}</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCitySelector && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1E1E1E] rounded-xl shadow-xl border border-white/10 z-20 max-h-64 overflow-y-auto backdrop-blur-xl">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCitySelector(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors text-sm ${
                      selectedCity === city ? 'text-[#FF6B00] font-bold bg-[#FF6B00]/10' : 'text-gray-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Поиск */}
        <div className="relative z-10">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Найти товары..."
            className="w-full px-4 py-3 pl-12 bg-white/5 text-white placeholder-gray-500 border border-white/10 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all backdrop-blur-md"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isSearching && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="h-5 w-5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {/* Результаты поиска в реальном времени */}
        {searchQuery.trim().length >= 2 && searchResults.length > 0 && (
          <div className="mt-3 bg-[#1E1E1E]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 max-h-96 overflow-y-auto absolute left-4 right-4 z-30">
            {searchResults.slice(0, 5).map((product) => (
              <motion.div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="p-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 cursor-pointer transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/5">
                    <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[#FF6B00]">{formatPrice(product.retail_price)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        !product.quanty || product.quanty === 0
                          ? 'bg-red-500/20 text-red-400'
                          : product.quanty < 5
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {getStockStatus(product.quanty)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {searchResults.length > 5 && (
              <div className="p-3 text-center border-t border-white/5">
                <button
                  onClick={handleSearch}
                  className="text-sm text-[#FF6B00] font-bold hover:text-[#FF8534] transition-colors"
                >
                  Показать все результаты ({searchResults.length})
                </button>
              </div>
            )}
          </div>
        )}
        {searchQuery.trim().length >= 2 && !isSearching && hasSearched && searchResults.length === 0 && (
          <div className="mt-3 p-4 bg-[#1E1E1E]/95 backdrop-blur-xl rounded-xl shadow-lg border border-white/10 text-center text-sm text-gray-400 absolute left-4 right-4 z-30">
            Товары не найдены
          </div>
        )}
      </div>

      {/* Блок с брендами - Styled like BrandsSection.tsx */}
      {brands.length > 0 && (
      <div className="px-4 pt-2 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Популярные бренды</h2>
            <button
              onClick={handleAllBrandsClick}
              className="text-sm text-[#FF6B00] font-bold hover:text-[#FF8534] transition-colors"
          >
              Все
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {brands.slice(0, 6).map((brand) => (
              <motion.div
                key={brand.id}
                onClick={() => handleBrandClick(brand.id)}
                whileTap={{ scale: 0.95 }}
                className="aspect-[2/1] bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center p-2 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              >
                {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="max-h-8 max-w-full object-contain filter brightness-0 invert opacity-90" />
                ) : (
                   <span className="text-white font-black italic text-xs text-center uppercase leading-none break-words w-full">
                     {brand.name}
                   </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Категории с подкатегориями */}
      <div className="px-4 pb-6">
        {categories.map((category, categoryIndex) => (
          <div key={category.id} className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 pl-1">{category.name}</h2>
            <div className="grid grid-cols-2 gap-3">
              {category.subcategories.map((subcategory, subIndex) => (
                <motion.button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (categoryIndex * 0.1) + (subIndex * 0.05) }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all text-left group relative overflow-hidden"
                >
                  <div className="flex flex-col items-center justify-center mb-3 relative z-10">
                    {subcategory.icon ? (
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{subcategory.icon}</div>
                    ) : (
                      <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-white/5">
                        <svg className="h-6 w-6 text-gray-400 group-hover:text-[#FF6B00] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-center text-sm leading-tight mb-1 group-hover:text-[#FF6B00] transition-colors relative z-10">
                    {subcategory.name}
                  </h3>
                  {subcategory.productCount !== undefined && (
                    <p className="text-[10px] text-gray-500 text-center relative z-10">
                      {subcategory.productCount} {subcategory.productCount === 1 ? 'товар' : 'товаров'}
                    </p>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogMainPage;
