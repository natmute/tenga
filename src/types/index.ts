export interface Shop {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  bio: string;
  category: string;
  rating: number;
  reviewCount: number;
  followerCount: number;
  productCount: number;
  isVerified: boolean;
  location?: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  category: string;
  variants?: ProductVariant[];
  inStock: boolean;
  stockCount?: number;
  rating: number;
  reviewCount: number;
  likeCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'size' | 'color' | 'style';
  options: string[];
}

export interface CartItem {
  id: string;
  product: Product;
  shop: Shop;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
}
