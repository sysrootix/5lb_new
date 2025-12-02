import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ValidationError } from '../errors/ValidationError';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(error.message);
  
  // Если это ValidationError, возвращаем правильный статус код
  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  
  // Для остальных ошибок возвращаем 500
  res.status(500).json({ error: error.message ?? 'Internal Server Error' });
};
