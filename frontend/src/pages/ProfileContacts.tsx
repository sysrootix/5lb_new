import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  Send,
  MapPin,
  Globe
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlobalBackground } from '../components/GlobalBackground';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';

interface ContactItem {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
}

const CONTACTS: ContactItem[] = [
  { label: 'Телефон', value: '+7 924 151 2555', icon: Phone, href: 'tel:+79241512555' },
  { label: 'Email', value: 'support@5lb.pro', icon: Mail, href: 'mailto:support@5lb.pro' },
  { label: 'VK', value: '@we5lb', icon: Globe, href: 'https://vk.com/we5lb' },
  { label: 'Telegram', value: '@we5lb', icon: Send, href: 'https://t.me/we5lb' },
  { label: 'Сайт', value: 'https://5lb.pro', icon: Globe, href: 'https://5lb.pro' }
];

export const ProfileContactsPage = () => {
  useTelegramBackButton();

  return (
    <div className="min-h-screen relative pb-20">
      <GlobalBackground />

      {/* Заголовок */}
      <div className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Контакты</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-2">Служба заботы</h2>
          <p className="text-gray-300">
            Отвечаем ежедневно с 09:00 до 21:00 по хабаровскому времени. Задайте вопрос — поможем подобрать
            добавки, оформить доставку и расскажем про акции.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTACTS.map((contact, index) => {
            const Icon = contact.icon;
            return (
              <motion.a
                key={contact.label}
                href={contact.href ?? '#'}
                target={contact.href?.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 flex items-center gap-4 hover:bg-white/15 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-5lb-orange-500/20 text-5lb-orange-500">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {contact.label}
                  </p>
                  <p className="text-sm font-bold text-white">{contact.value}</p>
                </div>
              </motion.a>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
        >

        </motion.div>
      </div>
    </div>
  );
};
