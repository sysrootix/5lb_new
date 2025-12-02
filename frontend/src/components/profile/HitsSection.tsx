import { motion } from 'framer-motion';

// Hit products - top 3 bestsellers
const HIT_PRODUCTS = [
  {
    id: 'hit-1',
    name: 'NOW Ultra Omega-3',
    subtitle: '90 капсул',
    image: '/images/hits/now.png',
    price: 1953,
    oldPrice: 2790,
    discount: 30,
  },
  {
    id: 'hit-2',
    name: 'Life Extension Two-Per-Day',
    subtitle: '120 таблеток',
    image: '/images/hits/life.png',
    price: 2583,
    oldPrice: 3690,
    discount: 30,
  },
  {
    id: 'hit-3',
    name: 'ON Whey Gold Standard',
    subtitle: '908 гр',
    image: '/images/hits/on.png',
    price: 4053,
    oldPrice: 5790,
    discount: 30,
  },
  {
    id: 'hit-4',
    name: 'NOW Adam',
    subtitle: '90 капсул',
    image: '/images/hits/2c34293437dfe6485bea925c7a22b6939a978c41.png',
    price: 2513,
    oldPrice: 3590,
    discount: 30,
  },
  {
    id: 'hit-5',
    name: 'NOW Magnesium citrate',
    subtitle: '100 таблеток',
    image: '/images/hits/3ade456f3ffa3564d9652925ba32c04280853d81.png',
    price: 1533,
    oldPrice: 2190,
    discount: 30,
  },
  {
    id: 'hit-6',
    name: 'NOW Vitamin D-3 10.000 МЕ',
    subtitle: '120 капсул',
    image: '/images/hits/905dab327f43f3eb63e8cbc6a7f1ce21fd6e1df8.png',
    price: 1183,
    oldPrice: 1690,
    discount: 30,
  },
  {
    id: 'hit-7',
    name: 'BSN Syntha-6',
    subtitle: '1300 гр',
    image: '/images/hits/f7713bfab564cc3a773d516c68408c8b5be579c2.png',
    price: 4613,
    oldPrice: 6590,
    discount: 30,
  },
  {
    id: 'hit-8',
    name: 'Ultimate Nutrition Iso Sensation',
    subtitle: '910 гр',
    image: '/images/hits/6b8a81578781adfe62f09546d07f1b3108c5ed42.png',
    price: 3283,
    oldPrice: 4690,
    discount: 30,
  },
  {
    id: 'hit-9',
    name: 'ON Opti Men',
    subtitle: '150 таблеток',
    image: '/images/hits/3c9f8cb21d9e26bbbf88d4f97cfbf5c2297cb24e.png',
    price: 3143,
    oldPrice: 4490,
    discount: 30,
  },
  {
    id: 'hit-10',
    name: 'ON Opti Woman',
    subtitle: '120 таблеток',
    image: '/images/hits/6ec19a2329795d83c70691e503fdc11dfad380f4.png',
    price: 2233,
    oldPrice: 3190,
    discount: 30,
  },
  {
    id: 'hit-11',
    name: 'Maxler Ultra Whey',
    subtitle: '908 гр',
    image: '/images/hits/9c0bd11ec5a1ae227d2e332855833dc94a10471f.png',
    price: 2513,
    oldPrice: 3590,
    discount: 30,
  },
  {
    id: 'hit-12',
    name: 'Maxler Golden Creatine',
    subtitle: '150 гр',
    image: '/images/hits/8a4da3875ad8ed6c5f4b6511a7ece3ef6dbb0f94.png',
    price: 763,
    oldPrice: 1090,
    discount: 30,
  },
  {
    id: 'hit-13',
    name: 'Mutant Mass',
    subtitle: '6800 гр',
    image: '/images/hits/fa22c514b61d233ce9d4c75c0b506941c35ff71e.png',
    price: 6433,
    oldPrice: 9190,
    discount: 30,
  },
  {
    id: 'hit-14',
    name: 'NOW EVE',
    subtitle: '90 капсул',
    image: '/images/hits/0a3b6497426456217fbac675dce3010f905de07d.png',
    price: 2093,
    oldPrice: 2990,
    discount: 30,
  },
  {
    id: 'hit-15',
    name: 'Trec Nutrition',
    subtitle: 'Collagen Renover',
    image: '/images/hits/15415ace778da0fdfd806d1cfc4d1de55e0ccc7a.png',
    price: 2093,
    oldPrice: 2990,
    discount: 30,
  },
  {
    id: 'hit-16',
    name: 'Trec Nutrition 100% Creatine',
    subtitle: '300 гр',
    image: '/images/hits/25f10812162a812db6e39d11e7c08de2be4fe52e.png',
    price: 1883,
    oldPrice: 2690,
    discount: 30,
  },
  {
    id: 'hit-17',
    name: 'Siberian Nutrogunz Mad Mass Gainer',
    subtitle: '2 кг',
    image: '/images/hits/7da2440c028caccab21e4b426672594f59941909.png',
    price: 1323,
    oldPrice: 1890,
    discount: 30,
  },
  {
    id: 'hit-18',
    name: 'DopDrops Паста арахисовая',
    subtitle: '1000г',
    image: '/images/hits/65c7d89567fd9e49527c476005fc997b65146f0c.png',
    price: 483,
    oldPrice: 690,
    discount: 30,
  },
  {
    id: 'hit-19',
    name: 'Universal Animal Pak',
    subtitle: '44 пакетика',
    image: '/images/hits/34247a166381ebe1ac7c82fe67c65a8aff8e1f72.png',
    price: 3843,
    oldPrice: 5490,
    discount: 30,
  },
];

const formatPrice = (price: number) => {
  return `${price.toLocaleString('ru-RU')} ₽`;
};

export const HitsSection = () => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-white mb-4">Хиты ассортимента</h2>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mx-5 px-5">
        {HIT_PRODUCTS.map((product) => (
          <motion.div
            key={product.id}
            className="min-w-[140px] w-[140px] flex-shrink-0 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-2 relative overflow-hidden group"
          >
            {/* Discount Badge */}
            <div className="absolute top-2 right-2 z-10 bg-[#FF6B00] text-white text-[10px] font-bold px-1.5 py-1 rounded-lg shadow-md">
              -{product.discount}%
            </div>

            {/* Image Area */}
            <div className="h-32 w-full bg-gradient-to-b from-white/5 to-white/[0.02] rounded-xl mb-3 flex items-center justify-center p-2 relative overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Title */}
            <h3 className="text-[11px] font-semibold text-white leading-tight line-clamp-2 mb-0.5 min-h-[2.2em] opacity-90">
              {product.name}
            </h3>

            {/* Subtitle */}
            <p className="text-[10px] text-gray-400 mb-2">
              {product.subtitle}
            </p>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-[#FF6B00] font-bold text-sm">
                {formatPrice(product.price)}
              </span>
              <span className="text-gray-600 text-[10px] line-through decoration-gray-600">
                {formatPrice(product.oldPrice)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
