import { Request, Response } from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartWithProducts
} from '../services/cartService';

/**
 * Получает корзину анонимного пользователя
 * GET /api/anonymous/cart
 */
export const getAnonymousCart = async (req: Request, res: Response) => {
  try {
    const anonymousUserId = (req as any).anonymousUserId;

    if (!anonymousUserId) {
      return res.status(401).json({
        message: 'Anonymous user not identified'
      });
    }

    const cart = await getCartWithProducts(anonymousUserId);

    res.json({ cart });
  } catch (error) {
    console.error('[Cart] Get cart error:', error);
    res.status(500).json({
      message: 'Failed to get cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Добавляет товар в корзину
 * POST /api/anonymous/cart
 */
export const addItemToCart = async (req: Request, res: Response) => {
  try {
    const anonymousUserId = (req as any).anonymousUserId;
    const { productId, shopCode, quantity = 1, modificationIndex } = req.body;

    if (!anonymousUserId) {
      return res.status(401).json({
        message: 'Anonymous user not identified'
      });
    }

    if (!productId || !shopCode) {
      return res.status(400).json({
        message: 'productId and shopCode are required'
      });
    }

    const cart = await addToCart(
      anonymousUserId,
      productId,
      shopCode,
      quantity,
      modificationIndex
    );

    res.json({ success: true, cart });
  } catch (error) {
    console.error('[Cart] Add to cart error:', error);
    res.status(500).json({
      message: 'Failed to add item to cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Обновляет количество товара в корзине
 * PUT /api/anonymous/cart/:productId
 */
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const anonymousUserId = (req as any).anonymousUserId;
    const { productId } = req.params;
    const { shopCode, quantity, modificationIndex } = req.body;

    if (!anonymousUserId) {
      return res.status(401).json({
        message: 'Anonymous user not identified'
      });
    }

    if (!shopCode || quantity === undefined) {
      return res.status(400).json({
        message: 'shopCode and quantity are required'
      });
    }

    const cart = await updateCartItemQuantity(
      anonymousUserId,
      productId,
      shopCode,
      quantity,
      modificationIndex
    );

    res.json({ success: true, cart });
  } catch (error) {
    console.error('[Cart] Update cart item error:', error);
    res.status(500).json({
      message: 'Failed to update cart item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Удаляет товар из корзины
 * DELETE /api/anonymous/cart/:productId
 */
export const removeItemFromCart = async (req: Request, res: Response) => {
  try {
    const anonymousUserId = (req as any).anonymousUserId;
    const { productId } = req.params;
    const { shopCode, modificationIndex } = req.query;

    if (!anonymousUserId) {
      return res.status(401).json({
        message: 'Anonymous user not identified'
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

    const cart = await removeFromCart(
      anonymousUserId,
      productId,
      shopCode,
      modificationIndexNum
    );

    res.json({ success: true, cart });
  } catch (error) {
    console.error('[Cart] Remove from cart error:', error);
    res.status(500).json({
      message: 'Failed to remove item from cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Очищает корзину
 * DELETE /api/anonymous/cart
 */
export const clearAnonymousCart = async (req: Request, res: Response) => {
  try {
    const anonymousUserId = (req as any).anonymousUserId;

    if (!anonymousUserId) {
      return res.status(401).json({
        message: 'Anonymous user not identified'
      });
    }

    await clearCart(anonymousUserId);

    res.json({ success: true });
  } catch (error) {
    console.error('[Cart] Clear cart error:', error);
    res.status(500).json({
      message: 'Failed to clear cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

