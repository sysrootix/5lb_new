import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useTelegramBackButton = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        const backButton = tg.BackButton;
        if (!backButton) return;

        const handleBack = () => {
            navigate(-1);
        };

        backButton.show();
        backButton.onClick(handleBack);

        return () => {
            backButton.offClick(handleBack);
            backButton.hide();
        };
    }, [navigate]);
};
