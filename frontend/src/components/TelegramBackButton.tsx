import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const TelegramBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Direct access to Telegram WebApp object to avoid hook state sync issues
    const tg = window.Telegram?.WebApp;
    const backButton = tg?.BackButton;

    if (!backButton) return;

    // Define root pages where BackButton should be HIDDEN
    // On all other pages, it will be shown automatically
    const isRootPage = 
      location.pathname === '/' ||
      location.pathname === '/catalog' ||
      location.pathname === '/cart' ||
      location.pathname === '/profile' ||
      location.pathname === '/shops';

    const shouldShow = !isRootPage;

    // Define the back action based on current route
    const handleBack = () => {
      // Special overrides for specific pages if needed, otherwise default to history back
      if (location.pathname === '/login') {
        navigate(-1); // Or navigate('/') if you want to force home
      } else {
        navigate(-1);
      }
    };

    if (shouldShow) {
      backButton.show();
      backButton.onClick(handleBack);
    } else {
      backButton.hide();
    }

    return () => {
      // Remove the listener when component updates or unmounts
      backButton.offClick(handleBack);
      // IMPORTANT: Do NOT hide the button here. 
      // We let the next effect run determine visibility to prevent flickering.
    };

  }, [location.pathname, navigate]);

  return null;
};
