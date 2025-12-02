import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { getProduct, searchProducts, Product, formatPrice, getStockStatus, getStockStatusClass } from '../api/catalog';
import { SkeletonLoader } from '../components/animations/SkeletonLoader';
import { useAnonymousUser } from '../hooks/useAnonymousUser';
import { useCart } from '../hooks/useCart';

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams] = useSearchParams();
  const shopCode = searchParams.get('shopCode');
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToFavorites, removeFromFavorites, isFavorite: checkFavorite } = useAnonymousUser();
  const { addToCart, updateCartItem, removeFromCart, getItemQuantity, isInCart } = useCart();

  // Проверяем избранное при загрузке товара
  useEffect(() => {
    if (product?.id) {
      setIsFavorite(checkFavorite(product.id));
    }
  }, [product, checkFavorite]);

  useEffect(() => {
    loadProduct();
  }, [productId, shopCode]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      if (productId) {
        // Если shopCode указан, загружаем товар из конкретного магазина
        // Если нет - используем поиск чтобы получить товар со всех магазинов
        if (shopCode) {
          const data = await getProduct(productId, shopCode);
          setProduct(data);
        } else {
          // Ищем товар во всех магазинах через поиск
          const searchResults = await searchProducts(productId);
          const allProducts = searchResults.filter(p => p.id === productId);
          
          if (allProducts.length > 0) {
            // Агрегируем остатки со всех магазинов
            const totalQuantity = allProducts.reduce((sum, p) => {
              return sum + (p.quanty || 0);
            }, 0);
            
            const prices = allProducts
              .map(p => p.retail_price)
              .filter((p): p is number => p !== undefined && p !== null && !isNaN(p));
            const minPrice = prices.length > 0 ? Math.min(...prices) : undefined;
            
            // Берем первый продукт как базовый и обновляем данные
            const baseProduct = allProducts[0];
            setProduct({
              ...baseProduct,
              quanty: totalQuantity,
              retail_price: minPrice !== undefined ? minPrice : baseProduct.retail_price,
              // Сохраняем информацию о всех магазинах
              allShops: allProducts
                .filter(p => p.shopCode && p.shopName)
                .map(p => ({
                  shopCode: p.shopCode!,
                  shopName: p.shopName!,
                  quantity: p.quanty || 0,
                  retail_price: p.retail_price,
                })),
            });
          } else {
            setProduct(null);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <div className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
          <div className="px-4 py-3">
            <SkeletonLoader type="circle" className="w-10 h-10 bg-white/10" />
          </div>
        </div>
        <div className="bg-white/5">
          <SkeletonLoader type="image" className="w-full aspect-square bg-white/5" />
        </div>
        <div className="bg-white/5 mt-2 p-4 space-y-4">
          <SkeletonLoader type="text" count={3} className="bg-white/10" />
          <SkeletonLoader type="text" className="w-1/3 bg-white/10" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <div className="text-white/40 mb-4">
              <svg className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-white/60 mb-6 text-lg font-medium">Товар не найден</p>
            <button
              onClick={() => navigate('/catalog')}
              className="px-6 py-3 bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
            >
              Вернуться к каталогу
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentVariant = product.modifications && product.modifications[selectedVariant];
  const currentPrice = currentVariant?.retail_price || product.retail_price;
  const currentQuantity = currentVariant?.quanty || product.quanty;

  // Копирование артикула
  const handleCopyArticle = async () => {
    try {
      await navigator.clipboard.writeText(product.id);
      toast.success('Артикул скопирован!', {
        icon: '📋',
        duration: 2000,
      });
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = product.id;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Артикул скопирован!', {
        icon: '📋',
        duration: 2000,
      });
    }
  };

  // Избранное
  const handleToggleFavorite = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!product?.id) {
      console.error('Product ID is missing');
      return;
    }
    
    console.log('Toggle favorite clicked', { productId: product.id, isFavorite });
    
    setIsFavoriteLoading(true);
    try {
      if (isFavorite) {
        const success = await removeFromFavorites(product.id);
        console.log('Remove from favorites result:', success);
        if (success) {
          setIsFavorite(false);
          toast.success('Удалено из избранного', {
            icon: '❤️',
            duration: 2000,
          });
        } else {
          toast.error('Не удалось удалить из избранного');
        }
      } else {
        const success = await addToFavorites(product.id);
        console.log('Add to favorites result:', success);
        if (success) {
          setIsFavorite(true);
          toast.success('Добавлено в избранное', {
            icon: '❤️',
            duration: 2000,
          });
        } else {
          toast.error('Не удалось добавить в избранное');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Ошибка при обновлении избранного');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Определяем текущий товар в корзине
  // Если shopCode не указан, проверяем наличие товара в корзине по любому магазину
  const currentModificationIndex =
    product?.modifications && product.modifications.length > 0 ? selectedVariant : undefined;
  
  // Для работы с корзиной нужен shopCode, поэтому используем первый доступный или undefined
  const effectiveShopCode = shopCode || product?.shopCode;
  
  const cartQuantity = product && effectiveShopCode
    ? getItemQuantity(product.id, effectiveShopCode, currentModificationIndex)
    : 0;
  const inCart = product && effectiveShopCode
    ? isInCart(product.id, effectiveShopCode, currentModificationIndex)
    : false;

  // Добавление в корзину
  const handleAddToCart = async () => {
    if (!product) return;
    
    // Если shopCode не указан, используем shopCode из продукта или первый доступный магазин
    const effectiveShopCode = shopCode || product.shopCode;
    if (!effectiveShopCode) {
      toast.error('Не удалось определить магазин');
      return;
    }

    setIsAddingToCart(true);
    try {
      const success = await addToCart(
        product.id,
        effectiveShopCode,
        1,
        currentModificationIndex
      );
      if (success) {
        // Можно добавить визуальную обратную связь
      }
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Изменение количества в корзине
  const handleQuantityChange = async (delta: number) => {
    if (!product) return;
    
    const effectiveShopCode = shopCode || product.shopCode;
    if (!effectiveShopCode) return;

    const newQuantity = cartQuantity + delta;
    if (newQuantity <= 0) {
      await removeFromCart(product.id, effectiveShopCode, currentModificationIndex);
    } else {
      await updateCartItem(product.id, effectiveShopCode, newQuantity, currentModificationIndex);
    }
  };

  // Шаринг товара
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} - ${formatPrice(currentPrice)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Товар успешно отправлен!', {
          icon: '📤',
          duration: 2000,
        });
      } else {
        // Fallback: копируем ссылку
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Ссылка скопирована!', {
          icon: '📋',
          duration: 2000,
        });
      }
    } catch (error: any) {
      // Пользователь отменил шаринг или произошла ошибка
      if (error.name !== 'AbortError') {
        // Fallback: копируем ссылку
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Ссылка скопирована!', {
            icon: '📋',
            duration: 2000,
          });
        } catch (clipboardError) {
          toast.error('Не удалось поделиться товаром');
        }
      }
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Заголовок */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Поделиться"
            >
              <svg className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm-16.5-1.314a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186z" />
              </svg>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleFavorite}
              onMouseDown={(e) => e.preventDefault()}
              disabled={isFavoriteLoading}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? 'bg-5lb-red-500/20 hover:bg-5lb-red-500/30'
                  : 'hover:bg-white/10'
              } ${isFavoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              type="button"
            >
              <svg
                className={`h-6 w-6 transition-colors ${
                  isFavorite ? 'text-5lb-red-500 fill-5lb-red-500' : 'text-white/80'
                }`}
                fill={isFavorite ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Изображение товара */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5"
      >
        <div className="w-full aspect-square bg-white/5 flex items-center justify-center">
          <svg className="h-32 w-32 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </motion.div>

      {/* Информация о товаре */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 mt-2 p-4 border-t border-white/5"
      >
        {/* Категория и бонусы в одной строке */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          {product.categoryName && (
            <span className="px-2.5 py-1 bg-white/10 text-white/80 text-xs rounded-full font-medium">
              {product.categoryName}
            </span>
          )}
          {currentQuantity && currentQuantity > 0 && (
            <span className="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
              +{Math.floor((currentPrice || 0) * 0.05)} Б
            </span>
          )}
        </div>

        {/* Название */}
        <h1 className="text-xl font-bold text-white mb-2">{product.name}</h1>

        {/* Цена */}
        <p className="text-3xl font-bold text-[#FF6B00] mb-4">
          {formatPrice(currentPrice)}
        </p>

        {/* Наличие */}
        <div className="mb-4 flex items-center gap-2">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            !currentQuantity || currentQuantity === 0
              ? 'bg-red-500/20 text-red-400'
              : currentQuantity < 5
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-green-500/20 text-green-400'
          }`}>
            {getStockStatus(currentQuantity)}
          </span>
          {currentQuantity && currentQuantity > 0 && (
            <span className="text-sm text-white/60">
              ({currentQuantity} шт.)
            </span>
          )}
        </div>

        {/* Артикул - мелким текстом внизу */}
        <div className="mb-4 flex items-center gap-2 text-xs text-white/40">
          <span>Артикул: {product.id}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopyArticle}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Копировать артикул"
          >
            <svg className="h-3.5 w-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </motion.button>
        </div>

        {/* Варианты */}
        {product.modifications && product.modifications.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-white mb-3">Выберите вариацию</p>
            <div className="grid grid-cols-3 gap-2">
              {product.modifications.map((mod, index) => (
                <motion.button
                  key={mod.id}
                  onClick={() => setSelectedVariant(index)}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedVariant === index
                      ? 'border-[#FF6B00] bg-[#FF6B00]/20 text-[#FF6B00] shadow-md'
                      : 'border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  <div>{mod.name}</div>
                  <div className="text-xs text-white/40 mt-1">
                    {formatPrice(mod.retail_price)}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* О товаре */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 mt-2 p-4 border-t border-white/5"
      >
        <h2 className="font-semibold text-white mb-3">О товаре</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          {product.categoryName} - высококачественный продукт спортивного питания. 
          Помогает достичь ваших спортивных целей и поддерживать здоровый образ жизни.
        </p>
      </motion.div>

      {/* Магазины */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 mt-2 p-4 border-t border-white/5"
      >
        <h2 className="font-semibold text-white mb-3">Где купить</h2>
        {(product as any).allShops && (product as any).allShops.length > 0 ? (
          <div className="space-y-3">
            {(product as any).allShops.map((shop: any, index: number) => {
              const shopQuantity = shop.quantity || 0;
              return (
                <div key={shop.shopCode || index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{shop.shopName}</p>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                        !shopQuantity || shopQuantity === 0
                          ? 'bg-red-500/20 text-red-400'
                          : shopQuantity < 5
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {getStockStatus(shopQuantity)}
                      </span>
                      {shopQuantity > 0 && (
                        <span className="text-xs text-white/40 ml-2">({shopQuantity} шт.)</span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/product/${product.id}?shopCode=${shop.shopCode}`)}
                      className="text-[#FF6B00] text-sm font-medium hover:text-[#FF8534] transition-colors"
                    >
                      Выбрать
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => navigate('/shops')}
              className="w-full text-center text-[#FF6B00] text-sm font-medium hover:text-[#FF8534] transition-colors py-2"
            >
              Показать все магазины на карте
            </button>
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-white">{product.shopName}</p>
                <span className={`text-sm font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                  !currentQuantity || currentQuantity === 0
                    ? 'bg-red-500/20 text-red-400'
                    : currentQuantity < 5
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {getStockStatus(currentQuantity)}
                </span>
              </div>
              <button
                onClick={() => navigate('/shops')}
                className="text-[#FF6B00] text-sm font-medium hover:text-[#FF8534] transition-colors"
              >
                Показать на карте
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Кнопка добавления в корзину / Управление корзиной */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#180C06] border-t border-white/10 px-4 pt-6 pb-[3%] safe-bottom shadow-lg z-20">
        {inCart ? (
          <div className="space-y-3">
            {/* Управление количеством */}
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuantityChange(-1)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Minus size={20} className="text-white" />
              </motion.button>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  В корзине: {cartQuantity} шт.
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuantityChange(1)}
                disabled={cartQuantity >= (currentQuantity || 0)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} className="text-white" />
              </motion.button>
            </div>
            {/* Кнопка перейти к корзине */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/cart')}
              className="w-full px-4 py-3 mb-[3%] bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 text-white text-base font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Перейти к корзине
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={!currentQuantity || currentQuantity === 0 || isAddingToCart}
            className="w-full px-4 py-3 mb-[3%] bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 text-white text-base font-semibold rounded-xl hover:shadow-lg disabled:bg-gray-700 disabled:cursor-not-allowed transition-all"
          >
            {isAddingToCart ? (
              'Добавление...'
            ) : currentQuantity && currentQuantity > 0 ? (
              'Добавить в корзину'
            ) : (
              'Нет в наличии'
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

