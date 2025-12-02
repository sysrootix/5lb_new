import { http } from './http';

// =====================================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =====================================================

export interface Shop {
  id: string;
  shopCode: string;
  shopName: string;
  address?: string;
  city: string;
  description?: string;
  phone?: string;
  workingHours?: string;
  twogisUrl?: string;
  yandexMapsUrl?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface ProductModification {
  id: string;
  name: string;
  quanty: number;
  retail_price?: number;
}

export interface Product {
  id: string;
  name: string;
  quanty: number;
  retail_price?: number;
  purchase_price?: number;
  modifications?: ProductModification[];
  categoryName?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  brand?: Brand | null;
  shopCode?: string;
  shopName?: string;
  allShops?: Array<{
    shopCode: string;
    shopName: string;
    quantity: number;
    retail_price?: number;
  }>;
  characteristics?: Record<string, any> | null;
  images?: string[];
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
}

export interface ShopCatalog {
  shopname: string;
  shop_id: string;
  categories: Category[];
}

export interface CatalogResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  cached?: boolean;
  fromDatabase?: boolean;
}

export interface SearchProductsResponse {
  success: boolean;
  data: Product[];
  count: number;
}

export interface CatalogStatus {
  cacheSize: number;
  lastUpdated: string | null;
  cacheDuration: number;
}

// =====================================================
// API МЕТОДЫ
// =====================================================

/**
 * Получить список всех магазинов
 */
export const getShops = async (): Promise<Shop[]> => {
  const response = await http.get<CatalogResponse<Shop[]>>('/catalog/shops');
  return response.data.data || [];
};

/**
 * Получить каталог конкретного магазина
 */
export const getShopCatalog = async (shopCode: string): Promise<ShopCatalog | null> => {
  const response = await http.get<CatalogResponse<ShopCatalog>>(`/catalog/shop/${shopCode}`);
  return response.data.data || null;
};

/**
 * Поиск товаров
 * @param query - поисковый запрос
 * @param shopCode - опциональный код магазина для фильтрации
 */
export const searchProducts = async (query: string, shopCode?: string): Promise<Product[]> => {
  const params: any = { q: query };
  if (shopCode) {
    params.shopCode = shopCode;
  }

  const response = await http.get<SearchProductsResponse>('/catalog/search-products', { params });
  return response.data.data || [];
};

/**
 * Получить информацию о товаре
 */
export const getProduct = async (productId: string, shopCode?: string): Promise<Product | null> => {
  const params = shopCode ? { shopCode } : {};
  const response = await http.get<CatalogResponse<Product>>(`/catalog/product/${productId}`, { params });
  return response.data.data || null;
};

/**
 * Получить все товары магазина (опционально по категории)
 */
export const getShopProducts = async (shopCode: string, categoryId?: string): Promise<{
  shopName: string;
  shopCode: string;
  category?: string;
  products: Product[];
} | null> => {
  const params = categoryId ? { categoryId } : {};
  const response = await http.get<CatalogResponse<{
    shopName: string;
    shopCode: string;
    category?: string;
    products: Product[];
  }>>(`/catalog/shop-products/${shopCode}`, { params });
  return response.data.data || null;
};

/**
 * Получить все категории из всех магазинов
 */
export const getAllCategories = async (): Promise<Array<{
  id: string;
  name: string;
  count: number;
}>> => {
  const response = await http.get<CatalogResponse<Array<{
    id: string;
    name: string;
    count: number;
  }>>>('/catalog/categories');
  return response.data.data || [];
};

/**
 * Получить товары по категории из всех магазинов
 */
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const response = await http.get<SearchProductsResponse>(`/catalog/category/${categoryId}/products`);
  return response.data.data || [];
};

/**
 * Получить статус кэша каталогов
 */
export const getCatalogStatus = async (): Promise<CatalogStatus | null> => {
  const response = await http.get<CatalogResponse<CatalogStatus>>('/catalog/status');
  return response.data.data || null;
};

/**
 * Запустить обновление каталогов вручную
 */
export const updateCatalogs = async (): Promise<boolean> => {
  const response = await http.post<CatalogResponse<any>>('/catalog/update');
  return response.data.success;
};

/**
 * Получить все бренды
 */
export const getAllBrands = async (): Promise<Brand[]> => {
  const response = await http.get<CatalogResponse<Brand[]>>('/catalog/brands');
  return response.data.data || [];
};

/**
 * Получить подкатегории по категории
 */
export const getSubcategoriesByCategory = async (categoryId: string): Promise<Subcategory[]> => {
  const response = await http.get<CatalogResponse<Subcategory[]>>(`/catalog/category/${categoryId}/subcategories`);
  return response.data.data || [];
};

/**
 * Получить бренды по подкатегории
 */
export const getBrandsBySubcategory = async (subcategoryId: string): Promise<Brand[]> => {
  const response = await http.get<CatalogResponse<Brand[]>>(`/catalog/subcategory/${subcategoryId}/brands`);
  return response.data.data || [];
};

/**
 * Получить товары по подкатегории с фильтрами
 */
export const getProductsBySubcategory = async (
  subcategoryId: string,
  filters?: {
    brandIds?: string[];
    characteristics?: Record<string, any>;
  }
): Promise<Product[]> => {
  const params: any = {};
  if (filters?.brandIds && filters.brandIds.length > 0) {
    params.brandIds = JSON.stringify(filters.brandIds);
  }
  if (filters?.characteristics) {
    params.characteristics = JSON.stringify(filters.characteristics);
  }

  const response = await http.get<SearchProductsResponse>(
    `/catalog/subcategory/${subcategoryId}/products`,
    { params }
  );
  return response.data.data || [];
};

/**
 * Получить товары по бренду
 */
export const getProductsByBrand = async (brandId: string): Promise<Product[]> => {
  const response = await http.get<SearchProductsResponse>(`/catalog/brand/${brandId}/products`);
  return response.data.data || [];
};

/**
 * Получить категории с подкатегориями
 */
export const getCategoriesWithSubcategories = async (): Promise<CategoryWithSubcategories[]> => {
  const response = await http.get<CatalogResponse<CategoryWithSubcategories[]>>('/catalog/categories-with-subcategories');
  return response.data.data || [];
};

/**
 * Форматирование цены
 */
export const formatPrice = (price?: number): string => {
  if (!price) return 'Цена не указана';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Проверка наличия товара
 */
export const isInStock = (quantity?: number): boolean => {
  return quantity !== undefined && quantity > 0;
};

/**
 * Получить статус наличия
 */
export const getStockStatus = (quantity?: number): string => {
  if (!quantity || quantity === 0) return 'Нет в наличии';
  if (quantity < 5) return 'Мало';
  return 'В наличии';
};

/**
 * Получить класс для статуса наличия
 */
export const getStockStatusClass = (quantity?: number): string => {
  if (!quantity || quantity === 0) return 'text-red-500';
  if (quantity < 5) return 'text-yellow-500';
  return 'text-green-500';
};

// =====================================================
// ДОПОЛНИТЕЛЬНЫЕ ТИПЫ
// =====================================================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  productCount?: number;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description?: string;
  icon?: string;
  image?: string;
  orderIndex?: number;
  productCount?: number;
}

export interface CategoryWithSubcategories {
  id: string;
  name: string;
  count: number;
  subcategories: Subcategory[];
}

