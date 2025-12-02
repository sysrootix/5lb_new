import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, MessageSquare, Reply, Clock } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { GradientModal } from '@/components/GradientModal';

interface Question {
  id: string;
  product: string;
  productId?: string;
  question: string;
  date: string;
  answer?: string;
  answerDate?: string;
  productImage?: string;
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: 'Q-112',
    product: 'L-Carnitine Liquid 500 мл',
    productId: 'prod-3',
    question: 'Можно ли принимать курсами и как долго держать паузу между курсами?',
    date: '10 октября 2025',
    answer:
      'Рекомендуем принимать 6-8 недель, затем сделать паузу 4 недели. Обязательно учитывайте общую программу питания.',
    answerDate: '11 октября 2025',
    productImage: 'https://images.unsplash.com/photo-1558640472-9d2a7deb7f62?auto=format&w=300&q=80'
  },
  {
    id: 'Q-108',
    product: 'Креатин моногидрат 300 г',
    productId: 'prod-4',
    question: 'Есть ли вкус без добавок? Идёт ли мерная ложка в комплекте?',
    date: '2 октября 2025',
    productImage: 'https://images.unsplash.com/photo-1585238341986-37b1f2b88f04?auto=format&w=300&q=80'
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

export const ProfileQuestionsPage = () => {
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useLockBodyScroll(!!selectedQuestion);

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
              Вопросы о товарах
            </p>
            <h1 className="text-xl font-black tracking-tight text-5lb-gray-900 sm:text-2xl">Мои вопросы</h1>
          </div>
        </div>
      </motion.header>

      <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-5 px-4 pb-20 sm:mt-6 sm:gap-6">
        {MOCK_QUESTIONS.length === 0 ? (
          <motion.div
            className="group relative overflow-hidden rounded-3xl bg-white p-6 text-center shadow-lg ring-1 ring-5lb-gray-100 sm:p-8"
            variants={itemVariants}
            whileHover={{ y: -2 }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-5lb-orange-100/30 blur-3xl" />
            <div className="relative">
              <HelpCircle className="mx-auto h-12 w-12 text-5lb-gray-300 sm:h-16 sm:w-16" />
              <p className="mt-3 text-sm font-medium text-5lb-gray-600 sm:text-base">
                Вы ещё не задавали вопросов. Мы готовы помочь — спрашивайте в карточке товара.
              </p>
            </div>
          </motion.div>
        ) : (
          MOCK_QUESTIONS.map((question) => (
            <motion.div
              key={question.id}
              className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-lg ring-1 ring-5lb-gray-100 transition-shadow hover:shadow-xl sm:p-6"
              variants={itemVariants}
              whileHover={{ y: -2 }}
            >
              {/* Декоративный градиент */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-5lb-orange-100/20 blur-3xl" />
              
              <div className="relative flex items-start gap-3 sm:gap-4">
                <motion.div 
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm sm:h-14 sm:w-14 ${
                    question.answer 
                      ? 'bg-gradient-to-br from-5lb-orange-100 to-5lb-orange-200 text-5lb-orange-600' 
                      : 'bg-gradient-to-br from-5lb-red-100 to-5lb-red-200 text-5lb-red-600'
                  }`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {question.answer ? <Reply size={22} className="sm:w-6 sm:h-6" /> : <MessageSquare size={22} className="sm:w-6 sm:h-6" />}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-5lb-gray-900 sm:text-lg">{question.product}</h2>
                  <p className="mt-1 text-xs font-medium text-5lb-gray-500 sm:text-sm">{question.date}</p>
                  <p className="mt-3 text-sm text-5lb-gray-700 sm:text-base line-clamp-2">{question.question}</p>

                  {question.answer ? (
                    <div className="mt-4 rounded-2xl bg-gradient-to-r from-5lb-orange-50 to-5lb-orange-100 px-4 py-3 ring-2 ring-5lb-orange-100/50">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-5lb-orange-700">
                        <Reply size={14} />
                        Ответ 5LB
                      </div>
                      <p className="mt-2 text-sm font-medium text-5lb-gray-700 sm:text-base">{question.answer}</p>
                      <p className="mt-2 text-xs font-medium text-5lb-gray-500">{question.answerDate}</p>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-5lb-red-50 px-4 py-3 ring-2 ring-5lb-red-100/50">
                      <Clock size={14} className="text-5lb-red-600" />
                      <p className="text-xs font-medium text-5lb-red-700 sm:text-sm">
                        Ответ появится в течение 24 часов.
                      </p>
                    </div>
                  )}
                  
                  <motion.button
                    type="button"
                    className="mt-4 rounded-2xl bg-gradient-to-r from-5lb-orange-500 via-5lb-orange-600 to-5lb-red-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-5lb-orange-500/30 transition-all hover:shadow-xl hover:shadow-5lb-red-500/40 sm:px-5 sm:py-2.5 sm:text-sm"
                    onClick={() => setSelectedQuestion(question)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Подробнее
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Мобильное модальное окно деталей вопроса */}
      {selectedQuestion && (
        <GradientModal
          isOpen={!!selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          title="Мой вопрос"
          subtitle={selectedQuestion.product}
          icon={selectedQuestion.answer ? Reply : HelpCircle}
          gradientType={selectedQuestion.answer ? 'orange' : 'red'}
          maxWidth="2xl"
        >
          <div className="p-6">
                <div className="space-y-6">
                  {/* Изображение товара */}
                  {selectedQuestion.productImage && (
                    <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-5lb-gray-100 sm:h-40">
                      <img
                        src={selectedQuestion.productImage}
                        alt={selectedQuestion.product}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Вопрос */}
                  <div className="rounded-2xl bg-gradient-to-r from-5lb-red-50 via-5lb-red-100 to-5lb-red-50 px-4 py-3.5 ring-2 ring-5lb-red-100/50">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 flex-shrink-0 text-5lb-red-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-5lb-red-700">Ваш вопрос</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-5lb-gray-900 sm:text-base">
                          {selectedQuestion.question}
                        </p>
                        <p className="mt-2 text-xs font-medium text-5lb-gray-500">{selectedQuestion.date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ответ */}
                  {selectedQuestion.answer ? (
                    <div className="rounded-2xl bg-gradient-to-r from-5lb-orange-50 via-5lb-orange-100 to-5lb-orange-50 px-4 py-3.5 ring-2 ring-5lb-orange-100/50">
                      <div className="flex items-start gap-3">
                        <Reply className="h-5 w-5 flex-shrink-0 text-5lb-orange-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs font-bold uppercase tracking-wide text-5lb-orange-700">Ответ 5LB</p>
                            <span className="h-1 w-1 rounded-full bg-5lb-orange-300" />
                            <p className="text-xs font-medium text-5lb-orange-600">{selectedQuestion.answerDate}</p>
                          </div>
                          <p className="text-sm font-medium leading-relaxed text-5lb-gray-900 sm:text-base">
                            {selectedQuestion.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-gradient-to-r from-5lb-red-50 via-5lb-red-100 to-5lb-red-50 px-4 py-3.5 ring-2 ring-5lb-red-100/50">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-5lb-red-600" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-5lb-red-700">Ожидается ответ</p>
                          <p className="mt-1 text-sm font-medium text-5lb-gray-700">
                            Ответ появится в течение 24 часов. Мы обязательно ответим на ваш вопрос!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
          </div>
        </GradientModal>
      )}
    </motion.main>
  );
};
