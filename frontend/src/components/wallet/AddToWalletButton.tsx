import React, { useState } from 'react';
import { Wallet, Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BonusCardData } from '@/api/bonusApi';
import { addToAppleWallet, addToGoogleWallet } from '@/api/walletApi';

interface AddToWalletButtonProps {
  card: BonusCardData;
  className?: string;
}

// Определение типа устройства
const detectDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'ios';
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return 'android';
  }

  return 'web';
};

export const AddToWalletButton: React.FC<AddToWalletButtonProps> = ({ card, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const device = detectDevice();

  const handleAddToWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (device === 'ios') {
        // Apple Wallet
        const pkpassUrl = await addToAppleWallet(card.id);
        window.location.href = pkpassUrl; // Открывает .pkpass файл
      } else if (device === 'android') {
        // Google Wallet
        const walletUrl = await addToGoogleWallet(card.id);
        window.open(walletUrl, '_blank');
      } else {
        // Desktop - показываем QR код для скачивания
        const pkpassUrl = await addToAppleWallet(card.id);
        const link = document.createElement('a');
        link.href = pkpassUrl;
        link.download = `${card.name}.pkpass`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      console.error('Failed to add to wallet:', err);

      // Проверяем, является ли это ошибкой 501 (Not Implemented)
      if (err?.response?.status === 501) {
        setError('⚙️ Функция в разработке. Скоро будет доступна!');
      } else {
        setError('Не удалось добавить карту в кошелек');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Текст и иконка в зависимости от устройства
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 size={20} className="animate-spin" />
          <span>Загрузка...</span>
        </>
      );
    }

    switch (device) {
      case 'ios':
        return (
          <>
            <Wallet size={20} />
            <span>Добавить в Apple Wallet</span>
          </>
        );
      case 'android':
        return (
          <>
            <Wallet size={20} />
            <span>Добавить в Google Wallet</span>
          </>
        );
      default:
        return (
          <>
            <Download size={20} />
            <span>Скачать карту</span>
          </>
        );
    }
  };

  return (
    <div className={className}>
      <motion.button
        onClick={handleAddToWallet}
        disabled={isLoading}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full flex items-center justify-center gap-2 px-6 py-4
          bg-gradient-to-r from-5lb-orange-500 to-5lb-red-500
          hover:from-5lb-orange-600 hover:to-5lb-red-600
          text-white font-bold rounded-2xl
          shadow-lg shadow-5lb-orange-500/30
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          active:shadow-md
        `}
      >
        {getButtonContent()}
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400 text-center"
        >
          {error}
        </motion.p>
      )}

      {device === 'web' && (
        <p className="mt-2 text-xs text-gray-400 text-center">
          Файл можно открыть на iOS или Android устройстве
        </p>
      )}
    </div>
  );
};
