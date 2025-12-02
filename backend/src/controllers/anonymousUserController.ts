import { Request, Response } from 'express';
import {
  getOrCreateAnonymousUser,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  migrateAnonymousToUser
} from '../services/anonymousUserService';

/**
 * Создает или получает анонимного пользователя
 * POST /api/anonymous/init
 */
export const initAnonymousUser = async (req: Request, res: Response) => {
  try {
    const { fingerprint } = req.body;

    if (!fingerprint) {
      return res.status(400).json({
        message: 'Fingerprint is required'
      });
    }

    const anonymousUser = await getOrCreateAnonymousUser(fingerprint);

    res.json({
      anonymousUserId: anonymousUser.id,
      favorites: anonymousUser.favorites
    });
  } catch (error) {
    console.error('[AnonymousUser] Init error:', error);
    res.status(500).json({
      message: 'Failed to initialize anonymous user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Получает избранное анонимного пользователя
 * GET /api/anonymous/favorites
 */
export const getAnonymousFavorites = async (req: Request, res: Response) => {
  try {
    const anonymousUserId = (req as any).anonymousUserId;

    if (!anonymousUserId) {
      return res.status(401).json({
        message: 'Anonymous user not identified'
      });
    }

    const favorites = await getFavorites(anonymousUserId);

    res.json({ favorites });
  } catch (error) {
    console.error('[AnonymousUser] Get favorites error:', error);
    res.status(500).json({
      message: 'Failed to get favorites',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Добавляет товар в избранное
 * POST /api/anonymous/favorites/:productId
 */
export const addAnonymousFavorite = async (req: Request, res: Response) => {
  try {
    const anonymousUserId = (req as any).anonymousUserId;
    const { productId } = req.params;

    if (!anonymousUserId) {
      return res.status(401).json({
        message: 'Anonymous user not identified'
      });
    }

    await addToFavorites(anonymousUserId, productId);

    res.json({ success: true });
  } catch (error) {
    console.error('[AnonymousUser] Add favorite error:', error);
    res.status(500).json({
      message: 'Failed to add favorite',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Удаляет товар из избранного
 * DELETE /api/anonymous/favorites/:productId
 */
export const removeAnonymousFavorite = async (req: Request, res: Response) => {
  try {
    const anonymousUserId = (req as any).anonymousUserId;
    const { productId } = req.params;

    if (!anonymousUserId) {
      return res.status(401).json({
        message: 'Anonymous user not identified'
      });
    }

    await removeFromFavorites(anonymousUserId, productId);

    res.json({ success: true });
  } catch (error) {
    console.error('[AnonymousUser] Remove favorite error:', error);
    res.status(500).json({
      message: 'Failed to remove favorite',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Мигрирует данные анонимного пользователя в реальный аккаунт
 * POST /api/anonymous/migrate
 */
export const migrateAnonymousData = async (req: Request, res: Response) => {
  try {
    const anonymousUserId = (req as any).anonymousUserId;
    const userId = (req as any).user?.userId;

    if (!anonymousUserId) {
      return res.status(401).json({
        message: 'Anonymous user not identified'
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const result = await migrateAnonymousToUser(anonymousUserId, userId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[AnonymousUser] Migrate error:', error);
    res.status(500).json({
      message: 'Failed to migrate anonymous data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};





















