import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedProductCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

const cardVariants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.03,
    y: -8,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
  },
};

/**
 * AnimatedProductCard - анимированная карточка товара
 *
 * Эффекты:
 * - Плавное появление при загрузке
 * - Приподнимание при hover
 * - Сжатие при нажатии
 * - Spring анимация для natural движения
 *
 * Использование:
 * <AnimatedProductCard onClick={handleClick} delay={0.1}>
 *   <div>Product content</div>
 * </AnimatedProductCard>
 */
export const AnimatedProductCard = ({
  children,
  className = '',
  onClick,
  delay = 0,
}: AnimatedProductCardProps) => {
  return (
    <motion.div
      variants={cardVariants}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
};
