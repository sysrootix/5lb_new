import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import forge from 'node-forge';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';
import { logger } from '../config/logger';
import Fuse from 'fuse.js';

const prisma = new PrismaClient();

// =====================================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =====================================================

interface BalanceApiResponse {
  status?: string;
  message?: string;
  data?: {
    shopname?: string;
    items?: CategoryItem[];
  };
}

interface CategoryItem {
  id: string;
  name: string;
  quanty: number | null;
  retail_price?: number;
  purchase_price?: number;
  items?: ProductItem[];
}

interface ProductItem {
  id: string;
  name: string;
  quanty: number;
  retail_price?: number;
  purchase_price?: number;
  items?: ModificationItem[]; // Модификации товара
}

interface ModificationItem {
  id: string;
  name: string;
  quanty: number;
  retail_price?: number;
}

interface CatalogCache {
  shopId: string;
  data: any;
  timestamp: number;
}

// =====================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// =====================================================

let catalogsCache = new Map<string, CatalogCache>();
let catalogsLastUpdated = 0;
const CATALOGS_CACHE_DURATION = 60 * 60 * 1000; // 60 минут
let httpsAgent: https.Agent | null = null;

// =====================================================
// ИНИЦИАЛИЗАЦИЯ HTTPS АГЕНТА С СЕРТИФИКАТОМ
// =====================================================

function initializeHttpsAgent(): https.Agent | null {
  try {
    const certPath = path.join(process.cwd(), config.balanceApi.certPath);
    
    if (!fs.existsSync(certPath)) {
      logger.warn(`⚠️ Сертификат не найден: ${certPath}`);
      logger.warn('⚠️ Система каталогов будет работать без интеграции с 1С');
      return null;
    }

    const certBuffer = fs.readFileSync(certPath);
    const p12Der = forge.util.createBuffer(certBuffer.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, config.balanceApi.certPassword);

    // Извлекаем сертификат и приватный ключ
    let privateKey: string | undefined;
    let certificate: string | undefined;

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

    const certBag = certBags[forge.pki.oids.certBag];
    if (certBag && certBag.length > 0 && certBag[0].cert) {
      certificate = forge.pki.certificateToPem(certBag[0].cert);
      logger.info('✅ Сертификат успешно извлечен');
    }

    const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];
    if (keyBag && keyBag.length > 0 && keyBag[0].key) {
      privateKey = forge.pki.privateKeyToPem(keyBag[0].key);
      logger.info('✅ Приватный ключ успешно извлечен');
    }

    if (!certificate || !privateKey) {
      throw new Error('Не удалось извлечь сертификат или ключ из .p12 файла');
    }

    // Настраиваем https агент с клиентским сертификатом
    const agent = new https.Agent({
      rejectUnauthorized: true,
      cert: certificate,
      key: privateKey,
    });

    logger.info('✅ HTTPS агент успешно инициализирован');
    return agent;
  } catch (error) {
    logger.error('❌ Ошибка при инициализации HTTPS агента:', error);
    return null;
  }
}

// =====================================================
// ОТПРАВКА ЗАПРОСА К BALANCE API
// =====================================================

async function sendBalanceRequest(shopId: string, type: string = 'store_data'): Promise<any> {
  try {
    logger.info(`🌐 Отправка запроса к Balance API: shopId: ${shopId}, type: ${type}`);

    if (!httpsAgent) {
      httpsAgent = initializeHttpsAgent();
      if (!httpsAgent) {
        throw new Error('Не удалось инициализировать HTTPS агент с сертификатом');
      }
    }

    // Подготавливаем данные для отправки
    const requestData = {
      shop_id: shopId,
      type: type,
    };

    // Подготавливаем опции запроса с сертификатом
    const options = {
      httpsAgent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${config.balanceApi.credentials}`,
      },
      timeout: 30000, // 30 секунд таймаут
    };

    // Отправляем запрос к API
    const response = await axios.post<BalanceApiResponse>(
      config.balanceApi.url,
      requestData,
      options
    );

    // Обрабатываем ответ
    if (response.data) {
      if (response.data.status === 'success') {
        logger.info(`✅ Успешный ответ от Balance API (${type})`);
        return {
          success: true,
          data: response.data.data,
        };
      } else if (response.data.status === 'error') {
        logger.warn(`⚠️ Ошибка от Balance API (${type}): ${response.data.message}`);
        return {
          success: false,
          message: response.data.message || 'Ошибка от API',
        };
      } else {
        // Если сервер вернул данные без поля status - считаем это успешным ответом
        logger.info(`✅ Получены данные от Balance API (${type}) без поля status`);
        return {
          success: true,
          data: response.data,
        };
      }
    }

    return {
      success: false,
      message: 'Получен пустой ответ от API',
    };
  } catch (error: any) {
    logger.error(`❌ Ошибка при отправке запроса к Balance API (${type}):`, error.message);
    return {
      success: false,
      message: `Ошибка при отправке запроса: ${error.message}`,
    };
  }
}

// =====================================================
// ПРЕОБРАЗОВАНИЕ КАТАЛОГА В УДОБОЧИТАЕМЫЙ ФОРМАТ
// =====================================================

function buildReadableCatalog(rawData: any, shopId: string): any {
  if (!rawData || !rawData.items) {
    return {
      shopname: rawData?.shopname || 'Неизвестный магазин',
      shop_id: shopId,
      categories: [],
    };
  }

  const categories = rawData.items.map((category: CategoryItem) => {
    const products: any[] = [];

    if (category.items) {
      category.items.forEach((item: ProductItem) => {
        // Если у элемента есть вложенные items - это товар с модификациями
        if (item.items && item.items.length > 0) {
          products.push({
            id: item.id,
            name: item.name,
            quanty: item.quanty,
            retail_price: item.retail_price,
            purchase_price: item.purchase_price,
            modifications: item.items.map((mod: ModificationItem) => ({
              id: mod.id,
              name: mod.name,
              quanty: mod.quanty,
              retail_price: mod.retail_price,
            })),
          });
        } else {
          // Обычный товар без модификаций
          products.push({
            id: item.id,
            name: item.name,
            quanty: item.quanty,
            retail_price: item.retail_price,
            purchase_price: item.purchase_price,
            modifications: [],
          });
        }
      });
    }

    return {
      id: category.id,
      name: category.name,
      products: products,
    };
  });

  return {
    shopname: rawData.shopname || 'Неизвестный магазин',
    shop_id: shopId,
    categories: categories,
  };
}

// =====================================================
// СОХРАНЕНИЕ ТОВАРОВ В БАЗУ ДАННЫХ
// =====================================================

async function saveCatalogToDatabase(catalog: any, shopCode: string): Promise<void> {
  try {
    logger.info(`💾 Сохранение каталога магазина ${shopCode} в базу данных...`);

    // Получаем все товары из каталога
    const productsToSave: any[] = [];

    catalog.categories.forEach((category: any) => {
      category.products.forEach((product: any) => {
        productsToSave.push({
          externalId: product.id,
          name: product.name,
          categoryName: category.name,
          categoryId: category.id,
          retailPrice: product.retail_price,
          purchasePrice: product.purchase_price,
          quantity: product.quanty,
          characteristics: null,
          modifications: product.modifications.length > 0 ? product.modifications : null,
          shopCode: shopCode,
          shopName: catalog.shopname,
          isActive: true,
          lastUpdated: new Date(),
        });
      });
    });

    // Деактивируем все старые товары этого магазина
    await prisma.catalogProduct.updateMany({
      where: { shopCode: shopCode },
      data: { isActive: false },
    });

    // Сохраняем или обновляем товары
    for (const product of productsToSave) {
      await prisma.catalogProduct.upsert({
        where: {
          externalId_shopCode: {
            externalId: product.externalId,
            shopCode: product.shopCode,
          },
        },
        update: {
          name: product.name,
          categoryName: product.categoryName,
          categoryId: product.categoryId,
          retailPrice: product.retailPrice,
          purchasePrice: product.purchasePrice,
          quantity: product.quantity,
          characteristics: product.characteristics,
          modifications: product.modifications,
          shopName: product.shopName,
          isActive: true,
          lastUpdated: new Date(),
        },
        create: product,
      });
    }

    logger.info(
      `✅ Сохранено ${productsToSave.length} товаров для магазина ${shopCode}`
    );
  } catch (error) {
    logger.error(`❌ Ошибка при сохранении каталога в БД:`, error);
    throw error;
  }
}

// =====================================================
// ПОЛУЧЕНИЕ КАТАЛОГА МАГАЗИНА
// =====================================================

export async function getShopCatalog(shopId: string): Promise<any> {
  try {
    // Проверяем кэш
    const cached = catalogsCache.get(shopId);
    if (cached && Date.now() - cached.timestamp < CATALOGS_CACHE_DURATION) {
      logger.info(`📦 Возврат каталога магазина ${shopId} из кэша`);
      return {
        success: true,
        data: cached.data,
        cached: true,
      };
    }

    // Запрашиваем данные из API
    const response = await sendBalanceRequest(shopId, 'store_data');

    if (response.success && response.data) {
      const catalog = buildReadableCatalog(response.data, shopId);

      // Сохраняем в кэш
      catalogsCache.set(shopId, {
        shopId: shopId,
        data: catalog,
        timestamp: Date.now(),
      });

      // Сохраняем в базу данных (асинхронно)
      saveCatalogToDatabase(catalog, shopId).catch((error) => {
        logger.error(`Ошибка при сохранении каталога ${shopId}:`, error);
      });

      return {
        success: true,
        data: catalog,
        cached: false,
      };
    }

    // Если не удалось получить данные - возвращаем из БД
    const shop = await prisma.shopLocation.findUnique({
      where: { shopCode: shopId },
      include: {
        products: {
          where: { isActive: true },
        },
      },
    });

    if (shop) {
      logger.info(`📦 Возврат каталога магазина ${shopId} из базы данных`);
      return {
        success: true,
        data: formatCatalogFromDatabase(shop),
        cached: false,
        fromDatabase: true,
      };
    }

    return {
      success: false,
      message: 'Не удалось получить каталог магазина',
    };
  } catch (error: any) {
    logger.error(`❌ Ошибка при получении каталога магазина ${shopId}:`, error);
    return {
      success: false,
      message: error.message,
    };
  }
}

// =====================================================
// ФОРМАТИРОВАНИЕ КАТАЛОГА ИЗ БАЗЫ ДАННЫХ
// =====================================================

function formatCatalogFromDatabase(shop: any): any {
  const categoriesMap = new Map<string, any>();

  shop.products.forEach((product: any) => {
    if (!categoriesMap.has(product.categoryId)) {
      categoriesMap.set(product.categoryId, {
        id: product.categoryId,
        name: product.categoryName,
        products: [],
      });
    }

    categoriesMap.get(product.categoryId).products.push({
      id: product.externalId,
      name: product.name,
      quanty: product.quantity,
      retail_price: product.retailPrice,
      purchase_price: product.purchasePrice,
      modifications: product.modifications || [],
    });
  });

  return {
    shopname: shop.shopName,
    shop_id: shop.shopCode,
    categories: Array.from(categoriesMap.values()),
  };
}

// =====================================================
// ПОЛУЧЕНИЕ СПИСКА МАГАЗИНОВ
// =====================================================

export async function getShops(): Promise<any[]> {
  try {
    const shops = await prisma.shopLocation.findMany({
      where: { isActive: true },
      orderBy: [{ priorityOrder: 'asc' }, { shopName: 'asc' }],
    });

    return shops.map((shop) => ({
      id: shop.id,
      shopCode: shop.shopCode,
      shopName: shop.shopName,
      address: shop.address,
      city: shop.city,
      description: shop.description,
      phone: shop.phone,
      workingHours: shop.workingHours,
      twogisUrl: shop.twogisUrl,
      yandexMapsUrl: shop.yandexMapsUrl,
      googleMapsUrl: shop.googleMapsUrl,
      latitude: shop.latitude,
      longitude: shop.longitude,
    }));
  } catch (error) {
    logger.error('❌ Ошибка при получении списка магазинов:', error);
    throw error;
  }
}

// =====================================================
// ОБНОВЛЕНИЕ КАТАЛОГОВ ВСЕХ МАГАЗИНОВ
// =====================================================

export async function updateAllCatalogs(): Promise<void> {
  try {
    logger.info('🔄 Запуск обновления каталогов всех магазинов...');

    const shops = await prisma.shopLocation.findMany({
      where: { isActive: true },
    });

    for (const shop of shops) {
      try {
        logger.info(`🔄 Обновление каталога магазина ${shop.shopCode} (${shop.shopName})...`);
        await getShopCatalog(shop.shopCode);
      } catch (error) {
        logger.error(`❌ Ошибка при обновлении каталога магазина ${shop.shopCode}:`, error);
      }
    }

    catalogsLastUpdated = Date.now();
    logger.info('✅ Обновление каталогов завершено');
  } catch (error) {
    logger.error('❌ Ошибка при обновлении каталогов:', error);
  }
}

// =====================================================
// ПОИСК ТОВАРОВ
// =====================================================

export async function searchProducts(query: string, shopCode?: string): Promise<any[]> {
  try {
    const searchTerm = query.trim().toLowerCase();
    
    // Проверяем, является ли запрос артикулом (обычно начинается с букв и содержит цифры)
    const isArticleQuery = /^[a-zа-яё]*\d+/.test(searchTerm);
    
    const whereClause: any = {
      isActive: true,
      OR: [
        // Поиск по названию товара - используем более широкий поиск
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        // Поиск по категории
        {
          categoryName: {
            contains: query,
            mode: 'insensitive',
          },
        },
        // Поиск по артикулу (externalId)
        {
          externalId: {
            contains: query,
            mode: 'insensitive',
          },
        },
        // Поиск в характеристиках (JSON поле)
        {
          characteristics: {
            path: [],
            string_contains: query,
          },
        },
      ],
    };

    // Если запрос похож на артикул, приоритетно ищем по externalId
    if (isArticleQuery) {
      whereClause.OR = [
        {
          externalId: {
            contains: query,
            mode: 'insensitive',
          },
        },
        ...whereClause.OR.filter((item: any) => !item.externalId),
      ];
    }

    if (shopCode) {
      whereClause.shopCode = shopCode;
    }

    // Получаем товары с точным совпадением
    let products = await prisma.catalogProduct.findMany({
      where: whereClause,
      take: 100,
      orderBy: [
        { name: 'asc' },
      ],
    });

    // Если результатов мало или их нет, и запрос длиннее 3 символов,
    // делаем более широкий поиск для поддержки опечаток
    if (products.length < 10 && searchTerm.length >= 4) {
      // Получаем больше товаров, разбивая запрос на части
      // Например, для "прате" будем искать товары, где название содержит хотя бы часть запроса
      const searchParts: string[] = [];
      
      // Разбиваем запрос на части по 2-3 символа
      for (let i = 0; i <= searchTerm.length - 2; i++) {
        const part = searchTerm.substring(i, Math.min(i + 3, searchTerm.length));
        if (part.length >= 2) {
          searchParts.push(part);
        }
      }
      
      // Если есть части для поиска, делаем дополнительный запрос
      if (searchParts.length > 0) {
        const expandedWhereClause: any = {
          isActive: true,
          OR: searchParts.map(part => ({
            name: {
              contains: part,
              mode: 'insensitive',
            },
          })),
        };
        
        if (shopCode) {
          expandedWhereClause.shopCode = shopCode;
        }
        
        const expandedProducts = await prisma.catalogProduct.findMany({
          where: expandedWhereClause,
          take: 200, // Получаем больше товаров для фильтрации
          orderBy: [
            { name: 'asc' },
          ],
        });
        
        // Объединяем результаты, убирая дубликаты
        const existingIds = new Set(products.map(p => `${p.externalId}-${p.shopCode}`));
        const newProducts = expandedProducts.filter(p => 
          !existingIds.has(`${p.externalId}-${p.shopCode}`)
        );
        products = [...products, ...newProducts];
      }
    }

    // Подготавливаем данные для нечеткого поиска с fuse.js
    // Создаем массив объектов с поисковыми полями
    const searchableProducts = products.map((product) => {
      // Собираем все поисковые данные в одну строку
      let searchText = `${product.name} ${product.categoryName || ''} ${product.externalId}`;
      
      // Добавляем характеристики
      if (product.characteristics) {
        try {
          const characteristics = typeof product.characteristics === 'string' 
            ? JSON.parse(product.characteristics) 
            : product.characteristics;
          
          for (const key in characteristics) {
            const value = characteristics[key];
            if (Array.isArray(value)) {
              searchText += ' ' + value.join(' ');
            } else if (typeof value === 'string') {
              searchText += ' ' + value;
            }
          }
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }
      
      // Добавляем модификации
      if (product.modifications) {
        try {
          const modifications = typeof product.modifications === 'string'
            ? JSON.parse(product.modifications)
            : product.modifications;
          
          if (Array.isArray(modifications)) {
            modifications.forEach((mod: any) => {
              const modName = mod.name || mod.Name || '';
              if (modName) {
                searchText += ' ' + modName;
              }
            });
          }
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }
      
      return {
        ...product,
        searchText: searchText.toLowerCase(),
      };
    });
    
    // Настраиваем fuse.js для нечеткого поиска
    const fuse = new Fuse(searchableProducts, {
      keys: ['searchText', 'name', 'categoryName'],
      threshold: 0.4, // Порог похожести (0.0 = точное совпадение, 1.0 = принимает всё)
      minMatchCharLength: 2, // Минимальная длина совпадения
      includeScore: true, // Включаем оценку релевантности
      ignoreLocation: true, // Игнорируем позицию совпадения
      findAllMatches: true, // Находим все совпадения
    });
    
    // Выполняем поиск
    const fuseResults = fuse.search(query);
    
    // Если fuse.js нашел результаты, используем их
    // Если нет - используем простую фильтрацию по точному совпадению
    let filteredProducts;
    if (fuseResults.length > 0) {
      // Сортируем по релевантности (меньше score = лучше совпадение)
      filteredProducts = fuseResults
        .sort((a, b) => (a.score || 1) - (b.score || 1))
        .map(result => result.item);
    } else {
      // Fallback к простому поиску
      filteredProducts = products.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const categoryMatch = product.categoryName?.toLowerCase().includes(searchTerm);
        const articleMatch = product.externalId.toLowerCase().includes(searchTerm);
        
        return nameMatch || categoryMatch || articleMatch;
      });
    }

    return filteredProducts.map((product) => ({
      id: product.externalId,
      name: product.name,
      categoryName: product.categoryName,
      categoryId: product.categoryId,
      retail_price: product.retailPrice,
      purchase_price: product.purchasePrice,
      quanty: product.quantity || 0,
      shopCode: product.shopCode,
      shopName: product.shopName,
      modifications: product.modifications,
      characteristics: product.characteristics,
    }));
  } catch (error) {
    logger.error('❌ Ошибка при поиске товаров:', error);
    throw error;
  }
}

// =====================================================
// ПОЛУЧЕНИЕ ВСЕХ КАТЕГОРИЙ ИЗ ВСЕХ МАГАЗИНОВ
// =====================================================

export async function getAllCategories(): Promise<any[]> {
  try {
    const categories = await prisma.catalogProduct.findMany({
      where: { isActive: true },
      select: {
        categoryId: true,
        categoryName: true,
      },
      distinct: ['categoryId'],
    });

    // Подсчитываем количество товаров в каждой категории
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        if (!cat.categoryId || !cat.categoryName) return null;
        
        const count = await prisma.catalogProduct.count({
          where: {
            categoryId: cat.categoryId,
            isActive: true,
          },
        });

        return {
          id: cat.categoryId,
          name: cat.categoryName,
          count,
        };
      })
    );

    return categoriesWithCount.filter((cat) => cat !== null) as any[];
  } catch (error) {
    logger.error('❌ Ошибка при получении категорий:', error);
    throw error;
  }
}

// =====================================================
// ПОЛУЧЕНИЕ ТОВАРОВ ПО КАТЕГОРИИ ИЗ ВСЕХ МАГАЗИНОВ
// =====================================================

export async function getProductsByCategory(categoryId: string): Promise<any[]> {
  try {
    const products = await prisma.catalogProduct.findMany({
      where: {
        categoryId: categoryId,
        isActive: true,
      },
      select: {
        externalId: true,
        name: true,
        categoryName: true,
        categoryId: true,
        retailPrice: true,
        purchasePrice: true,
        quantity: true,
        shopCode: true,
        shopName: true,
        modifications: true,
        characteristics: true,
      },
      orderBy: { name: 'asc' },
    });

    return products.map((product) => ({
      id: product.externalId,
      name: product.name,
      categoryName: product.categoryName,
      categoryId: product.categoryId,
      retail_price: product.retailPrice,
      purchase_price: product.purchasePrice,
      quanty: product.quantity || 0,
      shopCode: product.shopCode,
      shopName: product.shopName,
      modifications: product.modifications,
      characteristics: product.characteristics,
    }));
  } catch (error) {
    logger.error('❌ Ошибка при получении товаров по категории:', error);
    throw error;
  }
}

// =====================================================
// ПОЛУЧЕНИЕ ПОДКАТЕГОРИЙ ПО КАТЕГОРИИ
// =====================================================

export async function getSubcategoriesByCategory(categoryId: string): Promise<any[]> {
  try {
    const subcategories = await prisma.catalogSubcategory.findMany({
      where: {
        categoryId: categoryId,
        isActive: true,
      },
      orderBy: {
        orderIndex: 'asc',
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      categoryId: sub.categoryId,
      description: sub.description,
      icon: sub.icon,
      image: sub.image,
      orderIndex: sub.orderIndex,
      productCount: sub._count.products,
    }));
  } catch (error) {
    logger.error('❌ Ошибка при получении подкатегорий:', error);
    throw error;
  }
}

// =====================================================
// ПОЛУЧЕНИЕ ВСЕХ БРЕНДОВ
// =====================================================

export async function getAllBrands(): Promise<any[]> {
  try {
    const brands = await prisma.catalogBrand.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logo: brand.logo,
      website: brand.website,
      productCount: brand._count.products,
    }));
  } catch (error) {
    logger.error('❌ Ошибка при получении брендов:', error);
    throw error;
  }
}

// =====================================================
// ПОЛУЧЕНИЕ БРЕНДОВ ПО ПОДКАТЕГОРИИ
// =====================================================

export async function getBrandsBySubcategory(subcategoryId: string): Promise<any[]> {
  try {
    const products = await prisma.catalogProduct.findMany({
      where: {
        subcategoryId: subcategoryId,
        isActive: true,
        brandId: { not: null },
      },
      select: {
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      distinct: ['brandId'],
    });

    const brandsMap = new Map();
    products.forEach((product) => {
      if (product.brand && product.brandId) {
        if (!brandsMap.has(product.brandId)) {
          brandsMap.set(product.brandId, {
            id: product.brand.id,
            name: product.brand.name,
            slug: product.brand.slug,
            logo: product.brand.logo,
          });
        }
      }
    });

    return Array.from(brandsMap.values());
  } catch (error) {
    logger.error('❌ Ошибка при получении брендов по подкатегории:', error);
    throw error;
  }
}

// =====================================================
// ПОЛУЧЕНИЕ ТОВАРОВ ПО ПОДКАТЕГОРИИ С ФИЛЬТРАМИ
// =====================================================

export async function getProductsBySubcategory(
  subcategoryId: string,
  filters?: {
    brandIds?: string[];
    characteristics?: Record<string, any>;
  }
): Promise<any[]> {
  try {
    const whereClause: any = {
      subcategoryId: subcategoryId,
      isActive: true,
    };

    if (filters?.brandIds && filters.brandIds.length > 0) {
      whereClause.brandId = { in: filters.brandIds };
    }

    // Фильтрация по характеристикам
    if (filters?.characteristics) {
      const characteristicsFilters: any[] = [];
      Object.entries(filters.characteristics).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          characteristicsFilters.push({
            characteristics: {
              path: [key],
              equals: value,
            },
          });
        }
      });
      if (characteristicsFilters.length > 0) {
        whereClause.AND = characteristicsFilters;
      }
    }

    const products = await prisma.catalogProduct.findMany({
      where: whereClause,
      select: {
        externalId: true,
        name: true,
        categoryName: true,
        categoryId: true,
        subcategoryId: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        retailPrice: true,
        purchasePrice: true,
        quantity: true,
        shopCode: true,
        shopName: true,
        modifications: true,
        characteristics: true,
      },
      orderBy: { name: 'asc' },
    });

    return products.map((product) => ({
      id: product.externalId,
      name: product.name,
      categoryName: product.categoryName,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      brandId: product.brandId,
      brand: product.brand ? {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
      } : null,
      retail_price: product.retailPrice,
      purchase_price: product.purchasePrice,
      quanty: product.quantity || 0,
      shopCode: product.shopCode,
      shopName: product.shopName,
      modifications: product.modifications,
      characteristics: product.characteristics,
    }));
  } catch (error) {
    logger.error('❌ Ошибка при получении товаров по подкатегории:', error);
    throw error;
  }
}

// =====================================================
// ПОЛУЧЕНИЕ ТОВАРОВ ПО БРЕНДУ
// =====================================================

export async function getProductsByBrand(brandId: string): Promise<any[]> {
  try {
    const products = await prisma.catalogProduct.findMany({
      where: {
        brandId: brandId,
        isActive: true,
      },
      select: {
        externalId: true,
        name: true,
        categoryName: true,
        categoryId: true,
        subcategoryId: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        retailPrice: true,
        purchasePrice: true,
        quantity: true,
        shopCode: true,
        shopName: true,
        modifications: true,
        characteristics: true,
      },
      orderBy: { name: 'asc' },
    });

    return products.map((product) => ({
      id: product.externalId,
      name: product.name,
      categoryName: product.categoryName,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      brandId: product.brandId,
      brand: product.brand ? {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
      } : null,
      retail_price: product.retailPrice,
      purchase_price: product.purchasePrice,
      quanty: product.quantity || 0,
      shopCode: product.shopCode,
      shopName: product.shopName,
      modifications: product.modifications,
      characteristics: product.characteristics,
    }));
  } catch (error) {
    logger.error('❌ Ошибка при получении товаров по бренду:', error);
    throw error;
  }
}

// =====================================================
// ПОЛУЧЕНИЕ КАТЕГОРИЙ С ПОДКАТЕГОРИЯМИ
// =====================================================

export async function getCategoriesWithSubcategories(): Promise<any[]> {
  try {
    const categories = await prisma.catalogProduct.findMany({
      where: { isActive: true },
      select: {
        categoryId: true,
        categoryName: true,
      },
      distinct: ['categoryId'],
    });

    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (cat) => {
        if (!cat.categoryId || !cat.categoryName) return null;

        const subcategories = await getSubcategoriesByCategory(cat.categoryId);
        const count = await prisma.catalogProduct.count({
          where: {
            categoryId: cat.categoryId,
            isActive: true,
          },
        });

        return {
          id: cat.categoryId,
          name: cat.categoryName,
          count,
          subcategories,
        };
      })
    );

    return categoriesWithSubcategories.filter((cat) => cat !== null) as any[];
  } catch (error) {
    logger.error('❌ Ошибка при получении категорий с подкатегориями:', error);
    throw error;
  }
}

// =====================================================
// СТАТУС КЭША
// =====================================================

export function getCatalogsStatus(): any {
  return {
    cacheSize: catalogsCache.size,
    lastUpdated: catalogsLastUpdated
      ? new Date(catalogsLastUpdated).toISOString()
      : null,
    cacheDuration: CATALOGS_CACHE_DURATION,
  };
}

// =====================================================
// ИНИЦИАЛИЗАЦИЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ
// =====================================================

export function initializeCatalogUpdates(): void {
  logger.info('📅 Инициализация автоматического обновления каталогов...');

  // Запускаем обновление каталогов каждые 30 минут
  cron.schedule('*/30 * * * *', async () => {
    logger.info('⏰ Плановое обновление каталогов...');
    await updateAllCatalogs();
  });

  // Запускаем первое обновление через 10 секунд после старта
  setTimeout(async () => {
    logger.info('🚀 Первоначальное обновление каталогов...');
    await updateAllCatalogs();
  }, 10000);

  logger.info('✅ Автоматическое обновление каталогов настроено');
}

