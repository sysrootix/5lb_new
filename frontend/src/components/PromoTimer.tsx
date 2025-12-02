import { FC, useEffect, useState } from 'react';

export const usePromoTimer = () => {
  const calculateTimeLeft = () => {
    const targetDate = new Date('2025-12-12T00:00:00+10:00');
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return timeLeft;
};

interface PromoTimerProps {
  className?: string;
  showDays?: boolean;
}

export const PromoTimer: FC<PromoTimerProps> = ({ className, showDays = true }) => {
  const timeLeft = usePromoTimer();

  if (timeLeft.isExpired) {
    return (
      <div className={`font-black tracking-tighter uppercase ${className || 'text-5xl sm:text-7xl text-[#FF6600] text-center'}`}>
        Мы открылись!
      </div>
    );
  }

  return (
    <div className={`font-black font-mono tracking-tighter ${className || 'text-5xl sm:text-7xl text-[#FF6600] text-center'}`}>
      {timeLeft.days}д {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </div>
  );
};
