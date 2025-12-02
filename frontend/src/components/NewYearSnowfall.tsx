import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Snowflake {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const NewYearSnowfall = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Создаем 20 снежинок с разными параметрами
    const flakes: Snowflake[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // позиция по X в процентах
      size: Math.random() * 3 + 2, // размер от 2 до 5px
      duration: Math.random() * 10 + 15, // длительность от 15 до 25s
      delay: Math.random() * 5, // задержка от 0 до 5s
      opacity: Math.random() * 0.4 + 0.3, // прозрачность от 0.3 до 0.7
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            filter: 'blur(0.5px)',
          }}
          initial={{ y: -20, x: 0 }}
          animate={{
            y: ['0vh', '100vh'],
            x: [
              0,
              Math.sin(flake.id) * 30,
              Math.cos(flake.id) * 30,
              0,
            ],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};
