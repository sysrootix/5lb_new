import { Request, Response } from 'express';
import {
  getUserCart as getUserCartService,
  addToUserCart,
  updateUserCartItemQuantity,
  removeFromUserCart,
  clearUserCart as clearUserCartService,
  getUserCartWithProducts
} from '../services/userCartService';

/**
 * Получает корзину пользователя
 * GET /api/users/cart
 */
export const getUserCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    const cart = await getUserCartWithProducts(userId);

    res.json({ cart });
  } catch (error) {
    console.error('[UserCart] Get cart error:', error);
    res.status(500).json({
      message: 'Failed to get cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Добавляет товар в корзину пользователя
 * POST /api/users/cart
 */
export const addItemToUserCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { productId, shopCode, quantity = 1, modificationIndex } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!productId || !shopCode) {
      return res.status(400).json({
        message: 'productId and shopCode are required'
      });
    }

    const cart = await addToUserCart(
      userId,
      productId,
      shopCode,
      quantity,
      modificationIndex
    );

    res.json({ success: true, cart });
  } catch (error) {
    console.error('[UserCart] Add to cart error:', error);
    res.status(500).json({
      message: 'Failed to add item to cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Обновляет количество товара в корзине пользователя
 * PUT /api/users/cart/:productId
 */
export const updateUserCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { productId } = req.params;
    const { shopCode, quantity, modificationIndex } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!shopCode || quantity === undefined) {
      return res.status(400).json({
        message: 'shopCode and quantity are required'
      });
    }

    const cart = await updateUserCartItemQuantity(
      userId,
      productId,
      shopCode,
      quantity,
      modificationIndex
    );

    res.json({ success: true, cart });
  } catch (error) {
    console.error('[UserCart] Update cart item error:', error);
    res.status(500).json({
      message: 'Failed to update cart item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Удаляет товар из корзины пользователя
 * DELETE /api/users/cart/:productId
 */
export const removeItemFromUserCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { productId } = req.params;
    const { shopCode, modificationIndex } = req.query;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!shopCode || typeof shopCode !== 'string') {
      return res.status(400).json({
        message: 'shopCode is required'
      });
    }

    const modificationIndexNum =
      modificationIndex !== undefined && typeof modificationIndex === 'string'
        ? parseInt(modificationIndex, 10)
        : undefined;

    const cart = await removeFromUserCart(
      userId,
      productId,
      shopCode,
      modificationIndexNum
    );

    res.json({ success: true, cart });
  } catch (error) {
    console.error('[UserCart] Remove from cart error:', error);
    res.status(500).json({
      message: 'Failed to remove item from cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Очищает корзину пользователя
 * DELETE /api/users/cart
 */
export const clearUserCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    await clearUserCartService(userId);

    res.json({ success: true });
  } catch (error) {
    console.error('[UserCart] Clear cart error:', error);
    res.status(500).json({
      message: 'Failed to clear cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

