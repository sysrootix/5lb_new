import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Truck, Store, Package, MapPin, Calendar, CreditCard, RotateCcw } from 'lucide-react';
import { OrdersIcon } from '@/components/Icons';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { GradientModal } from '@/components/GradientModal';

type PurchaseType = 'online' | 'offline';

interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Purchase {
  id: string;
  type: PurchaseType;
  title: string;
  status: 'process' | 'done' | 'cancelled';
  total: number;
  date: string;
  items: number;
  address?: string;
  paymentMethod?: string;
  deliveryDate?: string;
  purchaseItems?: PurchaseItem[];
}

const MOCK_PURCHASES: Purchase[] = [
  {
    id: 'ORD-50231',
    type: 'online',
    title: 'Онлайн-заказ №50231',
    status: 'process',
    total: 4590,
    date: '27 октября 2025',
    items: 4,
    address: 'г. Москва, ул. Ленина, д. 10, кв. 45',
    paymentMethod: 'Картой онлайн',
    deliveryDate: '29 октября 2025, 14:00-16:00',
    purchaseItems: [
      { id: '1', name: 'Протеин 5LB Ultra Whey 908 г', quantity: 2, price: 3290 },
      { id: '2', name: 'BCAA 2:1:1 в порошке 300 г', quantity: 1, price: 890 },
      { id: '3', name: 'Креатин моногидрат 300 г', quantity: 1, price: 410 }
    ]
  },
  {
    id: 'ORD-50198',
    type: 'offline',
    title: 'Покупка в магазине (Хабаровск, Ленина 45)',
    status: 'done',
    total: 1890,
    date: '15 октября 2025',
    items: 2,
    address: 'г. Хабаровск, ул. Ленина, д. 45',
    paymentMethod: 'Наличными',
    purchaseItems: [
      { id: '4', name: 'L-Carnitine Liquid 500 мл', quantity: 1, price: 1290 },
      { id: '5', name: 'Витамин D3 2000 IU', quantity: 1, price: 600 }
    ]
  },
  {
    id: 'ORD-50144',
    type: 'online',
    title: 'Онлайн-заказ №50144',
    status: 'done',
    total: 3290,
    date: '30 сентября 2025',
    items: 3,
    address: 'г. Москва, ул. Пушкина, д. 5, кв. 12',
    paymentMethod: 'Картой онлайн',
    deliveryDate: '1 октября 2025, 10:00-12:00',
    purchaseItems: [
      { id: '6', name: 'Протеин 5LB Ultra Whey 908 г', quantity: 1, price: 3290 }
    ]
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

export const ProfilePurchasesPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PurchaseType>('online');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  useLockBodyScroll(!!selectedPurchase);

  const filteredPurchases = useMemo(
    () => MOCK_PURCHASES.filter((purchase) => purchase.type === filter),
    [filter]
  );

  const handleRepeatOrder = (purchase: Purchase) => {
    toast.success('Товары добавлены в корзину');
    setSelectedPurchase(null);
    navigate('/catalog');
  };

  const handleProductClick = (productId: string) => {
    navigate(`/catalog?product=${productId}`);
    setSelectedPurchase(null);
  };

  return (
    <motion.main
      className="min-h-screen pb-24 pt-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Title */}
      <div className="px-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Мои покупки</h1>
      </div>

      <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-20 sm:gap-6">
        <motion.div
          className="flex items-center gap-1 rounded-2xl bg-white/5 p-1 border border-white/10"
          variants={itemVariants}
        >
          <button
            type="button"
            onClick={() => setFilter('online')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              filter === 'online'
                ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-900/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Онлайн
          </button>
          <button
            type="button"
            onClick={() => setFilter('offline')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              filter === 'offline'
                ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-900/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            В магазине
          </button>
        </motion.div>

        {filteredPurchases.length === 0 ? (
          <motion.div
            className="group relative overflow-hidden rounded-3xl bg-white/5 p-8 text-center border border-white/10"
            variants={itemVariants}
            whileHover={{ y: -2 }}
          >
            <div className="relative flex flex-col items-center">
              <div className="mb-4 p-4 bg-white/5 rounded-full">
                 <OrdersIcon className="h-12 w-12 text-white/20" />
              </div>
              <p className="text-base text-gray-400 max-w-[250px]">
                В этом разделе пока пусто. Оформите заказ — он появится здесь автоматически.
              </p>
            </div>
          </motion.div>
        ) : (
          filteredPurchases.map((purchase) => {
            const isOnline = purchase.type === 'online';
            const statusIcon =
              purchase.status === 'process'
                ? Truck
                : purchase.status === 'done'
                ? Package
                : Store;
            const StatusIcon = statusIcon;

            const statusLabel =
              purchase.status === 'process'
                ? 'В пути'
                : purchase.status === 'done'
                ? 'Завершён'
                : 'Отменён';
            
            const statusColors = 
              purchase.status === 'done'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : purchase.status === 'process'
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                : 'bg-red-500/10 text-red-500 border border-red-500/20';

            return (
              <motion.div
                key={purchase.id}
                className="group relative overflow-hidden rounded-3xl bg-white/5 p-5 border border-white/10 transition-colors hover:bg-white/10 sm:p-6"
                variants={itemVariants}
                whileHover={{ y: -2 }}
              >
                <div className="relative flex items-start gap-4">
                  <motion.div 
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 sm:h-14 sm:w-14"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <StatusIcon size={24} strokeWidth={1.5} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h2 className="text-base font-bold text-white sm:text-lg line-clamp-1">{purchase.title}</h2>
                      <span
                        className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:px-3 sm:text-xs ${statusColors}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      {purchase.date} • {purchase.items} товара(ов)
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-white sm:text-xl">
                        {purchase.total.toLocaleString('ru-RU')} ₽
                      </p>
                      <motion.button
                        type="button"
                        className="rounded-xl bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-900/20 transition-all hover:bg-orange-500"
                        onClick={() => setSelectedPurchase(purchase)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Подробнее
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Мобильное модальное окно деталей заказа */}
      {selectedPurchase && (() => {
        const statusIcon =
          selectedPurchase.status === 'process'
            ? Truck
            : selectedPurchase.status === 'done'
            ? Package
            : Store;
        const ModalStatusIcon = statusIcon;
        const modalStatusLabel =
          selectedPurchase.status === 'process'
            ? 'В пути'
            : selectedPurchase.status === 'done'
            ? 'Завершён'
            : 'Отменён';

        return (
          <GradientModal
            isOpen={!!selectedPurchase}
            onClose={() => setSelectedPurchase(null)}
            title={selectedPurchase.title}
            subtitle={selectedPurchase.id}
            icon={OrdersIcon}
            maxWidth="2xl"
          >
            <div className="p-6 text-white">
              <div className="space-y-6">
                {/* Статус */}
                <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <ModalStatusIcon className="h-5 w-5 text-[#FF6B00]" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Статус заказа</p>
                      <p className="mt-1 text-sm font-bold text-white">{modalStatusLabel}</p>
                    </div>
                  </div>
                </div>

                {/* Товары */}
                {selectedPurchase.purchaseItems && selectedPurchase.purchaseItems.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-sm font-bold text-white sm:text-base">Товары в заказе</h4>
                    <div className="space-y-3">
                      {selectedPurchase.purchaseItems.map((item) => (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={() => handleProductClick(item.id)}
                          className="w-full flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 border border-white/5 transition-all hover:bg-white/10"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-bold text-[#FF6B00]">
                            {item.quantity}x
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-white sm:text-base line-clamp-2">{item.name}</p>
                            <p className="mt-0.5 text-xs text-gray-400">
                              {item.price.toLocaleString('ru-RU')} ₽ / шт.
                            </p>
                          </div>
                          <p className="text-sm font-bold text-white sm:text-base">
                            {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Информация о доставке */}
                {selectedPurchase.type === 'online' && (
                  <div className="space-y-3">
                    {selectedPurchase.address && (
                      <div className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                        <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Адрес доставки</p>
                          <p className="mt-1 text-sm font-medium text-white">{selectedPurchase.address}</p>
                        </div>
                      </div>
                    )}
                    {selectedPurchase.deliveryDate && (
                      <div className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                        <Calendar className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Доставка</p>
                          <p className="mt-1 text-sm font-medium text-white">{selectedPurchase.deliveryDate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Способ оплаты */}
                {selectedPurchase.paymentMethod && (
                  <div className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                    <CreditCard className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Способ оплаты</p>
                      <p className="mt-1 text-sm font-medium text-white">{selectedPurchase.paymentMethod}</p>
                    </div>
                  </div>
                )}

                {/* Итого */}
                <div className="rounded-2xl bg-gradient-to-r from-[#2A1205] to-[#180C06] border border-white/10 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-400 sm:text-base">Итого</p>
                    <p className="text-xl font-bold text-[#FF6B00] sm:text-2xl">
                      {selectedPurchase.total.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>

                {/* Кнопка Повторить */}
                <motion.button
                  type="button"
                  onClick={() => handleRepeatOrder(selectedPurchase)}
                  className="w-full rounded-2xl bg-[#FF6B00] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-orange-900/20 transition-all hover:bg-orange-500 sm:px-6 sm:py-4 sm:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Повторить заказ
                  </div>
                </motion.button>
              </div>
            </div>
          </GradientModal>
        );
      })()}
    </motion.main>
  );
};
