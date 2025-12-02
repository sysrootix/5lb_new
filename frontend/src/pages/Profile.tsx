import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, ChevronRight, Phone, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { ProfileCompletionBlock } from '@/components/profile/ProfileCompletionBlock';
import { LoyaltyCardBlock } from '@/components/profile/LoyaltyCardBlock';
import { MenuBlock } from '@/components/profile/MenuBlock';
import { FounderBanner } from '@/components/profile/FounderBanner';
import { AuthBlock } from '@/components/home/AuthBlock';
import { StartBonusesBlock } from '@/components/profile/StartBonusesBlock';
import { AddToWalletButton } from '@/components/wallet/AddToWalletButton';
import { getUserCards, BonusCardData } from '@/api/bonusApi';
import { checkRouletteEligibility } from '@/api/roulette';
import { getStoryById, Story } from '@/api/stories';
import { StoryViewer } from '@/components/StoryViewer';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isTelegramApp, setTelegramThemeColor } = useTelegramApp();
  const [cards, setCards] = useState<BonusCardData[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [vacancyStory, setVacancyStory] = useState<Story | null>(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isRouletteEligible, setIsRouletteEligible] = useState(false);

  useEffect(() => {
    if (isTelegramApp) {
      setTelegramThemeColor('#4A2511');
    }
  }, [isTelegramApp, setTelegramThemeColor]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardsData, rouletteData] = await Promise.all([
          getUserCards(),
          checkRouletteEligibility()
        ]);
        setCards(cardsData);
        setIsRouletteEligible(rouletteData.isEligible);
      } catch (error) {
        console.error('Failed to fetch profile data', error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const displayName = useMemo(
    () => user?.displayName || user?.firstName || 'Пользователь',
    [user]
  );

  const handleVacanciesClick = async () => {
    const story = await getStoryById('vacansies');
    if (story) {
      setVacancyStory(story);
      setIsStoryViewerOpen(true);
    }
  };

  const handleInfoClick = () => {
    setShowInfoModal(true);
  };

  return (
    <motion.main
      className="min-h-screen pb-28 px-4 sm:px-5 overflow-x-hidden max-w-xl mx-auto w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.header
        className="flex items-center justify-between mb-8 pt-4"
        variants={itemVariants}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 border-white/10 shadow-2xl">
              {user?.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar) || ''}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={user ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" : "/favicon.ico"}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Name & Settings */}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-none mb-1.5 truncate">
              {displayName}
            </h1>
            <button
              onClick={() => navigate(user ? '/settings' : '/login')}
              className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              {user ? 'Заполните профиль' : 'Войти'} <ChevronRight size={14} className="ml-0.5" />
            </button>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="flex-shrink-0">
          <button
            onClick={() => navigate('/notifications')}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E1E1E] text-white hover:bg-zinc-700 transition-colors relative border border-white/5"
          >
            <Bell size={22} />
            {/* Orange dot removed - will be shown when there are actual notifications */}
          </button>
        </div>
      </motion.header>



      {/* Profile Completion Block */}
      {user && (
        <motion.div variants={itemVariants}>
          <ProfileCompletionBlock user={user} />
        </motion.div>
      )}

      {/* Start Bonuses Block */}
      {user && isRouletteEligible && (
        <motion.div variants={itemVariants}>
          <StartBonusesBlock />
        </motion.div>
      )}

      {/* Loyalty Cards */}
      {user && cards.length > 0 && (
        <>
          <motion.div
            variants={itemVariants}
            className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 sm:px-5 scrollbar-hide snap-x snap-mandatory"
          >
            {cards.map(card => (
              <div key={card.id} className="min-w-[85vw] sm:min-w-[320px] snap-center">
                <LoyaltyCardBlock
                  card={card}
                  onInfoClick={(c: BonusCardData) => {
                    let path = `/profile/card-rules/${c.id}`;
                    if (c.cardCode === 'PARTNER') {
                      path = `/profile/partner-card-rules/${c.id}`;
                    } else if (c.cardCode === 'FOUNDER') {
                      path = `/profile/founder-card-rules/${c.id}`;
                    }
                    navigate(path, { state: { card: c } });
                  }}
                />
              </div>
            ))}
          </motion.div>

          {/* Add to Wallet Button */}
          <motion.div variants={itemVariants} className="mb-6">
            <AddToWalletButton card={cards[0]} />
          </motion.div>
        </>
      )}

      {/* Auth Block (if not authenticated) */}
      {!user && (
        <motion.div variants={itemVariants} className="mb-6">
          <AuthBlock />
        </motion.div>
      )}

      {/* Founder Banner */}
      <motion.div variants={itemVariants}>
        <FounderBanner />
      </motion.div>

      {/* Menu Block */}
      <motion.div variants={itemVariants} className="mb-8">
        <MenuBlock
          onVacanciesClick={handleVacanciesClick}
          onInfoClick={handleInfoClick}
        />
      </motion.div>

      {/* Info Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setShowInfoModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 shadow-2xl">
              <button
                onClick={() => setShowInfoModal(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-5lb-orange-500 to-5lb-red-500 mx-auto mb-6 shadow-lg shadow-5lb-orange-500/30">
                  <Phone size={36} className="text-white" strokeWidth={2} />
                </div>

                <h3 className="text-2xl font-black text-white mb-3 uppercase">
                  Единая справочная служба
                </h3>

                <a
                  href="tel:+79241512555"
                  className="inline-block text-3xl font-black bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500 bg-clip-text text-transparent hover:from-5lb-orange-400 hover:to-5lb-red-400 transition-all mb-6"
                >
                  +7 924 151 2555
                </a>

                <p className="text-sm text-white/60 leading-relaxed">
                  Звоните с 09:00 до 21:00<br />
                  по хабаровскому времени
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Story Viewer for Vacancies */}
      {vacancyStory && (
        <StoryViewer
          stories={[vacancyStory]}
          currentStoryIndex={0}
          isOpen={isStoryViewerOpen}
          onClose={() => setIsStoryViewerOpen(false)}
        />
      )}
    </motion.main >
  );
};
