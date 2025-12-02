import { Router } from 'express';
import {
  getShopsList,
  getShopCatalogById,
  searchProductsHandler,
  updateCatalogsHandler,
  getCatalogsStatusHandler,
  getProductById,
  getShopProducts,
  getAllCategoriesHandler,
  getProductsByCategoryHandler,
  getAllBrandsHandler,
  getSubcategoriesByCategoryHandler,
  getBrandsBySubcategoryHandler,
  getProductsBySubcategoryHandler,
  getCategoriesWithSubcategoriesHandler,
  getProductsByBrandHandler,
} from '../controllers/catalogController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// =====================================================
// ПУБЛИЧНЫЕ РОУТЫ (не требуют авторизации)
// =====================================================

/**
 * GET /api/catalog/shops
 * Получить список всех активных магазинов
 */
router.get('/shops', optionalAuth, getShopsList);

/**
 * GET /api/catalog/shop/:shopCode
 * Получить каталог конкретного магазина
 * 
 * Параметры:
 * - shopCode: код магазина (например, "13")
 */
router.get('/shop/:shopCode', optionalAuth, getShopCatalogById);

/**
 * GET /api/catalog/search-products?q=запрос&shopCode=13
 * Поиск товаров по названию
 * 
 * Query параметры:
 * - q: поисковый запрос (обязательный)
 * - shopCode: код магазина для фильтрации (опциональный)
 */
router.get('/search-products', optionalAuth, searchProductsHandler);

/**
 * GET /api/catalog/product/:productId?shopCode=13
 * Получить информацию о конкретном товаре
 * 
 * Параметры:
 * - productId: ID товара
 * 
 * Query параметры:
 * - shopCode: код магазина (рекомендуется)
 */
router.get('/product/:productId', optionalAuth, getProductById);

/**
 * GET /api/catalog/shop-products/:shopCode?categoryId=123
 * Получить все товары магазина (опционально по категории)
 * 
 * Параметры:
 * - shopCode: код магазина
 * 
 * Query параметры:
 * - categoryId: ID категории для фильтрации (опциональный)
 */
router.get('/shop-products/:shopCode', optionalAuth, getShopProducts);

/**
 * GET /api/catalog/status
 * Получить статус кэша каталогов
 */
router.get('/status', optionalAuth, getCatalogsStatusHandler);

/**
 * POST /api/catalog/update
 * Запустить ручное обновление каталогов
 * (обновление запускается асинхронно)
 */
router.post('/update', optionalAuth, updateCatalogsHandler);

/**
 * GET /api/catalog/categories
 * Получить все категории из всех магазинов
 */
router.get('/categories', optionalAuth, getAllCategoriesHandler);

/**
 * GET /api/catalog/category/:categoryId/products
 * Получить товары по категории из всех магазинов
 */
router.get('/category/:categoryId/products', optionalAuth, getProductsByCategoryHandler);

/**
 * GET /api/catalog/brands
 * Получить все бренды
 */
router.get('/brands', optionalAuth, getAllBrandsHandler);

/**
 * GET /api/catalog/category/:categoryId/subcategories
 * Получить подкатегории по категории
 */
router.get('/category/:categoryId/subcategories', optionalAuth, getSubcategoriesByCategoryHandler);

/**
 * GET /api/catalog/subcategory/:subcategoryId/brands
 * Получить бренды по подкатегории
 */
router.get('/subcategory/:subcategoryId/brands', optionalAuth, getBrandsBySubcategoryHandler);

/**
 * GET /api/catalog/subcategory/:subcategoryId/products
 * Получить товары по подкатегории с фильтрами
 * Query параметры: brandIds (JSON массив), characteristics (JSON объект)
 */
router.get('/subcategory/:subcategoryId/products', optionalAuth, getProductsBySubcategoryHandler);

/**
 * GET /api/catalog/categories-with-subcategories
 * Получить все категории с подкатегориями
 */
router.get('/categories-with-subcategories', optionalAuth, getCategoriesWithSubcategoriesHandler);

/**
 * GET /api/catalog/brand/:brandId/products
 * Получить товары по бренду
 */
router.get('/brand/:brandId/products', optionalAuth, getProductsByBrandHandler);

export default router;

