import { motion } from 'framer-motion';

interface NewYearDecorationProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  type?: 'snowflake' | 'star' | 'ornament';
}

export const NewYearDecoration = ({
  position = 'top-right',
  type = 'snowflake'
}: NewYearDecorationProps) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const getDecoration = () => {
    switch (type) {
      case 'snowflake':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-200/40">
            <path
              d="M12 2L12 22M2 12L22 12M5.64 5.64L18.36 18.36M5.64 18.36L18.36 5.64"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="2" r="1.5" fill="currentColor" />
            <circle cx="12" cy="22" r="1.5" fill="currentColor" />
            <circle cx="2" cy="12" r="1.5" fill="currentColor" />
            <circle cx="22" cy="12" r="1.5" fill="currentColor" />
            <circle cx="5.64" cy="5.64" r="1.5" fill="currentColor" />
            <circle cx="18.36" cy="18.36" r="1.5" fill="currentColor" />
            <circle cx="5.64" cy="18.36" r="1.5" fill="currentColor" />
            <circle cx="18.36" cy="5.64" r="1.5" fill="currentColor" />
          </svg>
        );
      case 'star':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-yellow-200/40">
            <path
              d="M12 2L14.09 8.26L20 9.27L15.82 13.14L16.91 19.02L12 15.77L7.09 19.02L8.18 13.14L4 9.27L9.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
        );
      case 'ornament':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-5lb-red-400/40">
            <circle cx="12" cy="14" r="8" fill="currentColor" />
            <rect x="10" y="4" width="4" height="4" rx="1" fill="currentColor" />
            <path d="M12 6L12 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} pointer-events-none z-10`}
      initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {getDecoration()}
    </motion.div>
  );
};
