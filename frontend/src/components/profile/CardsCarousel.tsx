import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Info } from 'lucide-react';
import { getUserCards, BonusCardData } from '@/api/bonusApi';
import { GradientModal } from '@/components/GradientModal';

interface CardProps {
  data: BonusCardData;
  onInfoClick: (data: BonusCardData) => void;
  onQrClick: (data: BonusCardData) => void;
}

const Card = ({ data, onInfoClick, onQrClick }: CardProps) => {
  const isPartner = data.cardCode === 'PARTNER';
  const isFounder = data.cardCode === 'FOUNDER';

  let bgClass = 'bg-gradient-to-br from-[#7C2D12] to-[#431407] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/40 via-transparent to-transparent';
  if (isPartner) bgClass = 'bg-black';
  if (isFounder) bgClass = 'bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#000000] border border-white/10';

  return (
    <div className={`relative w-full flex-shrink-0 overflow-hidden rounded-3xl p-5 shadow-lg min-h-[180px] ${bgClass}`}>
      {/* Background Image for Partner Card */}
      {isPartner && (
        <div className="absolute inset-0 z-0">
          <img
            src="/images/src/card_partner.png"
            alt="Partner Background"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-teal-900/40 mix-blend-multiply" />
        </div>
      )}

      {/* Background for Founder Card */}
      {isFounder && (
        <div className="absolute inset-0 z-0">
          {/* Gold/Premium effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#FFD700]/20 via-transparent to-transparent" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#FFD700]/10 blur-3xl rounded-full" />
        </div>
      )}

      {/* Watermark Logo Background */}
      <div className="absolute -right-8 -bottom-12 opacity-10 pointer-events-none scale-150 z-0 mix-blend-overlay">
        <svg width="100" height="100" viewBox="0 0 116 125" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity="1" d="M76.9807 -3C97.4009 -3 116.986 5.11145 131.426 19.5498C145.866 33.9881 153.979 53.5711 153.982 73.9912L153.989 75.418C153.718 90.1485 149.226 104.504 141.031 116.771C132.573 129.435 120.548 139.306 106.48 145.136C92.4111 150.966 76.9292 152.494 61.9924 149.525C47.0557 146.557 33.3342 139.226 22.5637 128.46C11.7932 117.694 4.45679 103.975 1.48267 89.0391C-1.49144 74.1034 0.030034 58.6208 5.85474 44.5498C11.6795 30.479 21.546 18.451 34.2063 9.9873C46.8665 1.52373 61.7521 -2.99601 76.9807 -3ZM32.9124 70.4951H90.4875C97.7178 70.4951 102.948 71.7761 106.022 74.2979C108.534 76.3862 110.031 79.9026 110.031 86.9062C110.031 93.9096 108.701 98.9625 106.091 101.149C103.481 103.336 98.1215 104.617 90.5071 104.617H62.6995C55.6565 104.617 50.6625 103.573 47.9241 101.593C45.1858 99.6129 43.9837 96.8846 43.9836 92.915V91.0625H32.9124V92.915C32.9124 100.51 35.4439 106.282 40.4084 110.055C45.373 113.827 52.6621 115.659 62.6995 115.659H89.7092C100.456 115.659 108.426 113.64 113.351 109.66C118.276 105.681 121.034 98.9531 121.034 89.96C121.074 89.891 121.074 84.6338 121.064 84.2861C121.034 82.3308 120.85 80.3803 120.512 78.4541C119.527 72.8789 117.113 68.5056 113.4 65.4717C108.376 61.3641 100.653 59.4131 89.6604 59.4131H32.9124V70.4951ZM32.9124 49.5342H118.306V38.4912H32.9124V49.5342Z" fill="white" />
        </svg>
      </div>

      <div className="relative z-10 h-full flex justify-between gap-4">
        {/* Left Side: QR Code */}
        <div
          className="bg-white p-2 rounded-2xl shadow-sm shrink-0 h-fit self-center cursor-pointer active:scale-95 transition-transform"
          onClick={() => onQrClick(data)}
        >
          <QrCode size={90} className="text-black sm:w-[100px] sm:h-[100px]" />
        </div>

        {/* Right Side: Content */}
        <div className="flex flex-col justify-between flex-1 py-1">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-xl sm:text-2xl font-black leading-[1.1] mb-1 ${isFounder ? 'text-[#FFD700]' : 'text-white'}`}>
                Карта<br />«{data.name}»
              </h3>
            </div>
            <button
              onClick={() => onInfoClick(data)}
              className="text-white/80 hover:text-white active:scale-95 transition-transform"
            >
              <Info size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Bonus Pill */}
          <div className={`flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full w-fit mt-auto ${isPartner ? 'bg-[#00C2B3] text-black' :
              isFounder ? 'bg-[#FFD700] text-black' : 'bg-[#FF6B00] text-black'
            } shadow-lg`}>
            <div className="w-7 h-7 rounded-full bg-transparent flex items-center justify-center">
              <img
                src={isPartner ? "/images/icons/bonus_partner.png" : "/images/icons/bonus_base.png"}
                alt="Bonus Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-black font-bold text-sm sm:text-base whitespace-nowrap">{data.balance} бонусов</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CardsCarousel = () => {
  const [cards, setCards] = useState<BonusCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [infoCard, setInfoCard] = useState<BonusCardData | null>(null);
  const [qrCard, setQrCard] = useState<BonusCardData | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await getUserCards();
        // Sort: FOUNDER first, then BASE, then others
        const sorted = data.sort((a, b) => {
          if (a.cardCode === 'FOUNDER') return -1;
          if (b.cardCode === 'FOUNDER') return 1;
          if (a.cardCode === 'BASE') return -1;
          if (b.cardCode === 'BASE') return 1;
          return 0;
        });
        setCards(sorted);
      } catch (error) {
        console.error('Failed to fetch user cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  if (loading) {
    // Simple skeleton loader
    return (
      <div className="w-full overflow-x-auto hide-scrollbar flex gap-3 pb-4 pr-5">
        <div className="min-w-[88%] h-[180px] rounded-3xl bg-white/5 animate-pulse" />
        <div className="min-w-[88%] h-[180px] rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (cards.length === 0) return null;

  return (
    <>
      <div className="w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory flex gap-3 pb-4 pr-5">
        {cards.map((card) => (
          <div key={card.id} className="min-w-[88%] snap-center first:pl-0 last:pr-0">
            <Card
              data={card}
              onInfoClick={setInfoCard}
              onQrClick={setQrCard}
            />
          </div>
        ))}
      </div>

      {/* Info Modal */}
      <GradientModal
        isOpen={!!infoCard}
        onClose={() => setInfoCard(null)}
        title={infoCard?.name || ''}
        subtitle="Информация о карте"
        icon={Info}
        gradientType="profile"
      >
        <div className="relative p-6 space-y-6">
          {/* Watermark */}
          <div className="absolute right-0 top-10 opacity-5 pointer-events-none mix-blend-overlay scale-150">
            <svg width="150" height="150" viewBox="0 0 116 125" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="1" d="M76.9807 -3C97.4009 -3 116.986 5.11145 131.426 19.5498C145.866 33.9881 153.979 53.5711 153.982 73.9912L153.989 75.418C153.718 90.1485 149.226 104.504 141.031 116.771C132.573 129.435 120.548 139.306 106.48 145.136C92.4111 150.966 76.9292 152.494 61.9924 149.525C47.0557 146.557 33.3342 139.226 22.5637 128.46C11.7932 117.694 4.45679 103.975 1.48267 89.0391C-1.49144 74.1034 0.030034 58.6208 5.85474 44.5498C11.6795 30.479 21.546 18.451 34.2063 9.9873C46.8665 1.52373 61.7521 -2.99601 76.9807 -3ZM32.9124 70.4951H90.4875C97.7178 70.4951 102.948 71.7761 106.022 74.2979C108.534 76.3862 110.031 79.9026 110.031 86.9062C110.031 93.9096 108.701 98.9625 106.091 101.149C103.481 103.336 98.1215 104.617 90.5071 104.617H62.6995C55.6565 104.617 50.6625 103.573 47.9241 101.593C45.1858 99.6129 43.9837 96.8846 43.9836 92.915V91.0625H32.9124V92.915C32.9124 100.51 35.4439 106.282 40.4084 110.055C45.373 113.827 52.6621 115.659 62.6995 115.659H89.7092C100.456 115.659 108.426 113.64 113.351 109.66C118.276 105.681 121.034 98.9531 121.034 89.96C121.074 89.891 121.074 84.6338 121.064 84.2861C121.034 82.3308 120.85 80.3803 120.512 78.4541C119.527 72.8789 117.113 68.5056 113.4 65.4717C108.376 61.3641 100.653 59.4131 89.6604 59.4131H32.9124V70.4951ZM32.9124 49.5342H118.306V38.4912H32.9124V49.5342Z" fill="white" />
            </svg>
          </div>

          <div className="space-y-2 relative z-10">
            <h4 className="font-bold text-lg text-white">Описание</h4>
            <p className="text-white/70 leading-relaxed">
              {infoCard?.cardCode === 'BASE'
                ? 'Базовая бонусная карта дает возможность накапливать бонусы за покупки. Списывайте до 30% от стоимости товаров бонусами. Бонусы сгорают через 6 месяцев.'
                : infoCard?.cardCode === 'FOUNDER'
                  ? 'Эксклюзивная карта для тех, кто с нами с самого начала. Баланс 30 000 бонусов. Срок действия: до 31.12.2026. Списание до 30% от суммы чека.'
                  : 'Карта партнера предоставляет доступ к специальным предложениям и повышенному кэшбэку в сети магазинов-партнеров.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm text-white/50 mb-1">Баланс</div>
              <div className="text-2xl font-black text-white">{infoCard?.balance}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm text-white/50 mb-1">Списание</div>
              <div className="text-2xl font-black text-white">
                {infoCard?.settings?.maxRedemptionPercent || 30}%
              </div>
            </div>
          </div>
        </div>
      </GradientModal>

      {/* QR Code Modal */}
      <GradientModal
        isOpen={!!qrCard}
        onClose={() => setQrCard(null)}
        title="Ваш QR-код"
        subtitle="Покажите кассиру для начисления бонусов"
        icon={QrCode}
        gradientType="profile"
        centered={true}
      >
        <div className="p-8 flex flex-col items-center justify-center space-y-6 relative">
          {/* Watermark */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none mix-blend-overlay scale-[2]">
            <svg width="200" height="200" viewBox="0 0 116 125" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="1" d="M76.9807 -3C97.4009 -3 116.986 5.11145 131.426 19.5498C145.866 33.9881 153.979 53.5711 153.982 73.9912L153.989 75.418C153.718 90.1485 149.226 104.504 141.031 116.771C132.573 129.435 120.548 139.306 106.48 145.136C92.4111 150.966 76.9292 152.494 61.9924 149.525C47.0557 146.557 33.3342 139.226 22.5637 128.46C11.7932 117.694 4.45679 103.975 1.48267 89.0391C-1.49144 74.1034 0.030034 58.6208 5.85474 44.5498C11.6795 30.479 21.546 18.451 34.2063 9.9873C46.8665 1.52373 61.7521 -2.99601 76.9807 -3ZM32.9124 70.4951H90.4875C97.7178 70.4951 102.948 71.7761 106.022 74.2979C108.534 76.3862 110.031 79.9026 110.031 86.9062C110.031 93.9096 108.701 98.9625 106.091 101.149C103.481 103.336 98.1215 104.617 90.5071 104.617H62.6995C55.6565 104.617 50.6625 103.573 47.9241 101.593C45.1858 99.6129 43.9837 96.8846 43.9836 92.915V91.0625H32.9124V92.915C32.9124 100.51 35.4439 106.282 40.4084 110.055C45.373 113.827 52.6621 115.659 62.6995 115.659H89.7092C100.456 115.659 108.426 113.64 113.351 109.66C118.276 105.681 121.034 98.9531 121.034 89.96C121.074 89.891 121.074 84.6338 121.064 84.2861C121.034 82.3308 120.85 80.3803 120.512 78.4541C119.527 72.8789 117.113 68.5056 113.4 65.4717C108.376 61.3641 100.653 59.4131 89.6604 59.4131H32.9124V70.4951ZM32.9124 49.5342H118.306V38.4912H32.9124V49.5342Z" fill="white" />
            </svg>
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-xl relative z-10">
            <QrCode size={250} className="text-black" />
          </div>
          <div className="text-center relative z-10">
            <p className="text-white/50 text-sm font-medium uppercase tracking-wide mb-1">Ваш код</p>
            <p className="text-3xl font-mono font-bold text-white tracking-widest">
              {/* This would be dynamic in real app */}
              {qrCard?.cardCode === 'PARTNER' ? 'PARTNER-123' : 'BASIC-777'}
            </p>
          </div>
        </div>
      </GradientModal>
    </>
  );
};
