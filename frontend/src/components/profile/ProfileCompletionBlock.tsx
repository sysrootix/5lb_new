import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface ProfileCompletionBlockProps {
    user: User;
}

export const ProfileCompletionBlock: React.FC<ProfileCompletionBlockProps> = ({ user }) => {
    const navigate = useNavigate();

    const completionPercentage = useMemo(() => {
        let completed = 0;
        const totalFields = 5;

        if (user.firstName) completed++;
        if (user.lastName) completed++;
        if (user.dateOfBirth) completed++;
        if (user.email) completed++;
        if (user.gender) completed++;

        return Math.round((completed / totalFields) * 100);
    }, [user]);

    if (completionPercentage === 100) return null;

    return (
        <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div
                onClick={() => navigate('/settings')}
                className="cursor-pointer"
            >
                <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                    <span className="text-[#FF6B00]">Заполните профиль,</span> чтобы получать подборки товаров и бонусы на день рождения.
                </p>

                <div className="flex gap-1.5 h-1.5 w-full">
                    {[1, 2, 3, 4, 5].map((step) => {
                        const stepValue = step * 20;
                        const isCompleted = completionPercentage >= stepValue;

                        return (
                            <div
                                key={step}
                                className={`flex-1 rounded-full transition-colors duration-500 ${isCompleted ? 'bg-[#FF6B00]' : 'bg-white/20'
                                    }`}
                            />
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};
