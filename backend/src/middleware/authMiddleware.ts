import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/tokenService';

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice('bearer '.length).trim();
    if (token.length > 0) {
      return token;
    }
  }

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((cookiePart) => {
        const [rawKey, ...rawValue] = cookiePart.split('=');
        const key = rawKey.trim();
        const value = rawValue.join('=').trim();
        return [key, value];
      })
    );
    const accessToken = cookies.accessToken;
    if (accessToken && accessToken.length > 0) {
      return accessToken;
    }
  }

  return null;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
