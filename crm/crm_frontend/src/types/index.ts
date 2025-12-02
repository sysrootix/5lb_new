export interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone: string;
    email?: string;
    bonusBalance: number;
    createdAt: string;
    lastLoginAt?: string | null;
    gender?: string;
    dateOfBirth?: string;
    referralCode?: string;
    referredById?: string;
    registrationSource?: string;
    // Notifications
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    telegramNotifications?: boolean;
    pushNotifications?: boolean;
}

export interface FoundersLink {
    id: string;
    code: string;
    isUsed: boolean;
    usedAt?: string;
    userId?: string;
    user?: {
        id: string;
        phone: string;
        firstName?: string;
        lastName?: string;
    };
    createdAt: string;
}


