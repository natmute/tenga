import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const WISHLIST_STORAGE_KEY = 'shop-social-wishlist';

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      setWishlistIds(Array.isArray(ids) ? ids : []);
    } catch {
      setWishlistIds([]);
    }
    setLoaded(true);
  }, []);

  const loadFromSupabase = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('product_likes')
      .select('product_id')
      .eq('user_id', user.id);
    const ids = (data ?? []).map((row) => row.product_id);
    setWishlistIds(ids);
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoaded(false);
      loadFromSupabase();
    } else {
      loadFromStorage();
    }
  }, [user, loadFromSupabase, loadFromStorage]);

  const persistGuest = useCallback((ids: string[]) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const addToWishlist = useCallback(
    (productId: string) => {
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in or create an account to add items to your wishlist.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }
      if (wishlistIds.includes(productId)) return;
      const next = [...wishlistIds, productId];
      setWishlistIds(next);
      supabase
        .from('product_likes')
        .insert({ user_id: user.id, product_id: productId })
        .then(() => {});
      // Record engagement for like count (1 like per user per product; never decreases)
      supabase
        .from('product_engagement')
        .upsert(
          { user_id: user.id, product_id: productId },
          { onConflict: 'user_id,product_id', ignoreDuplicates: true }
        )
        .then(() => {});
    },
    [user, wishlistIds, toast, navigate]
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      const next = wishlistIds.filter((id) => id !== productId);
      setWishlistIds(next);
      if (user) {
        supabase
          .from('product_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .then(() => {});
      } else {
        persistGuest(next);
      }
    },
    [user, wishlistIds, persistGuest]
  );

  const toggleWishlist = useCallback(
    (productId: string) => {
      if (wishlistIds.includes(productId)) {
        removeFromWishlist(productId);
      } else {
        addToWishlist(productId);
      }
    },
    [wishlistIds, addToWishlist, removeFromWishlist]
  );

  const value: WishlistContextType = {
    wishlistIds,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    wishlistCount: wishlistIds.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
