import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchProfile,
  updateProfile,
  requestPhoneChange,
  confirmPhoneChange,
  linkTelegramAccount,
  unlinkTelegramAccount,
  getTelegramConfig,
  deleteAccount as deleteAccountApi,
  logout as logoutApi,
  uploadAvatar as uploadAvatarApi,
  type NotificationSettings,
  type ProfileResponse,
  type UpdateProfilePayload,
  type PhoneChangeRequestResponse,
  type User
} from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { formatPhoneDisplay, sanitizePhoneInput } from '@/utils/phoneFormat';
import type { TelegramAuthResult, TelegramGlobal } from '@/types/telegram';
import {
  ArrowLeft,
  Loader2,
  User2,
  Phone as PhoneIcon,
  ShieldCheck,
  Gift,
  MessageCircle,
  Bell,
  Send,
  Link2,
  Unlink,
  Smartphone,
  Camera,
  Upload,
  Settings as SettingsIcon,
  Mail,
  Lock,
  ChevronRight,
  Trash2,
  LogOut
} from 'lucide-react';
import { getAvatarUrl } from '@/utils/avatarUtils';
import { GradientModal } from '@/components/GradientModal';
import { SkeletonLoader } from '@/components/animations/SkeletonLoader';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 26 }
  }
};

const getTelegramLogin = () =>
  (window as typeof window & { Telegram?: TelegramGlobal }).Telegram?.Login;

const mapProfileToUser = (profile: ProfileResponse, previous?: User | null): User => ({
  id: profile.id,
  phone: profile.phone,
  firstName: profile.firstName,
  lastName: profile.lastName,
  middleName: profile.middleName,
  displayName: profile.displayName,
  avatar: profile.avatar,
  dateOfBirth: profile.profile.dateOfBirth,
  gender: profile.profile.gender,
  telegramId: profile.telegramId ?? previous?.telegramId ?? null,
  telegramUsername: profile.telegramUsername ?? null,
  referralCode: previous?.referralCode ?? null,
  bonusBalance: profile.bonus,
  notifications: profile.notifications,
  isRegistrationComplete: profile.profile.isCompleted
});

const formatStoredPhone = (phone?: string | null) => {
  if (!phone) {
    return 'Не указан';
  }

  if (phone.startsWith('tg:')) {
    return 'Telegram';
  }

  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 11) {
    return phone;
  }

  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
    7,
    9
  )}-${digits.slice(9, 11)}`;
};

export const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, setUser, logout: clearAuth } = useAuthStore();
  const { isTelegramApp, setTelegramThemeColor } = useTelegramApp();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fioForm, setFioForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    dateOfBirth: '',
    gender: null as 'MALE' | 'FEMALE' | 'OTHER' | null
  });
  const [isSavingFio, setIsSavingFio] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    sms: true,
    telegram: true,
    push: true,
    marketing: false
  });
  const [pendingToggle, setPendingToggle] = useState<{
    key: keyof NotificationSettings;
    value: boolean;
  } | null>(null);
  const [isUpdatingNotification, setIsUpdatingNotification] = useState(false);

  const [phoneForm, setPhoneForm] = useState({ newPhone: '', code: '' });
  const [isRequestingPhone, setIsRequestingPhone] = useState(false);
  const [isConfirmingPhone, setIsConfirmingPhone] = useState(false);

  const [telegramConfig, setTelegramConfig] = useState<{ botId: string } | null>(null);
  const [telegramReady, setTelegramReady] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'contacts' | 'security'>('profile');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['profile', 'notifications', 'contacts', 'security'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [location.search]);

  useEffect(() => {
    if (isTelegramApp) {
      setTelegramThemeColor('#1a0f0a');
    }
  }, [isTelegramApp, setTelegramThemeColor]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        syncFromProfile(data);
      } catch (error) {
        console.error(error);
        toast.error('Не удалось загрузить настройки');
      } finally {
        setIsLoading(false);
      }
    };

    const loadTelegramConfig = async () => {
      try {
        const config = await getTelegramConfig();
        setTelegramConfig(config);
      } catch {
        setTelegramConfig(null);
      }
    };

    const scriptId = 'telegram-login-widget';
    const telegramLogin = getTelegramLogin();
    let cleanup: (() => void) | undefined;

    if (telegramLogin?.auth) {
      setTelegramReady(true);
    } else {
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.async = true;
        document.body.appendChild(script);
      }

      const handleLoad = () => setTelegramReady(true);
      const handleError = () => setTelegramReady(false);
      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);

      cleanup = () => {
        script?.removeEventListener('load', handleLoad);
        script?.removeEventListener('error', handleError);
      };
    }

    loadProfile();
    loadTelegramConfig();

    return cleanup;
  }, [isAuthenticated, navigate]);

  const syncFromProfile = (data: ProfileResponse) => {
    setProfile(data);

    // Конвертируем дату из ISO (YYYY-MM-DD) в формат ДД.ММ.ГГГГ
    let formattedDate = '';
    if (data.profile.dateOfBirth) {
      const isoDate = data.profile.dateOfBirth.split('T')[0]; // "2000-01-15"
      const [year, month, day] = isoDate.split('-');
      formattedDate = `${day}.${month}.${year}`; // "15.01.2000"
    }

    setFioForm({
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      middleName: data.middleName ?? '',
      email: data.email ?? '',
      dateOfBirth: formattedDate,
      gender: data.profile.gender
    });
    setNotifications(data.notifications);
    setPhoneForm((prev) => ({ ...prev, code: '' }));
    setUser(mapProfileToUser(data, user));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    // Конвертируем дату из формата ДД.ММ.ГГГГ в ISO формат YYYY-MM-DD
    let isoDate: string | null = null;
    if (fioForm.dateOfBirth) {
      const dateMatch = fioForm.dateOfBirth.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        isoDate = `${year}-${month}-${day}`; // "2000-01-15"
      } else if (fioForm.dateOfBirth.trim()) {
        // Если формат неверный, но поле не пустое, отправляем как есть (бэкенд вернет ошибку)
        isoDate = fioForm.dateOfBirth;
      }
    }

    const payload: UpdateProfilePayload = {
      firstName: fioForm.firstName || null,
      lastName: fioForm.lastName || null,
      middleName: fioForm.middleName || null,
      email: fioForm.email || null,
      dateOfBirth: isoDate,
      gender: fioForm.gender
    };

    setIsSavingFio(true);
    try {
      const updated = await updateProfile(payload);
      syncFromProfile(updated);
      toast.success('Профиль обновлён');
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Не удалось сохранить изменения';
      toast.error(errorMessage);
    } finally {
      setIsSavingFio(false);
    }
  };

  const applyNotificationToggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (!profile) {
      return;
    }

    setIsUpdatingNotification(true);
    try {
      const updated = await updateProfile({ notifications: { [key]: value } });
      syncFromProfile(updated);
      toast.success(
        value
          ? 'Отлично! Мы продолжим делиться важными новостями.'
          : 'Отключили. Если передумаете — включайте.'
      );
    } catch (error) {
      console.error(error);
      setNotifications((prev) => ({ ...prev, [key]: !value }));
      toast.error('Не удалось обновить настройку уведомлений');
    } finally {
      setIsUpdatingNotification(false);
    }
  };

  const handleNotificationToggle = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));

    if (!value) {
      setPendingToggle({ key, value });
      return;
    }

    void applyNotificationToggle(key, value);
  };

  const confirmNotificationToggle = () => {
    if (!pendingToggle) {
      return;
    }
    const { key, value } = pendingToggle;
    setPendingToggle(null);
    void applyNotificationToggle(key, value);
  };

  const cancelNotificationToggle = () => {
    if (!pendingToggle) {
      return;
    }
    setNotifications((prev) => ({ ...prev, [pendingToggle.key]: true }));
    setPendingToggle(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi();
      clearAuth();
      toast.success('Вы вышли из аккаунта');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось выйти из аккаунта');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 5 МБ');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const updatedProfile = await uploadAvatarApi(file);
      setProfile(updatedProfile);
      const currentUser = useAuthStore.getState().user;
      setUser(mapProfileToUser(updatedProfile, currentUser));
      toast.success('Аватар успешно обновлён');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось загрузить аватар');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccountApi();
      clearAuth();
      toast.success('Аккаунт удалён');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось удалить аккаунт');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const handleRequestPhone = async () => {
    if (phoneForm.newPhone.length !== 11) {
      toast.error('Введите корректный номер телефона');
      return;
    }

    setIsRequestingPhone(true);
    try {
      const response: PhoneChangeRequestResponse = await requestPhoneChange(phoneForm.newPhone);
      setProfile((prev) =>
        prev
          ? {
            ...prev,
            pendingPhoneChange: response.pendingPhoneChange,
            phoneChangeExpiresAt: response.phoneChangeExpiresAt
          }
          : prev
      );
      toast.success('Мы отправили код на новый номер');
      setPhoneForm((prev) => ({ ...prev, code: '' }));
    } catch (error) {
      console.error(error);
      toast.error('Не удалось отправить код');
    } finally {
      setIsRequestingPhone(false);
    }
  };

  const handleConfirmPhone = async () => {
    if (phoneForm.code.trim().length < 4) {
      toast.error('Введите код подтверждения');
      return;
    }

    setIsConfirmingPhone(true);
    try {
      const updated = await confirmPhoneChange(phoneForm.code.trim());
      syncFromProfile(updated);
      setPhoneForm({ newPhone: '', code: '' });
      toast.success('Номер успешно обновлён');
    } catch (error) {
      console.error(error);
      toast.error('Неверный код подтверждения');
    } finally {
      setIsConfirmingPhone(false);
    }
  };

  const handleTelegramLink = () => {
    if (!telegramReady) {
      toast.error('Подождите, Telegram ещё загружается');
      return;
    }
    if (!telegramConfig?.botId) {
      toast.error('Telegram авторизация временно недоступна');
      return;
    }

    const telegramAuth = getTelegramLogin();
    if (!telegramAuth?.auth) {
      toast.error('Не удалось инициализировать Telegram виджет');
      return;
    }

    telegramAuth.auth(
      {
        bot_id: telegramConfig.botId,
        request_access: 'write',
        origin: window.location.origin,
        lang: 'ru'
      },
      async (authData: TelegramAuthResult) => {
        if (!authData || !authData.hash) {
          toast.error('Telegram не предоставил данные для привязки');
          return;
        }

        const params = new URLSearchParams();
        (Object.entries(authData) as Array<[string, unknown]>).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });

        setIsTelegramLoading(true);
        try {
          const updated = await linkTelegramAccount(params.toString());
          syncFromProfile(updated);
          toast.success('Telegram успешно привязан');
        } catch (error) {
          console.error(error);
          toast.error('Не удалось привязать Telegram');
        } finally {
          setIsTelegramLoading(false);
        }
      }
    );
  };

  const handleTelegramUnlink = async () => {
    setIsTelegramLoading(true);
    try {
      const updated = await unlinkTelegramAccount();
      syncFromProfile(updated);
      toast.success('Telegram отвязан');
    } catch (error) {
      console.error(error);
      toast.error('Не удалось отвязать Telegram');
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const notificationOptions = useMemo(
    () => [
      {
        key: 'push' as const,
        label: 'Push-уведомления',
        description: 'Молниеносные новости: скидки, акции, курьеры в пути.',
        icon: Smartphone
      },
      {
        key: 'telegram' as const,
        label: 'Telegram-уведомления',
        description: 'Ранний доступ к коллекциям и редким банкам протеина.',
        icon: Send
      },
      {
        key: 'sms' as const,
        label: 'SMS-сообщения',
        description: 'Коды подтверждения и важные сообщения о заказах.',
        icon: MessageCircle
      },
      {
        key: 'email' as const,
        label: 'Email-рассылки',
        description: 'Подборки статей, чек-листы и секретные промокоды.',
        icon: Bell
      },
      {
        key: 'marketing' as const,
        label: 'Персональные предложения',
        description: 'Подарки, бонусы и закрытые распродажи — только для своих.',
        icon: Gift
      }
    ],
    []
  );

  const pendingNotification = pendingToggle
    ? notificationOptions.find((option) => option.key === pendingToggle.key)
    : null;

  if (isLoading) {
    return (
      <main className="min-h-screen pb-28 px-4 sm:px-5 pt-8 overflow-x-hidden max-w-xl mx-auto w-full">
        <div className="mb-8">
          <SkeletonLoader type="text" className="w-32 h-6 mb-2" />
          <SkeletonLoader type="text" className="w-48 h-4" />
        </div>
        <div className="mb-6">
          <div className="flex gap-2">
            <SkeletonLoader type="text" className="w-24 h-10 rounded-xl" />
            <SkeletonLoader type="text" className="w-32 h-10 rounded-xl" />
            <SkeletonLoader type="text" className="w-24 h-10 rounded-xl" />
          </div>
        </div>
        <div className="space-y-5">
          <SkeletonLoader type="card" className="h-64 rounded-3xl" />
          <SkeletonLoader type="card" className="h-48 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>

      <motion.main
        className="min-h-screen pb-28 px-4 sm:px-5 pt-8 overflow-x-hidden max-w-xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.header
          className="flex items-center justify-between mb-8"
          variants={itemVariants}
        >
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white leading-none mb-1">
              Настройки
            </h1>
            <p className="text-sm text-gray-400 truncate">
              {profile?.displayName || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || formatStoredPhone(profile.phone)}
            </p>
          </div>

          {/* Avatar Mini */}
          <div className="relative flex-shrink-0">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10">
              {user?.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar) || ''}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-white/5 flex items-center justify-center text-white text-xs font-bold">
                  {profile?.displayName?.charAt(0)?.toUpperCase() || user?.firstName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          </div>
        </motion.header>

        {/* Tabs */}
        <motion.div
          className="mb-6 overflow-x-auto hide-scrollbar"
          variants={itemVariants}
        >
          <div className="flex gap-2 min-w-max pb-2">
            {[
              { id: 'profile' as const, label: 'Профиль', icon: User2 },
              { id: 'notifications' as const, label: 'Уведомления', icon: Bell },
              { id: 'contacts' as const, label: 'Контакты', icon: PhoneIcon },
              { id: 'security' as const, label: 'Безопасность', icon: Lock }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                      ? 'bg-[#FF6B00] text-black shadow-lg shadow-orange-900/20'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10 backdrop-blur-md'
                    }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="flex flex-col gap-5">
          {/* --- Profile Tab --- */}
          {activeTab === 'profile' && (
            <>
              {/* Personal Data */}
              <section className="bg-white/5 rounded-3xl p-5 sm:p-6 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <User2 size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none">Личные данные</h2>
                    <p className="text-xs text-gray-400 mt-1">Имя и фамилия для заказов</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Имя</label>
                    <input
                      type="text"
                      value={fioForm.firstName}
                      onChange={(e) => setFioForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Фамилия</label>
                    <input
                      type="text"
                      value={fioForm.lastName}
                      onChange={(e) => setFioForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                      placeholder="Ваша фамилия"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Отчество</label>
                    <input
                      type="text"
                      value={fioForm.middleName}
                      onChange={(e) => setFioForm(prev => ({ ...prev, middleName: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                      placeholder="Отчество"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
                    <input
                      type="email"
                      value={fioForm.email}
                      onChange={(e) => setFioForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                      Дата рождения <span className="text-[10px] text-gray-500">(можно менять раз в 3 месяца)</span>
                    </label>
                    <input
                      type="text"
                      value={fioForm.dateOfBirth}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '.' + value.slice(2);
                        }
                        if (value.length >= 5) {
                          value = value.slice(0, 5) + '.' + value.slice(5);
                        }
                        if (value.length > 10) {
                          value = value.slice(0, 10);
                        }
                        setFioForm(prev => ({ ...prev, dateOfBirth: value }));
                      }}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                      placeholder="ДД.ММ.ГГГГ"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Пол</label>
                    <select
                      value={fioForm.gender || ''}
                      onChange={(e) => setFioForm(prev => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' | null || null }))}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="">Не указан</option>
                      <option value="MALE">Мужской</option>
                      <option value="FEMALE">Женский</option>
                      <option value="OTHER">Другой</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingFio}
                    className="w-full mt-2 bg-[#FF6B00] text-black font-bold rounded-xl py-3.5 text-sm shadow-lg shadow-orange-900/20 hover:bg-orange-500 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {isSavingFio ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Сохранить изменения'}
                  </button>
                </div>
              </section>

              {/* Avatar Upload */}
              <section className="bg-white/5 rounded-3xl p-5 sm:p-6 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                    <Camera size={20} className="text-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none">Фото профиля</h2>
                    <p className="text-xs text-gray-400 mt-1">Ваш аватар в приложении</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden bg-black/30 border border-white/10 flex-shrink-0">
                    {profile?.avatar ? (
                      <img src={getAvatarUrl(profile.avatar) || ''} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <User2 size={32} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className={`block w-full text-center bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl py-3 text-sm border border-white/10 transition-all cursor-pointer ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {isUploadingAvatar ? 'Загрузка...' : 'Загрузить фото'}
                    </label>
                    <p className="text-[10px] text-gray-500 mt-2 text-center">
                      JPG, PNG до 5 МБ
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* --- Notifications Tab --- */}
          {activeTab === 'notifications' && (
            <section className="bg-white/5 rounded-3xl p-1 border border-white/10 backdrop-blur-md">
              <div className="flex flex-col">
                {notificationOptions.map((option, index) => {
                  const enabled = notifications[option.key];
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.key}
                      onClick={() => handleNotificationToggle(option.key, !enabled)}
                      disabled={isUpdatingNotification}
                      className={`flex items-center gap-4 p-4 text-left transition-colors ${index !== notificationOptions.length - 1 ? 'border-b border-white/5' : ''
                        }`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-[#FF6B00] text-black' : 'bg-black/30 text-gray-500'
                        }`}>
                        <Icon size={20} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-bold ${enabled ? 'text-white' : 'text-gray-400'}`}>
                            {option.label}
                          </span>
                          <div className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-orange-500/20' : 'bg-white/5'
                            }`}>
                            <div className={`absolute top-1 h-3 w-3 rounded-full transition-all ${enabled ? 'right-1 bg-[#FF6B00]' : 'left-1 bg-gray-500'
                              }`} />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed pr-4">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* --- Contacts Tab --- */}
          {activeTab === 'contacts' && (
            <>
              {/* Phone */}
              <section className="bg-white/5 rounded-3xl p-5 sm:p-6 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <PhoneIcon size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none">Телефон</h2>
                    <p className="text-xs text-gray-400 mt-1">Для входа и заказов</p>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5 flex items-center gap-3">
                  <ShieldCheck size={18} className="text-blue-400" />
                  <div>
                    <p className="text-[10px] text-blue-300 font-bold uppercase">Текущий номер</p>
                    <p className="text-white font-mono text-sm">{formatStoredPhone(profile?.phone)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Новый номер</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={formatPhoneDisplay(phoneForm.newPhone)}
                        onChange={(e) => setPhoneForm(prev => ({ ...prev, newPhone: sanitizePhoneInput(e.target.value) }))}
                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                        placeholder="+7 (999) 000-00-00"
                      />
                      <button
                        onClick={handleRequestPhone}
                        disabled={isRequestingPhone || phoneForm.newPhone.length !== 11}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 disabled:opacity-50 transition-colors"
                      >
                        {isRequestingPhone ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Код подтверждения</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={phoneForm.code}
                        onChange={(e) => setPhoneForm(prev => ({ ...prev, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
                        placeholder="Код из SMS"
                      />
                      <button
                        onClick={handleConfirmPhone}
                        disabled={isConfirmingPhone || phoneForm.code.length < 4}
                        className="bg-[#FF6B00] text-black font-bold rounded-xl px-4 hover:bg-orange-500 disabled:opacity-50 transition-colors"
                      >
                        {isConfirmingPhone ? <Loader2 className="animate-spin" size={20} /> : 'OK'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Telegram */}
              <section className="bg-white/5 rounded-3xl p-5 sm:p-6 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-full bg-[#2AABEE]/10 flex items-center justify-center">
                    <Send size={20} className="text-[#2AABEE]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none">Telegram</h2>
                    <p className="text-xs text-gray-400 mt-1">Привязка аккаунта</p>
                  </div>
                </div>

                {profile?.telegramLinked ? (
                  <div className="bg-[#2AABEE]/10 border border-[#2AABEE]/20 rounded-xl p-4 mb-5 flex items-center gap-3">
                    <Link2 size={18} className="text-[#2AABEE]" />
                    <div className="flex-1">
                      <p className="text-[10px] text-[#2AABEE] font-bold uppercase">Привязан</p>
                      <p className="text-white font-bold text-sm">@{profile.telegramUsername || 'username'}</p>
                    </div>
                    <button
                      onClick={handleTelegramUnlink}
                      disabled={isTelegramLoading}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {isTelegramLoading ? <Loader2 size={18} className="animate-spin text-white" /> : <Unlink size={18} className="text-gray-400 hover:text-white" />}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-500 mb-4">
                      Привяжите Telegram для получения уведомлений и быстрого входа
                    </p>
                    <button
                      onClick={handleTelegramLink}
                      disabled={isTelegramLoading}
                      className="w-full bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold rounded-xl py-3 text-sm shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                    >
                      {isTelegramLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Привязать Telegram'}
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          {/* --- Security Tab --- */}
          {activeTab === 'security' && (
            <section className="bg-white/5 rounded-3xl p-5 sm:p-6 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-gray-300" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-none">Безопасность</h2>
                  <p className="text-xs text-gray-400 mt-1">Управление доступом</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
                >
                  <div className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                    <LogOut size={16} className="text-gray-400 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Выйти из аккаунта</p>
                    <p className="text-[10px] text-gray-500">Завершить сессию на этом устройстве</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all text-left group"
                >
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <Trash2 size={16} className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-500">Удалить аккаунт</p>
                    <p className="text-[10px] text-red-500/60">Безвозвратно удалить все данные</p>
                  </div>
                  <ChevronRight size={16} className="text-red-500/50 group-hover:text-red-500" />
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Logout Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-[#1E1E1E]/90 backdrop-blur-xl w-full max-w-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                <div className="h-12 w-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Выйти из аккаунта?</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Вы сможете вернуться в любой момент, ваши данные останутся сохранены.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 rounded-xl bg-[#FF6B00] text-black font-bold hover:bg-orange-500 transition-colors"
                  >
                    {isLoggingOut ? 'Выход...' : 'Выйти'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-[#1E1E1E]/90 backdrop-blur-xl w-full max-w-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                <div className="h-12 w-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Удалить аккаунт?</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Это действие необратимо. Все ваши бонусы и история заказов будут удалены.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                  >
                    {isDeletingAccount ? 'Удаление...' : 'Удалить'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Notification Confirm Modal */}
        {pendingToggle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={cancelNotificationToggle} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-[#1E1E1E]/90 backdrop-blur-xl w-full max-w-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  Отключить уведомления?
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Вы можете пропустить важные акции и персональные предложения.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={cancelNotificationToggle}
                    className="w-full py-3 rounded-xl bg-[#FF6B00] text-black font-bold hover:bg-orange-500 transition-colors"
                  >
                    Оставить включенными
                  </button>
                  <button
                    onClick={confirmNotificationToggle}
                    className="w-full py-3 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Отключить
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.main>
    </>
  );
};
