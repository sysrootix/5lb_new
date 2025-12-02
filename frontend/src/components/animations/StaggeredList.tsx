import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Задержка между элементами
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * StaggeredList - список с поочередным появлением элементов
 *
 * Эффекты:
 * - Элементы появляются один за другим
 * - Настраиваемая задержка между элементами
 * - Плавная fade + slide анимация
 *
 * Использование:
 * <StaggeredList staggerDelay={0.05}>
 *   {products.map(product => (
 *     <ProductCard key={product.id} product={product} />
 *   ))}
 * </StaggeredList>
 */
export const StaggeredList = ({
  children,
  className = '',
  staggerDelay = 0.05,
}: StaggeredListProps) => {
  return (
    <motion.div
      variants={{
        ...containerVariants,
        visible: {
          ...containerVariants.visible,
          transition: {
            ...containerVariants.visible.transition,
            staggerChildren: staggerDelay,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
