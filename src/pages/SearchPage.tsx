import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Loader2, Store, Package, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import ShopCard from '@/components/shop/ShopCard';
import { fetchCategories } from '@/data/categories';
import type { Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import type { Product, Shop } from '@/types';

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600?text=Product';
const PLACEHOLDER_LOGO = 'https://placehold.co/200x200?text=Shop';

function mapDbProductToProduct(row: {
  id: string;
  shop_id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  product_images?: { image_url: string }[];
  shops?: { name: string; slug: string; logo: string | null; categories?: { name: string } | null } | null;
}): Product {
  const images = row.product_images?.length ? row.product_images.map((i) => i.image_url) : [PLACEHOLDER_IMAGE];
  const categoryName = row.shops?.categories?.name ?? '';
  return {
    id: row.id,
    shopId: row.shop_id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    images,
    description: row.description ?? '',
    category: categoryName,
    inStock: true,
    rating: 0,
    reviewCount: 0,
    likeCount: 0,
    createdAt: '',
  };
}

function mapDbRowToShop(row: {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  bio: string | null;
  location: string | null;
  categories?: { name: string } | null;
}): Shop {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo ?? PLACEHOLDER_LOGO,
    banner: row.banner ?? PLACEHOLDER_LOGO,
    bio: row.bio ?? '',
    category: row.categories?.name ?? '—',
    rating: 0,
    reviewCount: 0,
    followerCount: 0,
    productCount: 0,
    isVerified: true,
    location: row.location ?? undefined,
  };
}

function matchesSearchTerms(text: string, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const lower = text.toLowerCase();
  return terms.every((t) => lower.includes(t));
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const qFromUrl = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(qFromUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInputValue(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => {
    (async () => {
      const { data: shopRows } = await supabase
        .from('shops')
        .select('id, name, slug, logo, banner, bio, location, categories(name)')
        .eq('is_verified', true);
      if (!shopRows?.length) {
        setProducts([]);
        setShops([]);
        setLoading(false);
        return;
      }
      const shopIds = shopRows.map((s) => s.id);
      const shopMap: Record<string, Shop> = {};
      shopRows.forEach((r) => {
        shopMap[r.id] = mapDbRowToShop(r);
      });

      const { data: productRows } = await supabase
        .from('products')
        .select('*, product_images(image_url), shops(name, slug, logo, categories(name))')
        .in('shop_id', shopIds);
      const rows = productRows ?? [];
      const productIds = rows.map((r) => r.id);
      let ratingByProduct: Record<string, { sum: number; count: number }> = {};
      if (productIds.length > 0) {
        const { data: reviewRows } = await supabase.from('reviews').select('product_id, rating').in('product_id', productIds);
        (reviewRows ?? []).forEach((r) => {
          const id = r.product_id;
          if (!id || r.rating == null) return;
          if (!ratingByProduct[id]) ratingByProduct[id] = { sum: 0, count: 0 };
          ratingByProduct[id].sum += r.rating;
          ratingByProduct[id].count += 1;
        });
      }
      const productsMapped = rows.map((row) => {
        const p = mapDbProductToProduct(row);
        const agg = ratingByProduct[row.id];
        if (agg && agg.count > 0) {
          p.rating = Math.round((agg.sum / agg.count) * 10) / 10;
          p.reviewCount = agg.count;
        }
        return p;
      });
      setProducts(productsMapped);

      const { data: productCountRows } = await supabase.from('products').select('id, shop_id').in('shop_id', shopIds);
      const countByShop: Record<string, number> = {};
      (productCountRows ?? []).forEach((p) => {
        countByShop[p.shop_id] = (countByShop[p.shop_id] ?? 0) + 1;
      });
      const { data: followerRows } = await supabase.from('shop_followers').select('shop_id').in('shop_id', shopIds);
      const followerByShop: Record<string, number> = {};
      (followerRows ?? []).forEach((r) => {
        followerByShop[r.shop_id] = (followerByShop[r.shop_id] ?? 0) + 1;
      });
      const shopsMapped = shopRows.map((row) => {
        const s = mapDbRowToShop(row);
        s.productCount = countByShop[row.id] ?? 0;
        s.followerCount = followerByShop[row.id] ?? 0;
        return s;
      });
      setShops(shopsMapped);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const searchTerms = useMemo(
    () =>
      qFromUrl
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [qFromUrl]
  );

  const filteredCategories = useMemo(() => {
    if (searchTerms.length === 0) return [];
    return categories.filter((cat) => {
      const text = [cat.name, cat.slug].join(' ').toLowerCase();
      return searchTerms.every((t) => text.includes(t));
    });
  }, [searchTerms, categories]);

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const text = [shop.name, shop.bio ?? '', shop.category].join(' ').toLowerCase();
      return matchesSearchTerms(text, searchTerms);
    });
  }, [shops, searchTerms]);

  const getShopForProduct = (product: Product): Shop | undefined =>
    shops.find((s) => s.id === product.shopId);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const shop = getShopForProduct(product);
      const text = [
        product.name,
        product.description ?? '',
        product.category,
        shop?.name ?? '',
      ].join(' ').toLowerCase();
      return matchesSearchTerms(text, searchTerms);
    });
  }, [products, searchTerms, shops]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (q) {
      setSearchParams({ q }, { replace: true });
    }
  };

  const hasQuery = searchTerms.length > 0;
  const hasResults = filteredCategories.length > 0 || filteredShops.length > 0 || filteredProducts.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />
      <main className="container py-6 sm:py-8 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold mb-2"
        >
          Search
        </motion.h1>
        <p className="text-muted-foreground mb-6">
          Find products, shops, and categories
        </p>

        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="relative max-w-xl flex gap-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search products, shops, categories..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 pl-10 pr-3 py-2.5 bg-secondary border border-border text-base"
              aria-label="Search"
            />
            <Button type="submit" className="shrink-0">
              Search
            </Button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !hasQuery ? (
          <p className="text-muted-foreground py-8">Enter a search term to find products, shops, and categories.</p>
        ) : !hasResults ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No results for &quot;{qFromUrl}&quot;</h3>
            <p className="text-muted-foreground">Try different keywords or browse Discover and Shops.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Tags className="h-5 w-5" />
                  Categories ({filteredCategories.length})
                </h2>
                <div className="flex flex-wrap gap-3">
                  {filteredCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                    <Link
                      key={cat.id}
                      to={`/discover?category=${encodeURIComponent(cat.name)}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-card hover:shadow-card-hover transition-shadow border border-border"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{cat.name}</span>
                    </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {filteredShops.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Store className="h-5 w-5" />
                  Shops ({filteredShops.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredShops.map((shop, i) => (
                    <ShopCard key={shop.id} shop={shop} index={i} />
                  ))}
                </div>
              </section>
            )}

            {filteredProducts.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Package className="h-5 w-5" />
                  Products ({filteredProducts.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredProducts.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      shop={getShopForProduct(product)}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
