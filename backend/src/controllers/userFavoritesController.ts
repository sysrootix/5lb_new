import { Request, Response } from 'express';
import {
  getUserFavorites,
  addUserFavorite,
  removeUserFavorite,
  isUserFavorite
} from '../services/userFavoritesService';

/**
 * Получает избранное пользователя
 * GET /api/users/favorites
 */
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const favorites = await getUserFavorites(userId);

    res.json({ favorites });
  } catch (error) {
    console.error('[UserFavorites] Get favorites error:', error);
    res.status(500).json({
      message: 'Failed to get favorites',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Добавляет товар в избранное
 * POST /api/users/favorites/:productId
 */
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    await addUserFavorite(userId, productId);

    res.json({ success: true });
  } catch (error) {
    console.error('[UserFavorites] Add favorite error:', error);
    res.status(500).json({
      message: 'Failed to add favorite',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Удаляет товар из избранного
 * DELETE /api/users/favorites/:productId
 */
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    await removeUserFavorite(userId, productId);

    res.json({ success: true });
  } catch (error) {
    console.error('[UserFavorites] Remove favorite error:', error);
    res.status(500).json({
      message: 'Failed to remove favorite',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

