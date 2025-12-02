import { motion } from 'framer-motion';
import { useState, MouseEvent, ReactNode } from 'react';

interface RippleButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

/**
 * RippleButton - кнопка с Material Design ripple эффектом
 *
 * Эффекты:
 * - Ripple волна от точки клика
 * - Scale анимация при нажатии
 * - Автоматическое удаление ripple после анимации
 *
 * Использование:
 * <RippleButton onClick={handleClick} className="bg-primary text-white">
 *   Добавить в корзину
 * </RippleButton>
 */
export const RippleButton = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}: RippleButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    // Удаляем ripple через 600ms (длительность анимации)
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/50 rounded-full pointer-events-none"
          initial={{
            width: 0,
            height: 0,
            left: ripple.x,
            top: ripple.y,
            opacity: 1,
          }}
          animate={{
            width: 300,
            height: 300,
            left: ripple.x - 150,
            top: ripple.y - 150,
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </motion.button>
  );
};
