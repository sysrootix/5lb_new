import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { News } from '@/api/news';

interface NewsBlockProps {
  news: News;
}

export const NewsBlock = ({ news }: NewsBlockProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (news.link) {
      if (news.link.startsWith('http')) {
        window.open(news.link, '_blank');
      } else {
        navigate(news.link);
      }
    }
  };

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-0 shadow-lg cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      <div className="p-1 bg-gradient-to-b from-orange-900/20 to-transparent rounded-3xl">
        <div className="bg-transparent rounded-[20px] p-4">
          {/* Image Section */}
          <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gray-800 mb-4">
            <img
              src={news.imageUrl}
              alt={news.title}
              className="h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div>
            <h3
              className="text-base sm:text-lg font-bold text-white leading-tight mb-2"
              dangerouslySetInnerHTML={{ __html: news.title }}
            />
            <p
              className="text-xs text-gray-400 leading-relaxed mb-4 font-medium"
              dangerouslySetInnerHTML={{ __html: news.description }}
            />

            {news.link && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="w-full rounded-xl bg-[#FF6B00] py-3 text-sm font-bold text-black shadow-lg shadow-orange-900/20 transition hover:bg-orange-500 active:scale-95 uppercase"
              >
                подробнее
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
