import { loginWithTelegram } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const TelegramLoginButton = () => {
  const { initData } = useTelegramApp();
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleTelegramLogin = async () => {
    if (!initData) {
      toast.error('Telegram WebApp недоступен');
      return;
    }

    try {
      const response = await loginWithTelegram(initData);
      setUser(response.user);
      toast.success('Вход через Telegram выполнен');

      if (response.needsRegistration) {
        navigate('/complete-registration');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ошибка авторизации через Telegram');
    }
  };

  return (
    <button
      onClick={handleTelegramLogin}
      className="mt-4 w-full rounded-xl border border-5lb-red px-4 py-3 font-semibold text-5lb-red transition hover:bg-5lb-red hover:text-white"
    >
      Войти через Telegram
    </button>
  );
};
