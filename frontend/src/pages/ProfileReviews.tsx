import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MessageCircle, Package, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { GradientModal } from '@/components/GradientModal';

interface Review {
  id: string;
  product: string;
  productId?: string;
  rating: number;
  date: string;
  text: string;
  productImage?: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'REV-301',
    product: 'Протеин 5LB Ultra Whey 908 г',
    productId: 'prod-1',
    rating: 5,
    date: '12 октября 2025',
    text: 'Понравился мягкий шоколадный вкус. Растворяется полностью, без комочков. Беру уже второй раз.',
    productImage: 'https://images.unsplash.com/photo-1585238341986-37b1f2b88f04?auto=format&w=300&q=80'
  },
  {
    id: 'REV-298',
    product: 'BCAA 2:1:1 в порошке 300 г',
    productId: 'prod-2',
    rating: 4,
    date: '2 октября 2025',
    text: 'Хорошая поддержка восстановления после тренировок. Хотелось бы побольше вкусов.',
    productImage: 'https://images.unsplash.com/photo-1558640472-9d2a7deb7f62?auto=format&w=300&q=80'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 }
  }
};

export const ProfileReviewsPage = () => {
  const navigate = useNavigate();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useLockBodyScroll(!!selectedReview || showDeleteConfirm);

  const handleEditReview = () => {
    if (!selectedReview) return;
    setIsEditing(true);
    setEditText(selectedReview.text);
    setEditRating(selectedReview.rating);
  };

  const handleSaveReview = () => {
    if (!selectedReview) return;
    toast.success('Отзыв обновлён');
    setIsEditing(false);
    setSelectedReview(null);
  };

  const handleDeleteReview = () => {
    if (!selectedReview) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteReview = () => {
    if (!selectedReview) return;
    toast.success('Отзыв удалён');
    setSelectedReview(null);
    setShowDeleteConfirm(false);
  };

  return (
    <motion.main
      className="min-h-screen bg-5lb-gray-50 pb-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Улучшенный Header с градиентом */}
      <motion.header 
        className="sticky top-0 z-20 relative overflow-hidden bg-gradient-to-br from-white via-white to-5lb-orange-50/40 px-4 pb-5 pt-4 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90 sm:pb-6"
        variants={itemVariants}
      >
        {/* Декоративные элементы */}
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-5lb-orange-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-5lb-red-100/30 blur-3xl" />
        
        <div className="relative mx-auto flex max-w-2xl items-center gap-3 sm:gap-4">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-5lb-gray-200 transition-all hover:shadow-xl sm:h-11 sm:w-11"
            whileHover={{ scale: 1.05, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} className="text-5lb-gray-700 sm:w-5" />
          </motion.button>
          
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-5lb-orange-500 sm:text-sm">
              Обратная связь
            </p>
            <h1 className="text-xl font-black tracking-tight text-5lb-gray-900 sm:text-2xl">Мои отзывы</h1>
          </div>
        </div>
      </motion.header>

      <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-5 px-4 pb-20 sm:mt-6 sm:gap-6">
        {MOCK_REVIEWS.length === 0 ? (
          <motion.div
            className="group relative overflow-hidden rounded-3xl bg-white p-6 text-center shadow-lg ring-1 ring-5lb-gray-100 sm:p-8"
            variants={itemVariants}
            whileHover={{ y: -2 }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-5lb-orange-100/30 blur-3xl" />
            <div className="relative">
              <MessageCircle className="mx-auto h-12 w-12 text-5lb-gray-300 sm:h-16 sm:w-16" />
              <p className="mt-3 text-sm font-medium text-5lb-gray-600 sm:text-base">
                Вы ещё не оставляли отзывы. Поделитесь впечатлениями о товарах — мы учтём каждое мнение.
              </p>
            </div>
          </motion.div>
        ) : (
          MOCK_REVIEWS.map((review) => (
            <motion.div
              key={review.id}
              className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-lg ring-1 ring-5lb-gray-100 transition-shadow hover:shadow-xl sm:p-6"
              variants={itemVariants}
              whileHover={{ y: -2 }}
            >
              {/* Декоративный градиент */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-5lb-orange-100/20 blur-3xl" />
              
              <div className="relative flex items-start gap-3 sm:gap-4">
                <motion.div 
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-5lb-orange-100 to-5lb-orange-200 text-5lb-orange-600 shadow-sm sm:h-14 sm:w-14"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Package size={22} className="sm:w-6 sm:h-6" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-5lb-gray-900 sm:text-lg">{review.product}</h2>
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-5lb-gray-500 sm:text-sm">
                    <span>{review.date}</span>
                    <span className="h-1 w-1 rounded-full bg-5lb-gray-200" />
                    <div className="flex items-center gap-1 text-5lb-orange-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={14}
                          className={index < review.rating ? 'fill-current' : 'text-5lb-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-5lb-gray-600 sm:text-base line-clamp-2">{review.text}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <motion.button
                      type="button"
                      className="rounded-2xl bg-gradient-to-r from-5lb-orange-500 via-5lb-orange-600 to-5lb-red-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-5lb-orange-500/30 transition-all hover:shadow-xl hover:shadow-5lb-red-500/40 sm:px-5 sm:py-2.5 sm:text-sm"
                      onClick={() => setSelectedReview(review)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Подробнее
                    </motion.button>
                    <motion.button
                      type="button"
                      className="text-xs font-semibold text-5lb-orange-500 underline underline-offset-4 transition hover:text-5lb-red-500 sm:text-sm"
                      onClick={() => navigate('/catalog')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Купить снова
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Мобильное модальное окно деталей отзыва */}
      {selectedReview && (
        <GradientModal
          isOpen={!!selectedReview}
          onClose={() => {
            setSelectedReview(null);
            setIsEditing(false);
          }}
          title="Мой отзыв"
          subtitle={selectedReview.product}
          icon={MessageCircle}
          maxWidth="2xl"
        >
          <div className="p-6">
                <div className="space-y-6">
                  {/* Изображение товара */}
                  {selectedReview.productImage && (
                    <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-5lb-gray-100 sm:h-40">
                      <img
                        src={selectedReview.productImage}
                        alt={selectedReview.product}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Рейтинг */}
                  <div className="rounded-2xl bg-gradient-to-r from-5lb-orange-50 via-5lb-orange-100 to-5lb-red-50 px-4 py-3.5 ring-2 ring-5lb-orange-100/50">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-5lb-orange-700">Рейтинг</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setEditRating(index + 1)}
                            className="transition-all hover:scale-110"
                          >
                            <Star
                              size={24}
                              className={index < editRating ? 'fill-current text-5lb-orange-500' : 'text-5lb-gray-300'}
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={24}
                            className={index < selectedReview.rating ? 'fill-current text-5lb-orange-500' : 'text-5lb-gray-300'}
                          />
                        ))}
                        <span className="ml-2 text-sm font-black text-5lb-gray-900">{selectedReview.rating} из 5</span>
                      </div>
                    )}
                  </div>

                  {/* Текст отзыва */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-5lb-gray-700">Текст отзыва</p>
                    {isEditing ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full rounded-2xl border-2 border-5lb-gray-200 bg-5lb-gray-50 px-4 py-3 text-sm font-medium text-5lb-gray-900 outline-none transition-all placeholder:text-5lb-gray-400 focus:border-5lb-orange-500 focus:bg-white focus:ring-4 focus:ring-5lb-orange-500/15 sm:py-3.5 sm:text-base"
                        rows={6}
                        placeholder="Опишите ваши впечатления..."
                      />
                    ) : (
                      <div className="rounded-2xl bg-5lb-gray-50 px-4 py-3.5 ring-1 ring-5lb-gray-200">
                        <p className="text-sm font-medium leading-relaxed text-5lb-gray-700 sm:text-base">
                          {selectedReview.text}
                        </p>
                        <p className="mt-3 text-xs font-medium text-5lb-gray-500">{selectedReview.date}</p>
                      </div>
                    )}
                  </div>

                  {/* Кнопки действий */}
                  {!isEditing ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <motion.button
                        type="button"
                        onClick={handleEditReview}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-5lb-orange-500 via-5lb-orange-600 to-5lb-red-500 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-5lb-orange-500/40 transition-all hover:shadow-2xl hover:shadow-5lb-red-500/50 sm:px-6 sm:py-4"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        Редактировать
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={handleDeleteReview}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-5lb-red-300 bg-white px-5 py-3.5 text-sm font-bold text-5lb-red-600 shadow-lg shadow-5lb-red-200/20 transition-all hover:bg-gradient-to-r hover:from-5lb-red-50 hover:to-5lb-red-100 hover:shadow-xl sm:px-6 sm:py-4"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        Удалить
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <motion.button
                        type="button"
                        onClick={handleSaveReview}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-5lb-orange-500 via-5lb-orange-600 to-5lb-red-500 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-5lb-orange-500/40 transition-all hover:shadow-2xl hover:shadow-5lb-red-500/50 sm:px-6 sm:py-4"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Сохранить изменения
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditText(selectedReview.text);
                          setEditRating(selectedReview.rating);
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-5lb-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-5lb-gray-700 shadow-lg shadow-5lb-gray-200/20 transition-all hover:bg-5lb-gray-50 hover:shadow-xl sm:px-6 sm:py-4"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Отмена
                      </motion.button>
                    </div>
                  )}
                </div>
          </div>
        </GradientModal>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteConfirm && (
        <GradientModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Удалить отзыв?"
          subtitle="Это действие нельзя отменить"
          icon={Trash2}
          maxWidth="md"
          gradientType="red"
        >
          <div className="p-6">
                <p className="text-sm font-medium leading-relaxed text-5lb-gray-600">
                  Вы уверены, что хотите удалить этот отзыв? После удаления его нельзя будет восстановить.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-2xl border-2 border-5lb-gray-200 bg-white px-6 py-4 text-sm font-bold text-5lb-gray-700 shadow-lg shadow-5lb-gray-200/20 transition-all hover:bg-5lb-gray-50 hover:shadow-xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Отмена
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={confirmDeleteReview}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-5lb-red-500 via-5lb-red-600 to-5lb-red-700 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-5lb-red-500/40 transition-all hover:shadow-2xl hover:shadow-5lb-red-600/50"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Удалить
                  </motion.button>
                </div>
          </div>
        </GradientModal>
      )}
    </motion.main>
  );
};
