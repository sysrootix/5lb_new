import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, QrCode, MessageCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { searchProducts, Product, formatPrice } from '../api/catalog';
import { HomeBanner } from '../components/home/HomeBanner';
import { BrandsCarousel } from '../components/home/BrandsCarousel';
import { StoriesCarousel } from '../components/home/StoriesCarousel';
import { AuthBlock } from '../components/home/AuthBlock';
import { GlobalBackground } from '../components/GlobalBackground';
import { useTelegramApp } from '../hooks/useTelegramApp';
import { NewsBlock } from '../components/home/NewsBlock';
import { HitsSection } from '../components/profile/HitsSection';
import { OpeningInviteBlock } from '../components/home/OpeningInviteBlock';
import { getNews, News } from '../api/news';


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

export const HomePage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const bonusBalance = user?.bonusBalance ?? 0;
  const { isTelegramApp, platform } = useTelegramApp();

  // Определяем десктопные платформы
  const isDesktop = ['macos', 'tdesktop', 'weba', 'webk'].includes(platform);

  // Определяем нужен ли отступ для поиска
  const searchTopStyle = (() => {
    // Если это десктопная платформа Telegram - без отступа
    if (isDesktop) return { top: 0 };

    // Если это мобильная платформа Telegram (явно или через isTelegramApp) - отступ 12%
    if (isTelegramApp || ['android', 'android_x', 'ios'].includes(platform)) {
      return { top: '12%' };
    }

    // Fallback для обычного браузера - адаптивно
    return {};
  })();

  const searchTopClass = !isDesktop && !isTelegramApp && !['android', 'android_x', 'ios'].includes(platform)
    ? 'md:top-4'
    : '';

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  // News state
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Banner scroll animations
  const { scrollY } = useScroll();
  const bannerOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const bannerScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const bannerY = useTransform(scrollY, [0, 300], [0, 50]);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoadingNews(true);
      const news = await getNews();
      setNewsList(news);
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
      setNewsList([]);
    } finally {
      setLoadingNews(false);
    }
  };

  // Real-time search
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

  return (
    <main className="min-h-screen pb-24 relative overflow-x-hidden">
      {/* Banners Section with smooth scroll effect */}
      <motion.div
        className="pt-4 mb-4 overflow-hidden"
        style={{
          opacity: bannerOpacity,
          scale: bannerScale,
          y: bannerY,
          transformOrigin: 'top center'
        }}
      >
        <HomeBanner />
      </motion.div>

      {/* Sticky Search Bar with enhanced glassmorphism - отступ только на мобильных */}
      <div className={`sticky z-40 mb-6 ${searchTopClass}`} style={searchTopStyle}>
        <div className="px-4 pt-4 pb-4">
          <div className="relative">
            <div className="relative z-10 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3.5 shadow-lg shadow-[#FF6B00]/10 transition-all focus-within:border-[#FF6B00]/50 focus-within:shadow-[#FF6B00]/20">
              <Search size={20} className="text-[#FF6B00]/60 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                placeholder="Искать со скидками..."
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/50 text-[15px]"
              />
              {isSearching && (
                <div className="h-4 w-4 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}

              {/* QR Scanner Button */}
              <button
                className="p-2 rounded-xl bg-gradient-to-br from-[#FF6B00]/20 to-[#E94B3C]/20 hover:from-[#FF6B00]/30 hover:to-[#E94B3C]/30 border border-[#FF6B00]/20 transition-all flex-shrink-0 active:scale-95"
                onClick={() => {/* TODO: Implement QR scanner */ }}
              >
                <QrCode size={20} className="text-[#FF6B00]" />
              </button>

              {/* Notifications Button */}
              <button
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex-shrink-0 relative active:scale-95"
                onClick={() => navigate('/notifications')}
              >
                <MessageCircle size={20} className="text-white/70" />
                {/* Optional notification dot */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E94B3C] rounded-full shadow-lg shadow-[#E94B3C]/50 animate-pulse" />
              </button>
            </div>

            {/* Search Results Dropdown with glass effect */}
            {showSearchResults && searchQuery.trim().length >= 2 && searchResults.length > 0 && (
              <div
                className="absolute left-0 right-0 mt-2 mx-3 bg-black/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 max-h-[60vh] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {searchResults.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="p-3 border-b border-white/5 last:border-b-0 hover:bg-gradient-to-r hover:from-[#FF6B00]/10 hover:to-[#E94B3C]/10 cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
                      <img src={product.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold bg-gradient-to-r from-[#FF6B00] to-[#E94B3C] bg-clip-text text-transparent">{formatPrice(product.retail_price)}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#FF6B00]/50" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Auth Block (if not authenticated) */}
      {!isAuthenticated && (
        <div className="px-4 mb-6">
          <AuthBlock />
        </div>
      )}

      {/* First News Block */}
      {!loadingNews && newsList.length > 0 && (
        <div className="px-4 mb-8">
          <NewsBlock news={newsList[0]} />
        </div>
      )}

      {/* Brands Grid 3x3 */}
      <div className="mb-8">
        <BrandsCarousel />
      </div>

      {/* Stories Carousel */}
      <StoriesCarousel />

      {/* Second News Block (if exists) */}
      {!loadingNews && newsList.length > 1 && (
        <div className="px-4 mb-8">
          <NewsBlock news={newsList[1]} />
        </div>
      )}

      {/* Hits Section */}
      <div className="px-4 mb-8">
        <HitsSection />
      </div>

      {/* Opening Invite Block */}
      <div className="px-4 mb-8">
        <OpeningInviteBlock />
      </div>
    </main>
  );
};
