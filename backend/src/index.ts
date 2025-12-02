import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';

import { env } from './config/env';
import { connectDatabase } from './config/database';
import { initTelegramBot } from './config/telegram';
import { logger } from './config/logger';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { initializeCatalogUpdates } from './services/catalogService';
import { cacheImages } from './middleware/cacheHeaders';

const app = express();

const corsOptions: CorsOptions = {
  origin: env.corsAllowedOrigins.length ? env.corsAllowedOrigins : true,
  credentials: true
};

// Настройка helmet - разрешаем CORS для роутов призов
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS для роутов призов - разрешаем все источники
app.use('/api/spin', cors({ origin: true, credentials: true }));
app.use('/api/prize', cors({ origin: true, credentials: true }));
app.use('/api/prizes', cors({ origin: true, credentials: true }));
app.use('/api/health', cors({ origin: true, credentials: true }));

// Глобальный CORS для остальных роутов
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Статические файлы для аватарок с кешированием
app.use('/uploads', cacheImages(31536000), express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDatabase();
    initTelegramBot();
    
    // Инициализация автоматического обновления каталогов
    initializeCatalogUpdates();

    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
    });
  } catch (error) {
    logger.error(`Failed to launch application: ${(error as Error).message}`);
    process.exit(1);
  }
};

start();
