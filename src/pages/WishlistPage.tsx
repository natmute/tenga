import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Loader2, ShoppingBag, ShoppingCart } from 'lucide-react';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Product, Shop } from '@/types';
import { cn } from '@/lib/utils';

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600?text=Product';
const PLACEHOLDER_LOGO = 'https://placehold.co/200x200?text=Shop';

function mapDbRowToProduct(row: {
  id: string;
  shop_id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  product_images?: { image_url: string }[];
  shops?: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    banner: string | null;
    bio: string | null;
    location: string | null;
  } | null;
}): { product: Product; shop: Shop } {
  const images = row.product_images?.length
    ? row.product_images.map((i) => i.image_url)
    : [PLACEHOLDER_IMAGE];
  const s = row.shops;
  const shop: Shop = s
    ? {
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
        isVerified: true,
        location: s.location ?? undefined,
      }
    : {
        id: row.shop_id,
        name: 'Shop',
        slug: '',
        logo: PLACEHOLDER_LOGO,
        banner: PLACEHOLDER_LOGO,
        bio: '',
        category: '—',
        rating: 0,
        reviewCount: 0,
        followerCount: 0,
        productCount: 0,
        isVerified: false,
      };
  const product: Product = {
    id: row.id,
    shopId: row.shop_id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    images,
    description: '',
    category: '',
    inStock: true,
    rating: 0,
    reviewCount: 0,
    likeCount: 0,
    createdAt: '',
  };
  return { product, shop };
}

const WishlistPage = () => {
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();
  const { toast } = useToast();
  const [items, setItems] = useState<{ product: Product; shop: Shop }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('products')
      .select('*, product_images(image_url), shops(*)')
      .in('id', wishlistIds)
      .then(({ data: rows }) => {
        const fromDb = (rows ?? []).map((r) => mapDbRowToProduct(r as Parameters<typeof mapDbRowToProduct>[0]));
        setItems(fromDb);
        setLoading(false);
      });
  }, [wishlistIds]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(items.map((i) => i.product.id)));
    else setSelectedIds(new Set());
  };

  const toggleSelect = (productId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const moveSelectedToCart = () => {
    if (!someSelected) return;
    setMoving(true);
    const toMove = items.filter((i) => selectedIds.has(i.product.id));
    toMove.forEach(({ product, shop }) => {
      addToCart(product, 1, undefined, shop);
    });
    toMove.forEach(({ product }) => removeFromWishlist(product.id));
    setSelectedIds(new Set());
    setMoving(false);
    setIsCartOpen(true);
    toast({
      title: 'Moved to cart',
      description: toMove.length === 1
        ? '1 item added to your cart.'
        : `${toMove.length} items added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />

      <main className="flex-1 container py-8">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Your Wishlist</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 rounded-xl border border-border bg-card"
          >
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Save items you like by tapping the heart on any product. They’ll show up here.
            </p>
            <Link to="/discover">
              <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <ShoppingBag className="h-4 w-4" />
                Discover products
              </span>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Toolbar: select all + move to cart */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                />
                <span className="text-sm font-medium">
                  {allSelected ? 'Deselect all' : 'Select all'}
                </span>
              </label>
              <div className="flex items-center gap-3">
                {someSelected && (
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size} selected
                  </span>
                )}
                <Button
                  onClick={moveSelectedToCart}
                  disabled={!someSelected || moving}
                  className="gap-2"
                >
                  {moving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                  Move to cart
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {items.map(({ product, shop }, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative"
                >
                  <div
                    className={cn(
                      'rounded-2xl transition-shadow',
                      selectedIds.has(product.id) && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    )}
                  >
                    <div
                      className="absolute left-3 top-3 z-10"
                      onClick={(e) => e.preventDefault()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.has(product.id)}
                        onCheckedChange={(checked) => toggleSelect(product.id, !!checked)}
                        className="h-5 w-5 rounded border-2 bg-background/90 shadow"
                      />
                    </div>
                    <ProductCard product={product} shop={shop} index={index} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
