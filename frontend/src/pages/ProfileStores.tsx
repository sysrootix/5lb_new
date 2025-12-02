import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, ExternalLink } from 'lucide-react';

interface StoreLocation {
  id: string;
  city: string;
  address: string;
  workingHours: string;
}

const STORES: StoreLocation[] = [
  {
    id: 'store-1',
    city: 'Хабаровск',
    address: 'ул. Ленина, 45',
    workingHours: 'Ежедневно 10:00 — 21:00'
  },
  {
    id: 'store-2',
    city: 'Комсомольск-на-Амуре',
    address: 'пр-т Мира, 26',
    workingHours: 'Пн-Сб 10:00 — 20:00, Вс 11:00 — 19:00'
  },
  {
    id: 'store-3',
    city: 'Владивосток',
    address: 'ул. Светланская, 63',
    workingHours: 'Ежедневно 11:00 — 21:00'
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

const openMap = (address: string, provider: '2gis' | 'yandex' | 'google') => {
  const query = encodeURIComponent(`5LB ${address}`);
  const links = {
    '2gis': `https://2gis.ru/search/${query}`,
    yandex: `https://yandex.ru/maps/?text=${query}`,
    google: `https://www.google.com/maps/search/?api=1&query=${query}`
  };
  window.open(links[provider], '_blank');
};

export const ProfileStoresPage = () => {
  const navigate = useNavigate();

  return (
    <motion.main
      className="min-h-screen bg-white pb-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ring-1 ring-5lb-gray-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} className="text-5lb-gray-700" />
          </motion.button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-5lb-orange-500">
              Наши магазины
            </p>
            <h1 className="text-2xl font-black text-5lb-gray-900">Магазины 5LB</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-6 px-4">
        {STORES.map((store) => (
          <motion.div
            key={store.id}
            className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-5lb-gray-100"
            variants={itemVariants}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-5lb-orange-100 text-5lb-orange-500">
                <MapPin size={22} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-5lb-gray-900">{store.city}</h2>
                <p className="mt-1 text-sm text-5lb-gray-700">{store.address}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-5lb-gray-500">
                  {store.workingHours}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openMap(store.address, '2gis')}
                className="inline-flex items-center gap-2 rounded-2xl bg-5lb-orange-100 px-4 py-2 text-xs font-semibold text-5lb-orange-600 transition hover:bg-5lb-orange-200"
              >
                <Navigation size={14} />
                Открыть в 2ГИС
              </button>
              <button
                type="button"
                onClick={() => openMap(store.address, 'yandex')}
                className="inline-flex items-center gap-2 rounded-2xl bg-5lb-gray-100 px-4 py-2 text-xs font-semibold text-5lb-gray-700 transition hover:bg-5lb-gray-200"
              >
                <ExternalLink size={14} />
                Яндекс карты
              </button>
              <button
                type="button"
                onClick={() => openMap(store.address, 'google')}
                className="inline-flex items-center gap-2 rounded-2xl bg-5lb-gray-100 px-4 py-2 text-xs font-semibold text-5lb-gray-700 transition hover:bg-5lb-gray-200"
              >
                <ExternalLink size={14} />
                Google Maps
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.main>
  );
};
