import { Request, Response } from 'express';
import {
  getShops,
  getShopCatalog,
  searchProducts,
  updateAllCatalogs,
  getCatalogsStatus,
  getAllCategories,
  getProductsByCategory,
  getSubcategoriesByCategory,
  getAllBrands,
  getBrandsBySubcategory,
  getProductsBySubcategory,
  getCategoriesWithSubcategories,
  getProductsByBrand,
} from '../services/catalogService';
import { logger } from '../config/logger';

// =====================================================
// ПОЛУЧЕНИЕ СПИСКА МАГАЗИНОВ
// =====================================================

export const getShopsList = async (req: Request, res: Response): Promise<void> => {
  try {
    const shops = await getShops();
    res.json({
      success: true,
      data: shops,
    });
  } catch (error: any) {
    logger.error('Ошибка при получении списка магазинов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении списка магазинов',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ КАТАЛОГА КОНКРЕТНОГО МАГАЗИНА
// =====================================================

export const getShopCatalogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shopCode } = req.params;

    if (!shopCode) {
      res.status(400).json({
        success: false,
        message: 'Не указан код магазина',
      });
      return;
    }

    // Защита от специальных значений, которые могут конфликтовать с роутингом
    if (shopCode === 'search' || shopCode === 'categories' || shopCode === 'products') {
      res.status(404).json({
        success: false,
        message: 'Каталог не найден',
      });
      return;
    }

    const result = await getShopCatalog(shopCode);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        cached: result.cached || false,
        fromDatabase: result.fromDatabase || false,
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.message || 'Каталог не найден',
      });
    }
  } catch (error: any) {
    logger.error('Ошибка при получении каталога магазина:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении каталога',
      error: error.message,
    });
  }
};

// =====================================================
// ПОИСК ТОВАРОВ
// =====================================================

export const searchProductsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, shopCode } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Не указан поисковый запрос (параметр q)',
      });
      return;
    }

    const products = await searchProducts(
      q,
      shopCode && typeof shopCode === 'string' ? shopCode : undefined
    );

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error: any) {
    logger.error('Ошибка при поиске товаров:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при поиске товаров',
      error: error.message,
    });
  }
};

// =====================================================
// ОБНОВЛЕНИЕ КАТАЛОГОВ ВРУЧНУЮ
// =====================================================

export const updateCatalogsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('🔄 Запрос на ручное обновление каталогов');

    // Запускаем обновление асинхронно
    updateAllCatalogs().catch((error) => {
      logger.error('Ошибка при обновлении каталогов:', error);
    });

    res.json({
      success: true,
      message: 'Обновление каталогов запущено',
    });
  } catch (error: any) {
    logger.error('Ошибка при запуске обновления каталогов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при запуске обновления каталогов',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ СТАТУСА КЭША
// =====================================================

export const getCatalogsStatusHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = getCatalogsStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    logger.error('Ошибка при получении статуса кэша:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статуса',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ТОВАРЕ
// =====================================================

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { shopCode } = req.query;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'Не указан ID товара',
      });
      return;
    }

    // Если указан код магазина, ищем товар в конкретном магазине
    if (shopCode && typeof shopCode === 'string') {
      const catalog = await getShopCatalog(shopCode);
      
      if (catalog.success && catalog.data) {
        // Ищем товар в каталоге
        for (const category of catalog.data.categories) {
          const product = category.products.find((p: any) => p.id === productId);
          if (product) {
            res.json({
              success: true,
              data: {
                ...product,
                categoryName: category.name,
                categoryId: category.id,
                shopName: catalog.data.shopname,
                shopCode: shopCode,
              },
            });
            return;
          }
        }
      }
    }

    res.status(404).json({
      success: false,
      message: 'Товар не найден',
    });
  } catch (error: any) {
    logger.error('Ошибка при получении информации о товаре:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении информации о товаре',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ ТОВАРОВ МАГАЗИНА (ВСЕ)
// =====================================================

// =====================================================
// ПОЛУЧЕНИЕ ВСЕХ КАТЕГОРИЙ
// =====================================================

export const getAllCategoriesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await getAllCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    logger.error('Ошибка при получении категорий:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении категорий',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ ТОВАРОВ ПО КАТЕГОРИИ
// =====================================================

export const getProductsByCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      res.status(400).json({
        success: false,
        message: 'Не указан ID категории',
      });
      return;
    }

    const products = await getProductsByCategory(categoryId);
    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error: any) {
    logger.error('Ошибка при получении товаров по категории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товаров',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ ТОВАРОВ МАГАЗИНА (ВСЕ)
// =====================================================

export const getShopProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shopCode } = req.params;
    const { categoryId } = req.query;

    if (!shopCode) {
      res.status(400).json({
        success: false,
        message: 'Не указан код магазина',
      });
      return;
    }

    const catalog = await getShopCatalog(shopCode);

    if (!catalog.success || !catalog.data) {
      res.status(404).json({
        success: false,
        message: 'Каталог магазина не найден',
      });
      return;
    }

    // Если указан ID категории, фильтруем по категории
    if (categoryId && typeof categoryId === 'string') {
      const category = catalog.data.categories.find((c: any) => c.id === categoryId);
      
      if (category) {
        res.json({
          success: true,
          data: {
            shopName: catalog.data.shopname,
            shopCode: shopCode,
            category: category.name,
            products: category.products,
          },
        });
        return;
      }

      res.status(404).json({
        success: false,
        message: 'Категория не найдена',
      });
      return;
    }

    // Возвращаем все товары всех категорий
    const allProducts: any[] = [];
    catalog.data.categories.forEach((category: any) => {
      category.products.forEach((product: any) => {
        allProducts.push({
          ...product,
          categoryName: category.name,
          categoryId: category.id,
        });
      });
    });

    res.json({
      success: true,
      data: {
        shopName: catalog.data.shopname,
        shopCode: shopCode,
        products: allProducts,
      },
    });
  } catch (error: any) {
    logger.error('Ошибка при получении товаров магазина:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товаров магазина',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ ВСЕХ БРЕНДОВ
// =====================================================

export const getAllBrandsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await getAllBrands();
    res.json({
      success: true,
      data: brands,
    });
  } catch (error: any) {
    logger.error('Ошибка при получении брендов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении брендов',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ ПОДКАТЕГОРИЙ ПО КАТЕГОРИИ
// =====================================================

export const getSubcategoriesByCategoryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      res.status(400).json({
        success: false,
        message: 'Не указан ID категории',
      });
      return;
    }

    const subcategories = await getSubcategoriesByCategory(categoryId);
    res.json({
      success: true,
      data: subcategories,
    });
  } catch (error: any) {
    logger.error('Ошибка при получении подкатегорий:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении подкатегорий',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ БРЕНДОВ ПО ПОДКАТЕГОРИИ
// =====================================================

export const getBrandsBySubcategoryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subcategoryId } = req.params;

    if (!subcategoryId) {
      res.status(400).json({
        success: false,
        message: 'Не указан ID подкатегории',
      });
      return;
    }

    const brands = await getBrandsBySubcategory(subcategoryId);
    res.json({
      success: true,
      data: brands,
    });
  } catch (error: any) {
    logger.error('Ошибка при получении брендов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении брендов',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ ТОВАРОВ ПО ПОДКАТЕГОРИИ С ФИЛЬТРАМИ
// =====================================================

export const getProductsBySubcategoryHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subcategoryId } = req.params;
    const { brandIds, characteristics } = req.query;

    if (!subcategoryId) {
      res.status(400).json({
        success: false,
        message: 'Не указан ID подкатегории',
      });
      return;
    }

    const filters: any = {};

    if (brandIds) {
      try {
        filters.brandIds = typeof brandIds === 'string' 
          ? JSON.parse(brandIds) 
          : Array.isArray(brandIds) 
            ? brandIds 
            : [brandIds];
      } catch (e) {
        filters.brandIds = Array.isArray(brandIds) ? brandIds : [brandIds];
      }
    }

    if (characteristics) {
      try {
        filters.characteristics = typeof characteristics === 'string'
          ? JSON.parse(characteristics)
          : characteristics;
      } catch (e) {
        logger.warn('Ошибка парсинга характеристик:', e);
      }
    }

    const products = await getProductsBySubcategory(subcategoryId, filters);
    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error: any) {
    logger.error('Ошибка при получении товаров по подкатегории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товаров',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ ТОВАРОВ ПО БРЕНДУ
// =====================================================

export const getProductsByBrandHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brandId } = req.params;

    if (!brandId) {
      res.status(400).json({
        success: false,
        message: 'Не указан ID бренда',
      });
      return;
    }

    const products = await getProductsByBrand(brandId);
    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error: any) {
    logger.error('Ошибка при получении товаров по бренду:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товаров',
      error: error.message,
    });
  }
};

// =====================================================
// ПОЛУЧЕНИЕ КАТЕГОРИЙ С ПОДКАТЕГОРИЯМИ
// =====================================================

export const getCategoriesWithSubcategoriesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await getCategoriesWithSubcategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    logger.error('Ошибка при получении категорий с подкатегориями:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении категорий',
      error: error.message,
    });
  }
};

