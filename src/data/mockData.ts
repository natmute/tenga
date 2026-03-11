import type { Shop, Product } from '@/types';

export const categories: never[] = [];
export const shops: Shop[] = [];
export const products: Product[] = [];

export const getShopById = (_id: string): Shop | undefined => undefined;
export const getProductsByShopId = (_shopId: string): Product[] => [];
export const getProductById = (_id: string): Product | undefined => undefined;
export const getFeaturedShops = (): Shop[] => [];
export const getTrendingProducts = (): Product[] => [];
