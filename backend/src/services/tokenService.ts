import jwt, { type SignOptions } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { env } from '../config/env';
import { prisma } from '../config/database';

interface JwtPayload {
  userId: string;
}

export const signAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });
};

export const signRefreshToken = (): string => {
  return randomBytes(64).toString('hex');
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};

export const createRefreshToken = async (
  userId: string,
  userAgent?: string,
  ipAddress?: string
) => {
  const token = signRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
      userAgent,
      ipAddress
    }
  });

  return token;
};

export const validateRefreshToken = async (token: string) => {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!refreshToken) {
    throw new Error('Invalid refresh token');
  }

  if (refreshToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
    throw new Error('Refresh token expired');
  }

  return refreshToken;
};

export const revokeRefreshToken = async (token: string) => {
  await prisma.refreshToken.delete({ where: { token } });
};

export const revokeAllUserTokens = async (userId: string) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

// Удаление истекших токенов (можно запускать по cron)
export const cleanupExpiredTokens = async () => {
  const deleted = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });
  return deleted.count;
};

// Обратная совместимость (deprecated, используйте signAccessToken)
export const signToken = (
  payload: JwtPayload,
  expiresIn: SignOptions['expiresIn'] = '7d'
) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
};

// Обратная совместимость (deprecated, используйте verifyAccessToken)
export const verifyToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
