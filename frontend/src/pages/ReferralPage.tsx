import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, AlertCircle, Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { useAuthStore } from '@/store/authStore';

import { SpendingInfoBlock } from '@/components/SpendingInfoBlock';
import { HowToGetCardBlock } from '@/components/HowToGetCardBlock';
import { FounderBenefitsBlock } from '@/components/FounderBenefitsBlock';
import { PromoTimer, usePromoTimer } from '@/components/PromoTimer';

export const ReferralPage = () => {
  const navigate = useNavigate();
  const { isTelegramApp, setTelegramThemeColor } = useTelegramApp();
  const { user } = useAuthStore();
  const timeLeft = usePromoTimer();

  const referralLink = user?.referralCode
    ? `https://t.me/pro_5lb_bot?start=${user.referralCode.toLowerCase()}`
    : '';
  const referralCode = user?.referralCode || '';

  useEffect(() => {
    if (isTelegramApp) {
      setTelegramThemeColor('#1a0f0a');
    }
  }, [isTelegramApp, setTelegramThemeColor]);

  // Countdown timer logic is now handled by usePromoTimer hook

  const copyReferralLink = () => {
    if (!referralLink) {
      toast.error('Реферальная ссылка недоступна');
      return;
    }
    navigator.clipboard.writeText(referralLink);
    toast.success('Ссылка скопирована в буфер обмена! 🎉');
  };

  const copyReferralCode = () => {
    if (!referralCode) {
      toast.error('Промокод недоступен');
      return;
    }
    navigator.clipboard.writeText(referralCode);
    toast.success('Промокод скопирован в буфер обмена! 🎉');
  };

  return (
    <>

      <motion.main
        className="min-h-screen pb-8 overflow-x-hidden max-w-xl mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Hero Section */}
        <div className="relative h-[460px] sm:h-[500px] overflow-hidden rounded-b-[2.5rem]">
          {/* Background Image */}
          <img
            src="/images/src/card_partner.png"
            alt="Пригласи друга"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />

          {/* Hero Content */}
          <div className="absolute inset-0 px-6 sm:px-8 pt-32">
            <div className="text-white max-w-md relative z-10">
              <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-2 sm:mb-4 uppercase">
                ПРИГЛАСИ ДРУГА<br />— ПОЛУЧИ<br />БОНУСЫ
              </h1>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-[85%] sm:max-w-full">
                Хотите получать бонусы просто рассказывая о нас друзьям?
                Запускаем нашу акцию «Приведи Друга», которая действует
                до 31 декабря 2025 года.
              </p>
            </div>

            {/* Bonus Icon */}
            <div className="absolute bottom-6 right-4 w-32 h-32 sm:bottom-8 sm:right-8 sm:w-40 sm:h-40">
              <img
                src="/images/icons/bonus_base.png"
                alt="Bonus"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 sm:px-5 pt-6">
          {/* Referral Info Block - Только для авторизованных */}
          {referralCode && (
            <section className="mb-8">
              <div className="space-y-4">
                {/* Реферальная ссылка */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600/30 to-red-500/20 p-5 sm:p-6 border border-orange-500/30 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-white mb-2">
                        Ваша реферальная ссылка
                      </h3>
                      <p className="text-sm text-gray-300 break-all mb-3">
                        {referralLink}
                      </p>
                      <button
                        onClick={copyReferralLink}
                        className="w-full sm:w-auto rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-orange-400 active:scale-95"
                      >
                        Скопировать ссылку
                      </button>
                    </div>
                  </div>
                </div>

                {/* Промокод */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600/30 to-orange-500/20 p-5 sm:p-6 border border-red-500/30 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-white mb-2">
                        Ваш промокод
                      </h3>
                      <p className="text-2xl sm:text-3xl font-black text-orange-400 tracking-wider mb-3">
                        {referralCode}
                      </p>
                      <button
                        onClick={copyReferralCode}
                        className="w-full sm:w-auto rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-orange-400 active:scale-95"
                      >
                        Скопировать промокод
                      </button>
                    </div>
                  </div>
                </div>

                {/* Кнопка статистики */}
                <button
                  onClick={() => navigate('/referral/stats')}
                  className="w-full rounded-2xl bg-[#FF6B00] py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-orange-900/30 transition hover:bg-orange-500 active:scale-[0.98] uppercase"
                >
                  Посмотреть статистику рефералов
                </button>
              </div>
            </section>
          )}

          {/* How It Works */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              Как это работает и сколько вы получите?
            </h2>

            {/* Step 1 */}
            <div className="mb-6">
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                1. Поделитесь ссылкой. Отправьте вашу уникальную
                реферальную ссылку друзьям, у которых ещё нет
                аккаунта в нашем магазине.
              </p>

              <button
                onClick={copyReferralLink}
                className="w-full rounded-2xl bg-[#FF6B00] py-3 sm:py-4 text-sm sm:text-base font-bold text-black shadow-lg shadow-orange-900/30 transition hover:bg-orange-500 active:scale-[0.98] uppercase"
              >
                скопировать ссылку
              </button>
            </div>

            {/* Step 2 */}
            <div className="mb-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                2. За регистрацию друга — 50 бонусов. Как только ваш друг
                зарегистрируется по вашей ссылке, вы сразу получите
                50 бонусов на свой счёт.
              </p>
            </div>

            {/* Step 3 */}
            <div className="mb-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                3. За покупку друга до 31 декабря 2025 года — ещё 200
                бонусов. Если ваш друг совершит свою первую покупку
                до конца года, вы получите дополнительно 200 бонусов.
                Сумма его покупки может быть любой.
              </p>
            </div>
          </section>

          {/* Summary Card */}
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600/30 to-cyan-400/20 p-5 sm:p-6 border border-orange-500/30 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Users size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <p className="text-white text-xs sm:text-sm leading-relaxed">
                  В сумме вы получаете <span className="font-bold text-orange-400">250 бонусов</span> за каждого
                  друга, который зарегистрировался и совершил
                  покупку до 31 декабря 2025 года.
                </p>
              </div>
            </div>
          </section>

          {/* Premium Bonus */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Специальный Премиальный Бонус
            </h2>

            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Мы ценим ваши усилия! За каждые 10 приглашённых
              и зарегистрированных друзей (даже если они ещё не успели
              сделать покупку), вы получите дополнительные 250 бонусов
              в качестве премии.
            </p>
          </section>

          {/* Important Terms */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Важные условия
            </h2>

            <div className="space-y-4">
              {[
                'Акция действует до 31 декабря 2025 года. Успейте пригласить как можно больше друзей.',
                'Приглашённый друг должен быть новым клиентом нашего магазина.',
                'Бонусы начисляются только за первую покупку друга, совершённую в указанный срок.'
              ].map((term, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5 sm:w-[20px] sm:h-[20px]" />
                  <p className="text-gray-300 text-sm leading-relaxed">{term}</p>
                </div>
              ))}
            </div>

            <p className="text-white font-semibold text-sm sm:text-base mt-6">
              Начните приглашать друзей прямо сейчас и
              готовьтесь к выгодным покупкам.
            </p>
          </section>

          {/* Copy Link Button */}
          <section className="mb-8">
            <button
              onClick={copyReferralLink}
              className="w-full rounded-2xl bg-[#FF6B00] py-3 sm:py-4 text-sm sm:text-base font-bold text-black shadow-lg shadow-orange-900/30 transition hover:bg-orange-500 active:scale-[0.98] uppercase"
            >
              скопировать ссылку
            </button>
          </section>

          {/* Opening Invitation */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Приглашаем на открытие
            </h2>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              12 декабря в Хабаровске открывается 3 магазина «5lb»
              по следующим адресам:
            </p>

            <div className="space-y-3 mb-6">
              {[
                'ТЦ Пихта (1 этаж);',
                'ТЦ Макси Молл (1 этаж);',
                'Гастромаркет «Березка» (ул. Тургенева, 46).'
              ].map((address, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <MapPin size={18} className="text-orange-500 flex-shrink-0 mt-0.5 sm:w-[20px] sm:h-[20px]" />
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{address}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Map Section */}
          <section className="mb-8">
            <div className="relative h-48 sm:h-52 rounded-3xl overflow-hidden bg-gray-800">
              {/* Map Image */}
              <img
                src="/images/src/map.png"
                alt="Map"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-bold text-gray-900 shadow-lg flex items-center gap-1">
                    <MapPin size={12} className="sm:w-[14px] sm:h-[14px]" fill="#FF6B00" stroke="#FF6B00" />
                    ТЦ Пихта
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform translate-x-4">
                  <div className="bg-white rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-bold text-gray-900 shadow-lg flex items-center gap-1">
                    <MapPin size={12} className="sm:w-[14px] sm:h-[14px]" fill="#FF6B00" stroke="#FF6B00" />
                    ТЦ МаксиМолл
                  </div>
                </div>
                <div className="absolute bottom-1/4 left-1/3">
                  <div className="bg-white rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-bold text-gray-900 shadow-lg flex items-center gap-1">
                    <MapPin size={12} className="sm:w-[14px] sm:h-[14px]" fill="#FF6B00" stroke="#FF6B00" />
                    Березка
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 mt-4 leading-relaxed">
              В честь открытия дарим карту основателя, которая
              предоставляет <span className="text-orange-500 font-bold">30 000 бонусов</span> на весь 2026 год.
            </p>
          </section>

          {/* How to Get Card */}
          <section className="mb-8">
            <HowToGetCardBlock />
          </section>

          {/* What Does Card Give */}
          <section className="mb-8">
            <FounderBenefitsBlock />
          </section>

          {/* Spending Info */}
          <section className="mb-8">
            <SpendingInfoBlock />
          </section>

          {/* Bottom Timer */}
          <section className="mb-4">
            <PromoTimer className="text-5xl sm:text-7xl font-black text-[#FF6600] font-mono tracking-tighter text-center" />
          </section>
        </div>
      </motion.main>
    </>
  );
};
