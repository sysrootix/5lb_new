import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Gift, Sparkles, Check, ArrowRight, Loader2, Phone, Info, UserPlus } from 'lucide-react';
import { completeRegistration, registerWithTelegram, type RegistrationData } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useTelegramApp } from '../hooks/useTelegramApp';
import { GlobalBackground } from '../components/GlobalBackground';
import { MobileContainer } from '../components/MobileContainer';
import { GradientModal } from '../components/GradientModal';
import { getReferrerByCode, getReferralClickByTelegramId, type ReferrerInfo } from '../api/referrals';
import toast from 'react-hot-toast';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export const CompleteRegistration: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { isTelegramApp, setTelegramThemeColor, backButton } = useTelegramApp();

  // Проверяем, есть ли сохраненные данные Telegram (для новых пользователей без токена)
  const [telegramInitData] = useState(() => localStorage.getItem('telegram_init_data'));
  const [phone, setPhone] = useState('');
  const isNewUser = !user; // Если нет user - это новый пользователь из Telegram

  const [formData, setFormData] = useState<RegistrationData>(() => {
    // Пытаемся получить сохраненный реферальный код
    const savedRefCode = localStorage.getItem('referral_code') || '';
    return {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      gender: undefined,
      referredByCode: savedRefCode
    };
  });

  const [dateInput, setDateInput] = useState(''); // Промежуточное состояние для ввода даты
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Marketing & Terms State
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showMarketingModal, setShowMarketingModal] = useState(false);

  // Referrer info
  const [referrerInfo, setReferrerInfo] = useState<ReferrerInfo | null>(null);
  const [loadingReferrer, setLoadingReferrer] = useState(false);

  // Проверка: если регистрация уже завершена, перенаправляем на главную
  useEffect(() => {
    if (user?.isRegistrationComplete) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Скролл наверх при монтировании
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Устанавливаем цвет Telegram WebApp
  useEffect(() => {
    if (isTelegramApp) {
      setTelegramThemeColor('#0F0501');
    }
  }, [isTelegramApp, setTelegramThemeColor]);

  // Проверяем, есть ли реферальный код в базе данных по Telegram ID
  useEffect(() => {
    const checkReferralClick = async () => {
      // Получаем Telegram ID из WebApp
      if (window.Telegram?.WebApp?.initDataUnsafe) {
        const telegramUser = (window.Telegram.WebApp.initDataUnsafe as any).user;
        if (telegramUser?.id) {
          const telegramId = telegramUser.id.toString();

          // Проверяем таблицу ReferralClick
          const referralClick = await getReferralClickByTelegramId(telegramId);

          if (referralClick) {
            // Нашли реферальный код в базе данных
            console.log('✅ Найден реферальный код из базы данных:', referralClick.referralCode, '→', referralClick.referrerName);

            // Обновляем formData и referrerInfo
            setFormData(prev => ({
              ...prev,
              referredByCode: referralClick.referralCode
            }));

            setReferrerInfo({
              name: referralClick.referrerName
            });
          }
        }
      }
    };

    checkReferralClick();
  }, []);

  // Загрузка информации о реферере из localStorage (fallback)
  useEffect(() => {
    const loadReferrer = async () => {
      // Загружаем только если еще не загружено из базы данных
      if (formData.referredByCode && formData.referredByCode.trim().length > 0 && !referrerInfo) {
        setLoadingReferrer(true);
        const info = await getReferrerByCode(formData.referredByCode);
        setReferrerInfo(info);
        setLoadingReferrer(false);
      }
    };

    loadReferrer();
  }, [formData.referredByCode]);

  // Форматирование телефона для отображения (как в Login)
  const formatPhoneDisplay = (value: string) => {
    if (!value || value.length === 0) return '';

    const digits = value.replace(/\D/g, '');

    if (digits.length === 0) return '';
    if (digits.length === 1) return '+7 (';
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7)
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9)
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  // Обработка изменения телефона (как в Login)
  const handlePhoneChange = (value: string) => {
    let digits = value.replace(/\D/g, '');

    if (digits.length === 0) {
      setPhone('');
      return;
    }

    if (digits.startsWith('8')) {
      digits = '7' + digits.slice(1);
    } else if (digits.startsWith('9')) {
      digits = '7' + digits;
    } else if (!digits.startsWith('7')) {
      digits = '7' + digits;
    }

    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    setPhone(digits);
  };

  // Обработка изменения даты
  const handleDateChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length > 8) {
      return;
    }
    
    // Форматируем для отображения
    let formatted = '';
    if (digits.length > 0) {
      formatted = digits.slice(0, 2);
      if (digits.length > 2) {
        formatted += '.' + digits.slice(2, 4);
      }
      if (digits.length > 4) {
        formatted += '.' + digits.slice(4, 8);
      }
    }
    
    setDateInput(formatted);
    
    // Сохраняем в formData только если дата полная (8 цифр)
    if (digits.length === 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      setFormData(prev => ({ ...prev, dateOfBirth: `${year}-${month}-${day}` }));
    } else {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
    }
  };

  // Валидация даты рождения
  const validateDateOfBirth = (date: string): boolean => {
    if (!date) return false;
    
    const birthDate = new Date(date);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, 0, 1); // Не старше 120 лет
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()); // Не младше 13 лет

    if (isNaN(birthDate.getTime())) {
      return false;
    }

    if (birthDate < minDate || birthDate > maxDate) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация обязательных полей (имя обязательно, фамилия нет)
    if (!formData.firstName) {
      setError('Пожалуйста, укажите имя');
      toast.error('Имя обязательно для заполнения');
      return;
    }

    if (!formData.dateOfBirth) {
      setError('Пожалуйста, укажите дату рождения');
      toast.error('Дата рождения обязательна');
      return;
    }

    // Валидация даты рождения
    if (!validateDateOfBirth(formData.dateOfBirth)) {
      setError('Пожалуйста, укажите корректную дату рождения');
      toast.error('Дата рождения должна быть в разумных пределах (от 13 до 120 лет)');
      return;
    }

    // Валидация условий использования
    if (!termsAccepted) {
      setError('Необходимо принять условия использования');
      toast.error('Пожалуйста, примите условия использования');
      return;
    }

    // Для новых пользователей без токена - проверяем телефон
    if (isNewUser) {
      if (!phone || phone.length !== 11) {
        setError('Введите корректный номер телефона');
        toast.error('Номер телефона обязателен');
        return;
      }

      if (!telegramInitData) {
        setError('Данные Telegram не найдены. Попробуйте еще раз.');
        toast.error('Данные Telegram не найдены');
        navigate('/login');
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare notification settings if marketing is disabled
      const registrationPayload: RegistrationData = {
        ...formData,
        lastName: formData.lastName, // Фамилия необязательна
        referredByCode: formData.referredByCode || undefined,
        notifications: !marketingConsent ? {
          email: false,
          sms: false,
          telegram: false,
          push: false,
          marketing: false
        } : undefined
      };

      if (isNewUser && telegramInitData) {
        // Регистрация нового пользователя через Telegram
        const response = await registerWithTelegram(telegramInitData, phone, registrationPayload);

        setUser(response.user);
        localStorage.removeItem('telegram_init_data');
        toast.success('Регистрация завершена! 🎉');
        navigate('/');
      } else {
        // Завершение регистрации существующего пользователя
        const data = await completeRegistration(registrationPayload);

        setUser(data.user);
        toast.success('Регистрация завершена! 🎉');
        navigate('/');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Ошибка при регистрации';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Обрабатываем случай, когда телефон уже зарегистрирован
      if (err?.response?.status === 409 && (err?.code === 'PHONE_ALREADY_REGISTERED' || err?.response?.data?.code === 'PHONE_ALREADY_REGISTERED')) {
        // Перенаправляем на страницу входа через 2 секунды
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  return (
    <MobileContainer>
      <GlobalBackground />
      <div className="relative flex min-h-[calc(100vh-80px)] items-start justify-center px-4 pt-[10vh] pb-8">
        <motion.div
          className="w-full max-w-md"
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {/* Основная карточка */}
          <motion.div
            className="overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md p-6 shadow-2xl border border-white/10"
            layout
          >
            {/* Заголовок */}
            <div className="mb-6 text-center">
              <motion.div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center"
                animate={{ 
                  y: [0, -4, 0],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="/logo.svg" alt="5LB" className="h-full w-full drop-shadow-lg" />
              </motion.div>
              <motion.h1 
                className="text-2xl font-black tracking-tight text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Завершение регистрации
              </motion.h1>
              <motion.p 
                className="mt-2 text-sm font-medium text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Расскажите немного о себе
              </motion.p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  className="mb-4 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-red-400" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Номер телефона (только для новых пользователей) */}
              {isNewUser && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-300">
                    <Phone size={14} className="text-orange-500" />
                    Номер телефона <span className="text-red-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={formatPhoneDisplay(phone)}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                      className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 pr-12 text-base font-bold text-white shadow-sm transition-all placeholder:font-normal placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                      required
                    />
                    {phone.length === 11 && (
                      <motion.div
                        className="absolute right-4 top-0 bottom-0 flex items-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-600">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Имя (обязательное) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="firstName" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-300">
                  <User size={14} className="text-orange-500" />
                  Имя <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-base font-bold text-white shadow-sm transition-all placeholder:font-normal placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  placeholder="Иван"
                  required
                />
              </motion.div>

              {/* Фамилия (необязательное) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="lastName" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-300">
                  <User size={14} className="text-gray-500" />
                  Фамилия
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-base font-bold text-white shadow-sm transition-all placeholder:font-normal placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  placeholder="Иванов (необязательно)"
                />
              </motion.div>

              {/* Отчество */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="middleName" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-300">
                  <User size={14} className="text-gray-500" />
                  Отчество
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-base font-bold text-white shadow-sm transition-all placeholder:font-normal placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  placeholder="Иванович (необязательно)"
                />
              </motion.div>

              {/* Дата рождения */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="dateOfBirth" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-300">
                  <Calendar size={14} className="text-orange-500" />
                  Дата рождения <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  id="dateOfBirth"
                  value={dateInput}
                  onChange={(e) => handleDateChange(e.target.value)}
                  placeholder="ДД.ММ.ГГГГ"
                  maxLength={10}
                  className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-base font-bold text-white shadow-sm transition-all placeholder:font-normal placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  required
                />
              </motion.div>

              {/* Пол */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-300">
                  <Sparkles size={14} className="text-gray-500" />
                  Пол
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, gender: 'MALE' }))}
                    className={`relative overflow-hidden rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all ${
                      formData.gender === 'MALE'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {formData.gender === 'MALE' && (
                      <motion.div
                        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                    )}
                    <span className="relative">Мужской</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, gender: 'FEMALE' }))}
                    className={`relative overflow-hidden rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all ${
                      formData.gender === 'FEMALE'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {formData.gender === 'FEMALE' && (
                      <motion.div
                        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                    )}
                    <span className="relative">Женский</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Реферальный код или информация о реферере */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                {referrerInfo ? (
                  // Показываем информацию о реферере
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-300">
                      <UserPlus size={14} className="text-orange-500" />
                      Вас пригласил
                    </label>
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-600/30 to-red-500/20 p-4 border border-orange-500/30 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                          <User size={20} className="text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{referrerInfo.name}</p>
                          <p className="text-xs text-gray-300 mt-0.5">
                            После регистрации вы сможете покрутить рулетку и получить от <span className="font-bold text-orange-400">100 до 10 000 бонусов</span>! 🎰
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : formData.referredByCode ? (
                  // Загрузка информации о реферере
                  loadingReferrer ? (
                    <div>
                      <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-300">
                        <Gift size={14} className="text-gray-500" />
                        Реферальный код
                      </label>
                      <div className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-orange-500" />
                        <span className="text-sm text-gray-400">Проверка кода...</span>
                      </div>
                    </div>
                  ) : (
                    // Код недействителен
                    <div>
                      <label htmlFor="referredByCode" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-300">
                        <Gift size={14} className="text-gray-500" />
                        Реферальный код
                      </label>
                      <input
                        type="text"
                        id="referredByCode"
                        name="referredByCode"
                        value={formData.referredByCode}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-red-500/50 bg-black/30 px-4 py-3 text-base font-bold uppercase text-white shadow-sm transition-all placeholder:font-normal placeholder:normal-case placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                        placeholder="ABC12345 (необязательно)"
                        maxLength={8}
                      />
                      <p className="text-xs text-red-400 mt-1">Код не найден</p>
                    </div>
                  )
                ) : (
                  // Обычное поле ввода
                  <div>
                    <label htmlFor="referredByCode" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-300">
                      <Gift size={14} className="text-gray-500" />
                      Реферальный код
                    </label>
                    <input
                      type="text"
                      id="referredByCode"
                      name="referredByCode"
                      value={formData.referredByCode}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-base font-bold uppercase text-white shadow-sm transition-all placeholder:font-normal placeholder:normal-case placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                      placeholder="ABC12345 (необязательно)"
                      maxLength={8}
                    />
                  </div>
                )}
              </motion.div>

              {/* Checkboxes */}
              <motion.div 
                className="space-y-3 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95 }}
              >
                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <div className="h-5 w-5 rounded-md border-2 border-white/20 bg-black/30 transition-all peer-checked:border-orange-500 peer-checked:bg-orange-500 group-hover:border-white/40" />
                    <Check size={14} className="absolute left-0.5 top-0.5 text-black opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
                  </div>
                  <span className="text-xs text-gray-400 leading-tight select-none pt-0.5">
                    Я согласен с <a href="/terms" className="text-white underline decoration-white/30 underline-offset-2 hover:text-orange-500 hover:decoration-orange-500 transition-colors" onClick={(e) => e.stopPropagation()}>условиями использования</a> и политикой конфиденциальности
                  </span>
                </label>

                {/* Marketing */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={marketingConsent}
                      onChange={(e) => {
                        if (!e.target.checked) {
                           setShowMarketingModal(true);
                        } else {
                           setMarketingConsent(true);
                        }
                      }}
                    />
                    <div className="h-5 w-5 rounded-md border-2 border-white/20 bg-black/30 transition-all peer-checked:border-orange-500 peer-checked:bg-orange-500 group-hover:border-white/40" />
                    <Check size={14} className="absolute left-0.5 top-0.5 text-black opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
                  </div>
                  <span className="text-xs text-gray-400 leading-tight select-none pt-0.5">
                    Я согласен получать персональные предложения, подарки и информацию об акциях
                  </span>
                </label>
              </motion.div>

              {/* Кнопка отправки */}
              <motion.button
                type="submit"
                disabled={loading || !termsAccepted}
                className="group relative mt-8 w-full overflow-hidden rounded-xl bg-white/10 px-6 py-4 backdrop-blur-md border border-white/10 transition-all hover:bg-white/20 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/10 disabled:hover:shadow-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="relative flex items-center justify-center gap-3 text-white">
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span className="font-medium">Сохранение...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="text-orange-500" strokeWidth={2} />
                      <span className="font-bold text-lg">Завершить</span>
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 text-orange-500" strokeWidth={2.5} />
                    </>
                  )}
                </div>
              </motion.button>
            </form>
          </motion.div>

          {/* Modal for Marketing Consent */}
          <GradientModal
            isOpen={showMarketingModal}
            onClose={() => setShowMarketingModal(false)}
            title="Подождите! 🥺"
            icon={Sparkles}
            gradientType="orange"
            centered={true}
            maxWidth="sm"
          >
             <div className="p-6 text-center space-y-4">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-lg font-bold text-white">
                   Не упускайте выгоду!
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                   Мы обещаем не спамить. Честно! Только самые важные акции, закрытые распродажи для своих и подарки на день рождения.
                   <br/><br/>
                   Без этой галочки вы рискуете пропустить раздачу бонусов и эксклюзивные предложения.
                </p>
                
                <div className="flex flex-col gap-3 mt-6">
                   <button 
                     onClick={() => {
                       setMarketingConsent(true);
                       setShowMarketingModal(false);
                     }}
                     className="w-full py-3.5 rounded-xl bg-[#FF6B00] text-black font-bold shadow-lg shadow-orange-900/20 hover:bg-orange-500 active:scale-95 transition-all"
                   >
                     Ладно, уговорили! Оставляем ✅
                   </button>
                   
                   <button 
                     onClick={() => {
                       setMarketingConsent(false);
                       setShowMarketingModal(false);
                     }}
                     className="w-full py-3 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 hover:text-white active:scale-95 transition-all"
                   >
                     Всё равно отключить 😢
                   </button>
                </div>
             </div>
          </GradientModal>
        </motion.div>
      </div>
    </MobileContainer>
  );
};
