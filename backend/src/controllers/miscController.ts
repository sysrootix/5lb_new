import { Request, Response } from 'express';
import geoip from 'geoip-lite';

export const checkCountry = async (req: Request, res: Response) => {
    try {
        // Получаем IP из заголовков (если за прокси) или из соединения
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

        // Если IP массив (multiple proxies), берем первый
        if (Array.isArray(ip)) {
            ip = ip[0];
        } else if (typeof ip === 'string' && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }

        // Для локальной разработки
        if (ip === '::1' || ip === '127.0.0.1') {
            return res.json({ country: 'RU', ip }); // Mock RU for localhost
        }

        const geo = geoip.lookup(ip);
        const country = geo ? geo.country : 'UNKNOWN';

        res.json({ country, ip });
    } catch (error) {
        console.error('Error checking country:', error);
        res.status(500).json({ error: 'Failed to check country' });
    }
};
