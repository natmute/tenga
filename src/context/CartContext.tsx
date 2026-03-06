import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, Product, Shop } from '@/types';
import { getShopById } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600?text=Product';
const PLACEHOLDER_LOGO = 'https://placehold.co/200x200?text=Shop';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variants?: Record<string, string>, shop?: Shop) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartRow = {
  id: string;
  product_id: string | null;
  quantity: number;
  selected_variants: Record<string, string> | null;
  products: {
    id: string;
    shop_id: string;
    name: string;
    slug: string;
    price: number;
    original_price: number | null;
    description: string | null;
    in_stock: boolean | null;
    stock_count: number | null;
    rating: number | null;
    review_count: number | null;
    like_count: number | null;
    created_at: string | null;
    product_images?: { image_url: string }[];
    shops: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
      banner: string | null;
      bio: string | null;
      location: string | null;
    } | null;
  } | null;
};

function mapCartRowToItem(row: CartRow): CartItem | null {
  const p = row.products;
  const s = p?.shops;
  if (!p || !s) return null;
  const product: Product = {
    id: p.id,
    shopId: p.shop_id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    images: p.product_images?.length ? p.product_images.map((i) => i.image_url) : [PLACEHOLDER_IMAGE],
    description: p.description ?? '',
    category: '',
    inStock: p.in_stock ?? true,
    stockCount: p.stock_count ?? undefined,
    rating: p.rating ?? 0,
    reviewCount: p.review_count ?? 0,
    likeCount: p.like_count ?? 0,
    createdAt: p.created_at ?? '',
  };
  const shop: Shop = {
    id: s.id,
    name: s.name,
    slug: s.slug,
    logo: s.logo ?? PLACEHOLDER_LOGO,
    banner: s.banner ?? PLACEHOLDER_LOGO,
    bio: s.bio ?? '',
    category: '—',
    rating: 0,
    reviewCount: 0,
    followerCount: 0,
    productCount: 0,
    isVerified: false,
    location: s.location ?? undefined,
  };
  return {
    id: row.id,
    product,
    shop,
    quantity: row.quantity,
    selectedVariants: row.selected_variants ?? undefined,
  };
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  const loadCartFromSupabase = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*, product_images(image_url), shops(*))')
      .eq('user_id', user.id);
    if (error) {
      setCartLoaded(true);
      return;
    }
    const mapped = (data ?? [])
      .map((row) => mapCartRowToItem(row as unknown as CartRow))
      .filter((item): item is CartItem => item != null);
    setItems(mapped);
    setCartLoaded(true);
  }, [user]);

  useEffect(() => {
    if (user) {
      setCartLoaded(false);
      loadCartFromSupabase();
    } else {
      setCartLoaded(true);
    }
  }, [user, loadCartFromSupabase]);

  const addToCart = (product: Product, quantity = 1, variants?: Record<string, string>, shopParam?: Shop) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in or create an account to add items to your cart.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    const shop = shopParam ?? getShopById(product.shopId);
    if (!shop) return;

    setItems((current) => {
      const existingItemIndex = current.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedVariants ?? {}) === JSON.stringify(variants ?? {})
      );

      if (existingItemIndex > -1) {
        const newItems = [...current];
        const newQty = newItems[existingItemIndex].quantity + quantity;
        newItems[existingItemIndex] = { ...newItems[existingItemIndex], quantity: newQty };
        if (user && typeof newItems[existingItemIndex].id === 'string' && newItems[existingItemIndex].id.length === 36) {
          supabase
            .from('cart_items')
            .update({ quantity: newQty })
            .eq('id', newItems[existingItemIndex].id)
            .then(() => {});
        }
        return newItems;
      }

      const newItem: CartItem = {
        id: `temp-${product.id}-${Date.now()}`,
        product,
        shop,
        quantity,
        selectedVariants: variants,
      };
      if (user) {
        supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
            selected_variants: variants ?? null,
          })
          .select('id')
          .single()
          .then(({ data: row }) => {
            if (row) {
              setItems((prev) =>
                prev.map((item) =>
                  item.id === newItem.id ? { ...item, id: row.id } : item
                )
              );
            }
          });
      }
      return [...current, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    if (user && itemId.length === 36 && !itemId.startsWith('temp-')) {
      supabase.from('cart_items').delete().eq('id', itemId).eq('user_id', user.id).then(() => {});
    }
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (user && itemId.length === 36 && !itemId.startsWith('temp-')) {
          supabase.from('cart_items').update({ quantity }).eq('id', itemId).eq('user_id', user.id).then(() => {});
        }
        return { ...item, quantity };
      })
    );
  };

  const clearCart = () => {
    if (user) {
      supabase.from('cart_items').delete().eq('user_id', user.id).then(() => {});
    }
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
