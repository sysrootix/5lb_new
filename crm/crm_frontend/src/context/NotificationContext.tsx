import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import clsx from 'clsx';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    description?: string;
}

interface NotificationContextType {
    showNotification: (type: NotificationType, message: string, description?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((type: NotificationType, message: string, description?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, type, message, description }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-3 pointer-events-none max-w-md w-full">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={clsx(
                            "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 fade-in",
                            notification.type === 'success' && "bg-[#180C06]/90 border-green-500/20 text-white",
                            notification.type === 'error' && "bg-[#180C06]/90 border-red-500/20 text-white",
                            notification.type === 'info' && "bg-[#180C06]/90 border-blue-500/20 text-white"
                        )}
                    >
                        <div className={clsx(
                            "p-2 rounded-full shrink-0",
                            notification.type === 'success' && "bg-green-500/10 text-green-500",
                            notification.type === 'error' && "bg-red-500/10 text-red-500",
                            notification.type === 'info' && "bg-blue-500/10 text-blue-500"
                        )}>
                            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {notification.type === 'info' && <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 pt-1">
                            <h4 className="font-bold text-sm">{notification.message}</h4>
                            {notification.description && (
                                <p className="text-gray-400 text-xs mt-1">{notification.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="p-1 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}


