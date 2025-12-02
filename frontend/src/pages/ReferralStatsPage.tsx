import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, Award, TrendingUp, Gift, X } from 'lucide-react';
import { getReferralStats, ReferralStats } from '@/api/referrals';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { useAuthStore } from '@/store/authStore';
import { NewYearDecoration } from '@/components/NewYearDecoration';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

export const ReferralStatsPage = () => {
  const navigate = useNavigate();
  const { isTelegramApp, setTelegramThemeColor } = useTelegramApp();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);

  useEffect(() => {
    if (isTelegramApp) {
      setTelegramThemeColor('#4A2511');
    }
  }, [isTelegramApp, setTelegramThemeColor]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getReferralStats();
        setStats(data);
      } catch (err) {
        setError('Не удалось загрузить статистику');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-5lb-orange-500 to-5lb-red-500 opacity-20 animate-ping"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-5lb-orange-500 border-r-5lb-red-500"></div>
          </div>
          <p className="text-lg font-medium text-white/80">Загрузка статистики...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-5lb-red-500/20 to-5lb-red-600/10 flex items-center justify-center mx-auto mb-6 border border-5lb-red-500/30">
            <Users className="text-5lb-red-500" size={40} />
          </div>
          <p className="text-5lb-red-500 mb-2 text-lg font-bold">{error || 'Ошибка загрузки'}</p>
          <p className="text-white/60 text-sm mb-6">Попробуйте обновить страницу или вернитесь позже</p>
          <button
            onClick={() => navigate('/referral')}
            className="w-full rounded-2xl bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 px-6 py-4 text-base font-bold text-white hover:shadow-lg hover:shadow-5lb-orange-500/30 transition-all active:scale-95"
          >
            Вернуться назад
          </button>
        </motion.div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <motion.main
      className="min-h-screen pb-28 overflow-x-hidden max-w-xl mx-auto w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Modern Header with Glassmorphism */}
      <motion.div variants={itemVariants} className="relative mb-6">
        <div className="relative overflow-hidden rounded-b-3xl">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-5lb-orange-500 via-5lb-red-500 to-5lb-red-600 opacity-90"></div>

          {/* Animated Orbs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-5lb-orange-400/20 rounded-full blur-2xl animate-pulse delay-75"></div>

          {/* New Year Decorations */}
          <NewYearDecoration position="top-left" type="snowflake" />
          <NewYearDecoration position="top-right" type="star" />

          {/* Content */}
          <div className="relative px-4 sm:px-5 pt-8 pb-10">
            {/* Title */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-4 shadow-xl">
                <TrendingUp size={32} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 uppercase tracking-tight">
                Статистика
              </h1>
              <p className="text-white/80 text-sm sm:text-base font-medium">
                Отслеживайте ваших рефералов
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 sm:px-5">
        {/* Summary Cards with Modern Design */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          {/* Total Referrals Card */}
          <motion.div
            variants={cardVariants}
            className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 hover:border-5lb-orange-500/50 transition-all hover:shadow-lg hover:shadow-5lb-orange-500/20"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-5lb-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-5lb-orange-500/20 to-5lb-red-500/10 border border-5lb-orange-500/30 mb-3">
                <Users className="text-5lb-orange-500" size={22} strokeWidth={2.5} />
              </div>
              <div className="text-3xl font-black text-white mb-1 tracking-tight">{stats.totalReferrals}</div>
              <div className="text-xs font-medium text-white/60">Всего друзей</div>
            </div>
          </motion.div>

          {/* Referrals with Purchase Card */}
          <motion.div
            variants={cardVariants}
            className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/20"
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 mb-3">
                <CheckCircle className="text-emerald-500" size={22} strokeWidth={2.5} />
              </div>
              <div className="text-3xl font-black text-white mb-1 tracking-tight">{stats.referralsWithPurchase}</div>
              <div className="text-xs font-medium text-white/60">Совершили покупку</div>
            </div>
          </motion.div>
        </div>

        {/* Progress to Next Bonus - Modern Design */}
        <motion.div
          variants={cardVariants}
          className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 mb-6 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30">
                <Gift className="text-purple-400" size={22} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">До следующего бонуса</h3>
                <p className="text-xs text-white/50">Каждые 10 друзей = 250 бонусов</p>
              </div>
            </div>

            {/* Message */}
            <div className="text-sm font-medium text-white/80 mb-4 leading-relaxed">
              Пригласите еще <span className="text-purple-400 font-bold">{stats.referralsUntilNextBonus}</span> {stats.referralsUntilNextBonus === 1 ? 'друга' : 'друзей'} и получите <span className="text-pink-400 font-bold">250 бонусов</span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, ((stats.totalReferrals % 10) / 10) * 100)}%`
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 h-full rounded-full shadow-lg shadow-purple-500/50"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'gradient-shift 3s ease infinite'
                  }}
                ></motion.div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-medium">{stats.totalReferrals % 10} из 10</span>
                <span className="text-purple-400 font-bold">{Math.round(((stats.totalReferrals % 10) / 10) * 100)}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Referrals List - Modern Design */}
        <div className="mb-8">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Ваши друзья</h2>
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-xs font-bold text-white/70">{stats.referrals.length}</span>
            </div>
          </motion.div>

          {stats.referrals.length === 0 ? (
            <motion.div
              variants={cardVariants}
              className="text-center py-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-5lb-orange-500/20 to-5lb-red-500/10 border border-5lb-orange-500/30 mb-6 mx-auto">
                <Users className="text-5lb-orange-500" size={40} strokeWidth={2} />
              </div>
              <p className="text-white/60 text-base font-medium mb-6">Вы еще не пригласили друзей</p>
              <button
                onClick={() => navigate('/referral')}
                className="rounded-2xl bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 px-8 py-4 text-base font-bold text-white hover:shadow-lg hover:shadow-5lb-orange-500/30 transition-all active:scale-95"
              >
                Пригласить друзей
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {stats.referrals.map((referral, index) => (
                <motion.div
                  key={referral.id}
                  variants={itemVariants}
                  custom={index}
                  onClick={() => setSelectedReferral(referral)}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all hover:shadow-lg cursor-pointer active:scale-98"
                >
                  {/* Status Indicator Glow */}
                  {referral.hasPurchase && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}

                  <div className="relative">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white text-base truncate">{referral.name}</h3>
                          {referral.hasPurchase && (
                            <div className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                              <CheckCircle className="text-emerald-500" size={14} strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-white/50 font-medium">{referral.phone}</div>
                      </div>

                      {/* Status Badge */}
                      {referral.hasPurchase ? (
                        <div className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <span className="text-xs font-bold text-emerald-500">Купил</span>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                          <span className="text-xs font-medium text-white/40">Ожидание</span>
                        </div>
                      )}
                    </div>

                    {/* Info Row */}
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-white/50">
                        <Clock size={12} />
                        <span>{formatDate(referral.registeredAt)}</span>
                      </div>

                      {referral.hasPurchase && referral.bonusAwarded && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                          <Award size={12} className="text-emerald-500" />
                          <span className="text-emerald-500 font-bold">+200 бонусов</span>
                        </div>
                      )}
                    </div>

                    {/* Purchase Date */}
                    {referral.hasPurchase && referral.purchaseDate && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <CheckCircle size={12} />
                          <span>Первая покупка: {formatDate(referral.purchaseDate)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Referral Details Modal */}
      {selectedReferral && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          style={{ background: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setSelectedReferral(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="relative w-full max-w-lg max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/10 shadow-2xl">
              {/* Header with Gradient */}
              <div className="relative overflow-hidden bg-gradient-to-br from-5lb-orange-500 via-5lb-red-500 to-5lb-red-600 p-6 pb-8">
                {/* Animated Orb */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedReferral(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                >
                  <X size={20} />
                </button>

                {/* User Info */}
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-4 shadow-xl">
                    <Users size={40} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1">{selectedReferral.name}</h2>
                  <p className="text-white/80 text-sm font-medium">{selectedReferral.phone}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Status Card */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${selectedReferral.hasPurchase ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-white/10'}`}>
                      {selectedReferral.hasPurchase ? (
                        <CheckCircle className="text-emerald-500" size={20} strokeWidth={2.5} />
                      ) : (
                        <Clock className="text-white/40" size={20} strokeWidth={2.5} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-white mb-0.5">Статус</h3>
                      <p className={`text-sm font-medium ${selectedReferral.hasPurchase ? 'text-emerald-500' : 'text-white/60'}`}>
                        {selectedReferral.hasPurchase ? 'Совершил покупку' : 'Ожидает первой покупки'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Date */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30">
                      <Clock className="text-blue-400" size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-white/60 mb-1">Дата регистрации</h3>
                      <p className="text-base font-bold text-white">{formatDate(selectedReferral.registeredAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Purchase Info */}
                {selectedReferral.hasPurchase && selectedReferral.purchaseDate && (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-2xl p-4 border border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                        <CheckCircle className="text-emerald-500" size={20} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-white/60 mb-1">Первая покупка</h3>
                        <p className="text-base font-bold text-white">{formatDate(selectedReferral.purchaseDate)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bonus Awarded */}
                {selectedReferral.hasPurchase && selectedReferral.bonusAwarded && (
                  <div className="bg-gradient-to-br from-5lb-orange-500/10 to-5lb-red-500/5 rounded-2xl p-5 border border-5lb-orange-500/30">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-5lb-orange-500/30 to-5lb-red-500/20 border border-5lb-orange-500/40 shadow-lg">
                        <Award className="text-5lb-orange-500" size={28} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-white/60 mb-1">Вы получили</h3>
                        <p className="text-2xl font-black bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 bg-clip-text text-transparent">+200 бонусов</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Waiting Message */}
                {!selectedReferral.hasPurchase && (
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 mb-3">
                      <Clock className="text-yellow-400" size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      После первой покупки вашего друга вы получите <span className="text-5lb-orange-500 font-bold">200 бонусов</span>
                    </p>
                  </div>
                )}

                {/* Fun Fact */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-2xl p-5 border border-purple-500/30">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex-shrink-0">
                      <TrendingUp className="text-purple-400" size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-2">Интересный факт</h3>
                      <p className="text-sm text-white/70 leading-relaxed">
                        {selectedReferral.hasPurchase
                          ? `${selectedReferral.name} присоединился к сообществу 5LB и уже делает покупки! Вместе вы делаете наш сервис лучше.`
                          : `${selectedReferral.name} зарегистрировался благодаря вам! Когда он совершит первую покупку, вы оба получите бонусы.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.main>
  );
};
